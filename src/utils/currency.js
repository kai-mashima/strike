import firebase from 'firebase/app';

//if a streak is terminated, this function should be called to handle currency related termination penalties
const streakTermination = function(streakID) { 
    let streak = null;
    this.getStreak(streakID).then(result => {
        streak = result;
    });

    const terminatorPayment = this.calculateStreakTerminatorTerminationPrice(streak.value);
    const betrayedPayment = this.calculateStreakBetrayedTerminationPrice(streak.value);

    let terminator = null;
    this.getUser(streak.currentOwner).then(result => {
        terminator = result;
        this.decreaseUserValue(streak.terminator, terminator.value, terminatorPayment);
    });

    let betrayed = null;
    this.getUser(streak.nextOwner).then(result => {
        betrayed = result;
        this.decreaseUserValue(streak.betrayed, betrayed.value, betrayedPayment);   
    });

    if (this.state.userID === streak.currentOwner) {
        console.log(`Streak Termination: User value decreased by $${terminatorPayment}`);
    } else {
        console.log(`Streak Termination: User value decreased by $${betrayedPayment}`);
    }
};

//returns an array of payments for the terminator and betrayed from a terminated streak
const calculateStreakTerminatorTerminationPrice = function(streakValue) {
    let payment = streakValue * .75;

    if (payment < 5) {
        payment = 5;
    } 

    return payment;
};

//returns an array of payments for the terminator and betrayed from a terminated streak
const calculateStreakBetrayedTerminationPrice = function(streakValue) {
    let payment = streakValue * .25;

    if (payment < 5) {
        payment = 5;
    }

    return payment;
};

//updates a users value based on currenctValue and the amount to increase the currency by
const increaseUserValue = function(userID, currentValue, currencyAmount) {
    let newValue = currentValue + currencyAmount;

    this.db.ref(`users/${userID}`).update({
        value: newValue
    });
};

//updates a users value based on currenctValue and the amount to decrease the currency by
const decreaseUserValue = function(userID, currentValue, currencyAmount) {
    let newValue = currentValue - currencyAmount;

    if (newValue < 0) {
        newValue = 0;
    }

    this.db.ref(`users/${userID}`).update({
        value: newValue
    });
};

//updates a streaks value based on currenctValue and the amount to change the currency by
const updateStreakValue = function(streakID, currentValue, currencyAmount) {
    let newValue = currentValue + currencyAmount;

    this.db.ref(`streaks/${streakID}`).update({
        value: newValue
    });
};

//calculate the price of stoking a streak based on streak info
const calculateStokePrice = function(streak) {
    let stokePrice = streak.value * .25;

    if (stokePrice < 5) {
        stokePrice = 5;
    }

    return stokePrice;
};

//updates both the streak value and user value for a streak that has been stoked
const streakStoke = function(streakID, userID) {
    this.getStreak(streakID).then(streak => {
        let stokePrice = this.calculateStokePrice(streak);

        this.updateStreakValue(streakID, streak.value, stokePrice);

        return stokePrice;
    }).then(stokePrice => {
        this.getUser(userID).then(user => {
            console.log(`Streak Stoke: User value decreased by $${stokePrice}`);

            this.decreaseUserValue(userID, user.value, stokePrice);
        });
        console.log(`Streak Stoked for $${stokePrice}`);
    });
};

//updates a streaks value and the users value for a streak boost
const streakBoost = function(streakID, userID, currencyAmount) {
    this.getStreak(streakID).then(streak => {
        this.updateStreakValue(streakID, streak.value, currencyAmount);
    });

    this.getUser(userID).then(user => {
        console.log(`Streak Boost: User value decreased by $${currencyAmount}`);

        this.decreaseUserValue(userID, user.value, currencyAmount);
    });
};

//checks a streak for past payouts and updates the streak participants value
const checkforStreakPayouts = function(streakID) {
    this.getStreak(streakID).then(streak => {
        let lastChecked;

        if (streak.lastChecked) {
            lastChecked = streak.lastChecked;
        } else {
            lastChecked = 0;
        }

        const start = streak.timestamp;
        const difference = start - lastChecked;
        const numberOfPayments = this.convertTimestampToDays(difference);
        const payment = this.calculateStreakPayout(streak);
        const paymentAmount = payment * numberOfPayments;

        let info = [];
        info.push(streak);
        info.push(paymentAmount);

        return info;
    }).then(info => {
        const streak = info[0];
        const funcs = Object.keys(streak.participants).map(participant => this.getUser(participant));

        return Promise.all(funcs).then(results => {
            info.push(results)
            return info;
        });
    }).then(info => {
        const streak = info[0];
        const paymentAmount = info[1];
        const users = info[2];

        console.log(`Streak Payout: User value increased by $${paymentAmount}`);

        Object.keys(streak.participants).map((participant, index) => 
            this.increaseUserValue(participant, users[index].value, paymentAmount)
        );

        const date = new Date();
        const time = date.getTime();
        this.db.ref(`streaks/${streakID}`).update({
            lastChecked: time
        });
    });
};

const calculateStreakPayout = function(streak) {
    let payout = .1 * (streak.days * streak.value);

    if (payout < 5) {
        payout = 5;
    }

    return payout;
};

const checkForDailyAllowance = function(userID) {
    this.getUser(userID).then(user => {
        let lastChecked = null;

        if (user.lastChecked) {
            lastChecked = user.lastChecked;
        } else {
            lastChecked = 0;
        }

        const start = user.created;
        const difference = start - lastChecked;
        const numberOfPayments = this.convertTimestampToDays(difference);

        //fix to check for each allowance every 24 hours 
        const payment = this.calculateDailyAllowance(user, userID);
        const payments = payment * numberOfPayments;

        console.log(`Daily Allowance: User value increased by $${payments}`);

        this.increaseUserValue(userID, user.value, payments);

        const date = new Date();
        const time = date.getTime();
        this.db.ref(`users/${userID}`).update({
            lastChecked: time
        });
    });
};

//determines how much a users daily allowance is
const calculateDailyAllowance = function(user, userID) {
    this.getNumberOfFriends(userID).then(numberOfFriends => {
        this.getNumberOfStreaks(userID).then(numberOfStreaks => {
            let dailyAllowance = (numberOfStreaks / numberOfFriends) * (numberOfFriends * 5);

            if (dailyAllowance < 10) {
                dailyAllowance = 10;
            }

            return dailyAllowance;
        });
    });
};

export {
    streakTermination,
    calculateStreakTerminatorTerminationPrice,
    calculateStreakBetrayedTerminationPrice,
    increaseUserValue,
    decreaseUserValue,
    updateStreakValue,
    calculateStokePrice,
    streakStoke,
    streakBoost,
    checkforStreakPayouts,
    calculateStreakPayout,
    checkForDailyAllowance,
    calculateDailyAllowance,
};