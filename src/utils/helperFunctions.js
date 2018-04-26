import firebase from 'firebase/app';

//Grab and returns just the username of a user by id
const getUsername = function(userID) {
    return this.db.ref(`users/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            return snapshot.val().username;
        } else {
            throw 'Get Username: No user found';
        }
    }).catch(reason => {
        console.log(reason);
    });
};

//returns a promise containing the streak info 
const getStreak = function(streakID) {
    return this.db.ref(`streaks/${streakID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            return snapshot.val()
        } else {
            throw 'Get Streak: No streak found for this streak ID';
        }
    }).catch(reason => {
        console.log(reason);
    });
};

const getTerminatedStreak = function(streakID) {
    return this.db.ref(`terminatedStreaks/${streakID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            return snapshot.val()
        } else {
            throw 'Get Streak: No streak found for this streak ID';
        }
    }).catch(reason => {
        console.log(reason);
    });
};

//returns a promise containing the user info 
const getUser = function(userID) {
    return this.db.ref(`users/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            return snapshot.val()
        } else {
            throw 'Get Streak: No streak found for this streak ID';
        }
    }).catch(reason => {
        console.log(reason);
    });
};

const getNumberOfFriends = function(userID) {
    return this.db.ref(`friends/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            const friends = snapshot.val();
            const numberFriends = Object.keys(friends).length;
            return numberFriends;
        } else {
            return 0;
        }
    }).catch(reason => {
        console.log(reason);
    });
};

const getNumberOfTotalStreakDays = function(userID) {
    return this.db.ref(`streakOwners/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let total = 0;
            const streaks = Object.keys(snapshot.val());
            const funcs = streaks.map(streakID => {
                return this.db.ref(`streaks/${streakID}`)
                .once('value')
                .then(snapshot => {
                    if (snapshot.exists()) {
                        let streak = snapshot.val();
                        if (streak.days) {
                            return streak.days;
                        } else {
                            return 0;
                        }
                    } else {
                        return 0;
                    }
                });
            });

            return Promise.all(funcs).then(results => {
                total = results.reduce((a, b) => Number(a) + Number(b), 0);
                return total;
            });
        } else {
            return 0;
        }
    }).catch(reason => {
        console.log(reason);
    });
};

const getNumberOfStreaks = function(userID) {
    return this.db.ref(`streakOwners/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            const streaks = snapshot.val();
            const numberStreaks = Object.keys(streaks).length;
            return numberStreaks;
        } else {
            return 0;
        }
    }).catch(reason => {
        console.log(reason);
    });
};

const getNumberOfTerminatedStreaks = function(userID) {
    return this.db.ref(`terminatedStreakOwners/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            const terminatedStreaks = snapshot.val();
            const numberOfTerminatedStreaks = Object.keys(terminatedStreaks).length;
            return numberOfTerminatedStreaks;
        } else {
            return 0;
        }
    }).catch(reason => {
        console.log(reason);
    });
};

const convertPastTimestampToDays = function(timestamp) {
    const date = new Date();
    const now = date.getTime();
    let days = ((now - timestamp) / (3600000 * 24)).toFixed(0);
    return days;
};

const convertFutureTimestampToHours = function(timestamp) {
    const date = new Date();
    const now = date.getTime();
    let hours = ((timestamp - now) / (3600000)).toFixed(0);
    return hours;
};

const convertTimeDifferenceToDays = function(timestamp) {
    let days = (timestamp / (3600000 * 24)).toFixed(0);
    return days;
};

const getDate = function() {
    const newDate = new Date();
    const date = newDate.getTime();
    return date;
};

export {
    getUsername,
    getStreak,
    getTerminatedStreak,
    getUser,
    getNumberOfFriends,
    getNumberOfTotalStreakDays,
    getNumberOfStreaks,
    getNumberOfTerminatedStreaks,
    convertPastTimestampToDays,
    convertFutureTimestampToHours,
    convertTimeDifferenceToDays,
    getDate,
}