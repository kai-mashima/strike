import firebase from 'firebase/app';

//if a streak is terminated, this function should be called to handle currency related termination penalties
const streakTermination = function(streakID) { 
    this.getStreak(streakID).then(result => {
        const streak = result;
        const terminatorPayment = this.calculateStreakTerminatorTerminationPrice(streak.value);
        const betrayedPayment = this.calculateStreakBetrayedTerminationPrice(streak.value);

        this.getUser(streak.currentOwner).then(result => {
            const terminator = result;
            this.decreaseUserValue(streak.terminator, terminator.value, terminatorPayment);
        });

        this.getUser(streak.nextOwner).then(result => {
            const betrayed = result;
            this.decreaseUserValue(streak.betrayed, betrayed.value, betrayedPayment);   
        });

        if (this.state.userID === streak.currentOwner) {
            console.log(`Streak Termination: User value decreased by $${terminatorPayment}`);
        } else {
            console.log(`Streak Termination: User value decreased by $${betrayedPayment}`);
        }
    });
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

        this.getUser(userID).then(user => {
            console.log(`Streak Stoke: User value decreased by $${stokePrice}`);
            if (user.value > stokePrice) {
                console.log(`Streak Stoked for $${stokePrice}`);
                this.decreaseUserValue(userID, user.value, stokePrice); 
                this.updateStreakValue(streakID, streak.value, stokePrice);
            } else {
                console.log('Streak Stoke: User has insufficient value to complete this action');
            }
        });
    });
};

//updates a streaks value and the users value for a streak boost
const streakBoost = function(streakID, userID, currencyAmount) {
    this.getUser(userID).then(user => {
        if (user.value > stokePrice) {
            console.log(`Streak Boost: User value decreased by $${currencyAmount}`);
            this.decreaseUserValue(userID, user.value, currencyAmount);
            this.getStreak(streakID).then(streak => {
                this.updateStreakValue(streakID, streak.value, currencyAmount);
            });
        } else {
            console.log('Streak Stoke: User has insufficient value to complete this action');
        }
    });
};

//checks a streak for past payouts and updates the streak participants value
const checkforStreakPayouts = function(streakID) {
    this.getStreak(streakID).then(streak => {
        let lastChecked;
        const date = new Date();
        const now = date.getTime();

        if (streak.lastChecked) {
            lastChecked = streak.lastChecked;
        } else {
            lastChecked = now;
        }

        const numberOfPayments = this.convertPastTimestampToDays(lastChecked);
        const payment = this.calculateStreakPayout(streak);
        const paymentAmount = payment * numberOfPayments;

        let info = [];
        info.push(streak);
        info.push(paymentAmount);
        info.push(now);

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
        const now = info[2];
        const users = info[3];

        console.log(`Streak Payout: User value increased by $${paymentAmount}`);

        Object.keys(streak.participants).map((participant, index) => 
            this.increaseUserValue(participant, users[index].value, paymentAmount)
        );

        this.db.ref(`streaks/${streakID}`).update({
            lastChecked: now
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
        let lastChecked;
        const date = new Date();
        const now = date.getTime();

        if (user.lastChecked) {
            lastChecked = user.lastChecked;
        } else {
            lastChecked = now;
        }

        const numberOfPayments = this.convertPastTimestampToDays(lastChecked);

        //fix to check for each allowance every 24 hours 
        this.calculateDailyAllowance(user, userID).then(payment => {
            const payments = payment * numberOfPayments;

            console.log(`Daily Allowance: User value increased by $${payments}`);

            this.increaseUserValue(userID, user.value, payments);
        });
  
        this.db.ref(`users/${userID}`).update({
            lastChecked: now
        });
    });
};

//determines how much a users daily allowance is
const calculateDailyAllowance = function(user, userID) {
    return this.getNumberOfFriends(userID).then(numberOfFriends => {
        return this.getNumberOfStreaks(userID).then(numberOfStreaks => {
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