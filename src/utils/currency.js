import firebase from 'firebase/app';

//if a streak is terminated, this function should be called to handle currency related termination penalties
const streakTermination = function(streakID) { 
    let streak = null;
    this.getStreak(streakID).then(result => {
        streak = result;
    });

    let payments = this.calculateStreakTP(streak.value, streak.terminator, streak.betrayed);
    const terminatorPayment = payments[0];
    const betrayedPayment = payments[1];

    let terminator = null;
    this.getUser(userID).then(result => {
        terminator = result;
    });
    let betrayed = null;
    this.getUser(userID).then(result => {
        betrayed = result;
    });

    this.updateUserValue(streak.terminator, terminator.value, -terminatorPayment);
    this.updateUserValue(streak.betrayed, betrayed.value, -betrayedPayment);   
};

//returns an array of payments for the terminator and betrayed from a terminated streak
const calculateStreakTP = function(streakValue, terminatorID, betrayedID) {
    let payments = [];
    payments[0] = streakValue * .75;
    payments[1] = streakValue * .25;
    return payments;
};

//updates a users value based on currenctValue and the amount to change the currency by
const updateUserValue = function(userID, currentValue, currencyAmount) {
    let newValue = currentValue + currencyAmount;
    if (newValue < 0) {
        newValue = 0;
    }
    this.db.ref(`users/${userID}`)
    .update({
        value: newValue
    });
};

//updates a streaks value based on currenctValue and the amount to change the currency by
const updateStreakValue = function(streakID, currentValue, currencyAmount) {
    let newValue = currentValue + currencyAmount;
    this.db.ref(`streaks/${userID}`)
    .update({
        value: newValue
    });
};

//calculate the price of stoking a streak based on streak info
const calculateStokePrice = function(streak) {
    let stokePrice = 0;
    stokePrice = streak.value * .25;
    return stokePrice;
};

//updates both the streak value and user value for a streak that has been stoked
const streakStoke = function(streakID, userID) {
    this.getStreak(streakID).then(result => {
        let streak = result;
        let stokePrice = this.calculateStokePrice(streak);
        this.updateStreakValue(streakID, streak.value, stokePrice);
        return stokePrice;
    }).then(stokePrice => {
        this.getUser(userID).then(result => {
            let user = result;
            this.updateUserValue(userID, user.value, -stokePrice);
        });
    })
};

//updates a streaks value and the users value for a streak boost
const streakBoost = function(streakID, userID, currencyAmount) {
    this.getStreak(streakID).then(result => {
        let streak = result;
        this.updateStreakValue(streakID, streak.value, currencyAmount);
    });

    this.getUser(userID).then(result => {
        let user = result;
        this.updateUserValue(userID, user.value, -currencyAmount);
    });
};

//checks a streak for past payouts and updates the streak participants value
const checkforStreakPayouts = function(streakID) {
    this.getStreak(streakID).then(result => {
        let streak = result;
        return streak;
    }).then(streak => {
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
        console.log(info);
        Object.keys(streak.participants).map((participant, index) => 
            this.updateUserValue(participant, users[index].value, paymentAmount)
        );

        const date = new Date();
        const time = date.getTime();
        this.db.ref(`streaks/${streakID}`).update({
            lastChecked: time
        });
    });
};

const calculateStreakPayout = function(streak) {
    let payout = 0;
    payout = .1 * (streak.days * streak.value);
    return payout;
};

const checkForDailyAllowance = function(userID) {
    this.getUser(userID).then(result => {
        let user = result;
        return user;
    }).then(user => {
        let lastChecked = null;
        let start = null;

        if (user.lastChecked) {
            lastChecked = user.lastChecked;
        } else {
            lastChecked = 0;
        }

        start = user.created;
        const difference = start - lastChecked;
        const numberOfPayments = this.convertTimestampToDays(difference);

        //fix to check for each allowance every 24 hours 
        const payment = this.calculateDailyAllowance(user, userID);
        const payments = payment * numberOfPayments;
        this.updateUserValue(userID, user.value, payments);

        const date = new Date();
        const time = date.getTime();
        this.db.ref(`users/${userID}`).update({
            lastChecked: time
        });
    });
};

//determines how much a users daily allowance is
const calculateDailyAllowance = function(user, userID) {
    let dailyAllowance = 0;
    let friends = 0;
    let streaks = 0;

    this.getNumberOfFriends(userID).then(result => {
        friends = result;
    });
    this.getNumberOfStreaks(userID).then(result => {
        streaks = result;
    });

    dailyAllowance = (streaks / friends) * (friends * 5);
    return dailyAllowance;
};

export {
    streakTermination,
    calculateStreakTP,
    updateUserValue,
    updateStreakValue,
    calculateStokePrice,
    streakStoke,
    streakBoost,
    checkforStreakPayouts,
    calculateStreakPayout,
    checkForDailyAllowance,
    calculateDailyAllowance,
};