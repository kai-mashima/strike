import firebase from 'firebase/app';

//adds a new streak to both users streak lists and the streak list
const startStreak = function(userID, friendID) {
    if (userID !== friendID) {
        let time = this.getDate();
        let expirationDate = this.getDate24HoursAhead();
        let expirationTime = this.convertDateToTimeDifference(expirationDate);
        const newStreakID = this.db.ref().child('streaks').push().key;
        this.db.ref(`streaks/${newStreakID}`)
        .set({
            participants: {
                [userID]: true,
                [friendID]: true,
            },
            terminated: false,
            neutral: false,
            value: 0,
            days: 0,
            allowance: 1,
            penalty: 0,
            timestamp: time,
            currentOwner: friendID,
            currentExpirationDate: expirationDate,
            currentExpirationTime: expirationTime,
            currentExpired: false,
            nextOwner: userID,
            nextExpirationDate: 0,
            nextExpirationTime: 0,
            nextExpired: true,
            lastChecked: null,
        }).then(() => {
            this.streakToOwner(friendID, newStreakID);
            this.streakToOwner(userID, newStreakID);
            this.streakStoke(newStreakID, userID);
        }).then(() => {
            this.getStreaks(userID);
        });
    } else {
        console.log('No streak started: You cannot start a streak with yourself.');
    }
};

//grabs and sets state to the streaks by user id
const getStreaks = function(userID) {
    this.db.ref(`streakOwners/${userID}`) //grab streak list from streakOwners db
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let streaks = Object.keys(snapshot.val());
            this.setState({
                streaks: streaks
            });
            return streaks;
        } else {
            throw 'No owners found for this user ID';
        }
    }).then(streakList => {
        const streakFuncs = streakList.map(streakID => this.checkForExpiredStreaks(streakID));
        return Promise.all(streakFuncs).then(results => results);
    }).then(streakList => {
        const infoFuncs = streakList.map(streakID => this.streakToInfo(streakID, userID));
        Promise.all(infoFuncs).then(results => {
            results = results.filter(n => n);
            this.setState({
                streaksInfo: results
            });
        });
        return streakList;
    }).then(streakList => {
        streakList.map(streakID => this.checkforStreakPayouts(streakID));
    }).catch(reason => {
        console.log(reason);
    });
};

//returns a promise containing the information of a streak by streak id
const streakToInfo = function(streakID, userID){
    let streak = null;
    return this.db.ref(`streaks/${streakID}`)
    .once('value')
    .then(snapshot => { 
        if (snapshot.exists()) {
            streak = snapshot.val();
            streak.id = streakID;
            streak.days = this.convertTimestampToDays(streak.timestamp);
            Object.keys(streak.participants).map(participant => {
                if (participant === userID) {
                    this.getUsername(participant).then(username => {
                        streak.user = username;
                    });
                } else {
                    this.getUsername(participant).then(username => {
                        streak.friend = username;
                        streak.friendTurn = streak.participants[participant];
                    });
                } 
            });
        }
    }).then(() => {
        return streak;
    }).catch(reason => {
        console.log(reason);
    });
};

const getDate24HoursAhead = function() {
    const newdate = new Date();
    const date = newdate.getTime();
    let newDate = date + (24 * 3600000);
    return newDate;
};

const getDate24HoursAheadOfGiven = function(date) {
    let result = date + (24 * 3600000);
    return result;
};

//toggles and resests the time for the ownership of a streaks termination period 
const stokeStreak = function(streakID, userID) {
    this.db.ref(`streaks/${streakID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let streak = snapshot.val();
            let nextExpirationDate = this.getDate24HoursAheadOfGiven(streak.currentExpirationDate);
            let nextExpirationTime = this.convertDateToTimeDifference(nextExpirationDate);
            this.db.ref(`streaks/${streakID}`).update({
                nextExpirationDate: nextExpirationDate,
                nextExpirationTime: nextExpirationTime,
                nextExpired: false,
            });
            this.streakStoke(streakID, userID);
        } else {
            throw 'No streak found for this streakID';
        }
    }).then(() => {
        this.getStreaks(userID);
    }).catch(reason => {
        console.log(reason);
    });
};

//returns a boolean depending on the input value
const checkForExpiredTime = function(val){
    return (val === '0:0') ? (
        true
    ) : (
        false
    )
};

//checks a streak by id and check the termination time on it and sets the expired key on the streak
const checkForExpiredStreaks = function(streakID) {
    return this.db.ref(`streaks/${streakID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let streak = snapshot.val();

            let currentExpirationTime = this.convertDateToTimeDifference(streak.currentExpirationDate);
            let currentExpired = this.checkForExpiredTime(currentExpirationTime);
            this.db.ref(`streaks/${streakID}/currentExpirationTime`).set(currentExpirationTime);
            this.db.ref(`streaks/${streakID}/currentExpired`).set(currentExpired);

            let nextExpirationTime = streak.nextExpirationTime;
            let nextExpired = streak.nextExpired;
            if (!streak.nextExpired) {
                nextExpirationTime = this.convertDateToTimeDifference(streak.nextExpirationDate);
                nextExpired = this.checkForExpiredTime(nextExpirationTime);
                this.db.ref(`streaks/${streakID}/nextExpirationTime`).set(nextExpirationTime);
                this.db.ref(`streaks/${streakID}/nextExpired`).set(nextExpired);
            }

            if (!currentExpired && !nextExpired) { //streak active | stoked | neutral
                this.db.ref(`streaks/${streakID}/neutral`).set(true);
                return streakID;
            } else if (!currentExpired && nextExpired) { //streak active | unstoked
                return streakID;
            } else if (currentExpired && nextExpired) { //streak terminated
                this.db.ref(`streaks/${streakID}`).set({
                    terminated: true,
                    terminator: streak.owner,
                    betrayed: streak.nextOwner,
                });
                this.streakTermination(streakID);
            } else if (currentExpired && !nextExpired) { //streak transition
                let currentExpirationDate = this.getDate24HoursAhead();
                let currentExpirationTime = this.convertDateToTimeDifference(currentExpirationDate)
                this.db.ref(`streaks/${streakID}`).update({
                    neutral: false,
                    currentOwner: streak.nextOwner,
                    currentExpirationDate: currentExpirationDate,
                    currentExpirationTime: currentExpirationTime,
                    currentExpired: false,
                    nextExpirationDate: null,
                    nextExpirationTime: null,
                    nextExpired: true,
                    nextOwner: streak.currentOwner,
                });
                return streakID;
            }
        } else {
            throw 'Check for Expired: No streak found for this streakID';
        }
    }).catch(reason => {
        console.log(reason);
    });
    //send streak termination info to history db
};

//returns the time difference between the current time and a provided time 
const convertDateToTimeDifference = function(expirationDate) {
    const date = new Date();
    const currentTime = date.getTime();
    let timeDifference = expirationDate - currentTime;
    let totalMinutes = (timeDifference / (1000 * 60)).toFixed(0);
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    let timeDiffString;
    if (hours < 0 && minutes < 0) {
        timeDiffString = '0:0';
        return timeDiffString;
    } else {
        timeDiffString = `${hours}:${minutes}`;
        return timeDiffString;
    }
};

//sets a streak id to a users streaklist
const streakToOwner = function(ownerID, streakID) {
    this.db.ref(`streakOwners/${ownerID}/${streakID}`).set(true);
};

//searches and returns a promise containing the user information by username
const searchUsers = function(username, userID) {
    return this.db.ref('users')
    .orderByChild('username')
    .equalTo(username)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let result = {};
            let data = snapshot.val();
            let foundUserID = Object.keys(data)[0];
            if (foundUserID === userID) {
                console.log('You cannot add yourself as a friend');
                result.self = true;
            } else {
                result.self = false;
            }
            result.uid = foundUserID;
            let innerData = snapshot.child(`${foundUserID}`).val();
            result.first = innerData.first;
            result.last = innerData.last
            return result;
        } else {
            return {};
        }
    });
};


export {
    startStreak,
    getStreaks,
    streakToInfo,
    getDate24HoursAhead,
    getDate24HoursAheadOfGiven,
    stokeStreak,
    checkForExpiredTime,
    checkForExpiredStreaks,
    convertDateToTimeDifference,
    streakToOwner,
    searchUsers,
};