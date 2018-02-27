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

    this.updateUserValue(streak.terminator, terminator.value, terminatorPayment);
    this.updateUserValue(streak.betrayed, betrayed.value, betrayedPayment);   
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
    let streak = null;
    this.getStreak(streakID).then(result => {
        streak = result;
    });

    let user = null;
    this.getUser(userID).then(result => {
        user = result;
    });

    let stokePrice = this.calculateStokePrice(streak);

    this.updateStreakValue(streakID, streak.value, stokePrice);
    this.updateUserValue(userID, user.value, -stokePrice);
};

//updates a streaks value and the users value for a streak boost
const streakBoost = function(streakID, userID, currencyAmount) {
    let streak = null;
    this.getStreak(streakID).then(result => {
        streak = result;
    });
    let user = null;
    this.getUser(userID).then(result => {
        user = result;
    });
    this.updateStreakValue(streakID, streak.value, currencyAmount);
    this.updateUserValue(userID, user.value, -currencyAmount);
};

//checks a streak for past payouts and updates the streak participants value
const checkforStreakPayouts = function(streakID) {
    let streak = null;
    this.getStreak(streakID).then(result => {
        streak = result
    });

    const user1 = streak.participants[0];
    const user2 = streak.participants[1];

    let user1Info = null;
    let user2Info = null;

    this.getUser(streak.participants[0]).then(result => {
        user1Info = result;
    });

    this.getUser(streak.participants[1]).then(result => {
        user2Info = result;
    });

    let lastChecked = null;
    let start = null;

    if (streak.lastChecked) {
        lastChecked = streak.lastChecked;
    } else {
        lastChecked = 0;
    }

    start = streak.timestamp;
    const difference = start - lastChecked;
    const numberOfPayments = this.convertTimestampToDays(difference);
    
    const payment = this.calculateStreakPayout(streak);
    const payments = payment * numberOfPayments;

    this.updateUserValue(user1, user1Info.value, payments);
    this.updateUserValue(user2, user2Info.value, payments);

    const date = new Date();
    const time = date.getTime();
    this.db.ref(`streaks/${streakID}`).update({
        lastChecked: time
    });
};

const calculateStreakPayout = function(streak) {
    let payout = 0;
    payout = .1 * (streak.days * streak.value);
    return payout;
};

const checkForDailyAllowance = function(userID) {
    let user = null;
    this.getUser(userID).then(result => {
        user = result;
    });

    let lastChecked = null;
    let start = null;

    if (user.lastChecked) {
        lastChecked = user.lastChecked;
    } else {
        lastChecked = 0;
    }

    start = user.created;
    let difference = start - lastChecked;
    let numberOfPayments = this.convertTimestampToDays(difference);

    //fix to check for each allowance every 24 hours 
    let payment = this.calculateDailyAllowance(user, userID);
    let payments = payment * numberOfPayments;
    this.updateUserValue(userID, user.value, payments);

    const date = new Date();
    const time = date.getTime();
    this.db.ref(`users/${userID}`).update({
        lastChecked: time
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
    dailyAllowance = (streaks/friends) * (friends * 5);
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