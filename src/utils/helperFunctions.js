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
            throw 'No friends found for this user';
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
            throw 'No streaks found for this user';
        }
    }).catch(reason => {
        console.log(reason);
    });
};

const convertTimestampToDays = function(timestamp) {
    const newDate = new Date();
    const date = newDate.getTime();
    let days = ((date - timestamp) / (3600000 * 24)).toFixed(0);
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
    getUser,
    getNumberOfFriends,
    getNumberOfStreaks,
    convertTimestampToDays,
    getDate,
}