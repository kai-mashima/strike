import firebase from 'firebase/app';

//adds a new streak to both users streak lists and the streak list
const startStreak = function(userID, friendID) {
    if (userID !== friendID) {
        let time = this.getDate();
        let expirationDate = this.getDate24HoursAhead();
        let expirationTime = this.convertFutureTimestampToHours(expirationDate);
        const newStreakID = this.db.ref().child('streaks').push().key;
        this.db.ref(`streakPairs/${userID}/${friendID}`).set(true);
        this.db.ref(`streakPairs/${friendID}/${userID}`).set(true);
        this.db.ref(`streaks/${newStreakID}`)
        .set({
            participants: {
                [userID]: true,
                [friendID]: true,
            },
            id: newStreakID,
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
            lastChecked: false,
            messages: false,
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
        Promise.all(streakFuncs).then(results => results);

        return streakList;
    }).then(streakList => {
        const infoFuncs = streakList.map(streakID => this.streakToInfo(streakID, userID));

        Promise.all(infoFuncs).then(streaks => {
            streaks = streaks.filter(streak => !streak.terminated);

            this.setState({
                streaksInfo: streaks
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
    return this.db.ref(`streaks/${streakID}`)
    .once('value')
    .then(snapshot => { 
        if (snapshot.exists()) {
            let streak = snapshot.val();
            streak.id = streakID;
            streak.days = this.convertPastTimestampToDays(streak.timestamp);
            streak.stokePrice = this.calculateStokePrice(streak);

            const funcs = Object.keys(streak.participants).map(participant => {
                if (participant === userID) {
                    return (
                        this.getUsername(participant).then(username => {
                            streak.user = username;
                            streak.userID = participant;
                        })
                    );
                } else {
                    return (
                        this.getUsername(participant).then(username => {
                            streak.friend = username;
                            streak.friendID = participant;
                            streak.friendTurn = participant;
                        })
                    );
                } 
            });

            funcs.push(
                this.getStreakMessages(streakID).then(messages => {
                    streak.messages = messages;
                })
            );

            Promise.all(funcs).then(results => results);

            return streak
        }
    }).catch(reason => {
        console.log(reason);
    });
};

const getStreakMessages = function(streakID) {
    return this.db.ref(`streakMessages/${streakID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return false;
        }
    }).catch(reason => {
        console.log(reason);
    });
};

const getDate24HoursAhead = function() {
    const date = new Date();
    const now = date.getTime();
    let newDate = now + (24 * 3600000);
    return newDate;
};

const getDate24HoursAheadOfGiven = function(date) {
    let result = date + (24 * 3600000);
    return result;
};

//toggles and resets the time for the ownership of a streaks termination period 
const stokeStreak = function(streakID, userID, friendID, message) {
    this.db.ref(`streaks/${streakID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let streak = snapshot.val();
            let nextExpirationDate = this.getDate24HoursAheadOfGiven(streak.currentExpirationDate);
            let nextExpirationTime = this.convertFutureTimestampToHours(nextExpirationDate);

            this.db.ref(`streaks/${streakID}`).update({
                nextExpirationDate: nextExpirationDate,
                nextExpirationTime: nextExpirationTime,
                nextExpired: false,
            });

            this.sendStreakMessage(streakID, userID, friendID, message);

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

const sendStreakMessage = function(streakID, userID, friendID, message) {
    const newMessageID = this.db.ref().child(`streakMessages/${streakID}`).push().key;
    this.db.ref(`streakMessages/${streakID}/${newMessageID}`).set({
        sender: userID,
        recipient: friendID,
        message: message,
    });
};

//returns a boolean depending on the input value
const checkForExpiredTime = function(time){
    return (time <= 0) ? true : false
};

//checks a streak by id and check the termination time on it and sets the expired key on the streak
const checkForExpiredStreaks = function(streakID) {
    this.db.ref(`streaks/${streakID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            let streak = snapshot.val();
            let currentExpirationTime = this.convertFutureTimestampToHours(streak.currentExpirationDate);
            let currentExpired = this.checkForExpiredTime(currentExpirationTime);

            this.db.ref(`streaks/${streakID}`).update({
                currentExpirationTime: currentExpirationTime,
                currentExpired: currentExpired,
            });

            let nextExpirationTime = streak.nextExpirationTime;
            let nextExpired = streak.nextExpired;

            if (!streak.nextExpired) {
                nextExpirationTime = this.convertFutureTimestampToHours(streak.nextExpirationDate);
                nextExpired = this.checkForExpiredTime(nextExpirationTime);

                this.db.ref(`streaks/${streakID}`).update({
                    nextExpirationTime: nextExpirationTime,
                    nextExpired: nextExpired,
                });
            }

            if (!currentExpired && !nextExpired) { //streak active | stoked | neutral
                this.db.ref(`streaks/${streakID}`).update({
                    neutral: true,
                });

            } else if (!currentExpired && nextExpired) { //streak active | unstoked
                
            } else if (currentExpired && nextExpired && !streak.terminated) { //streak terminated
                this.streakTerminationDatabaseTransfer(streak, streakID);
                this.streakTermination(streakID);
            } else if (currentExpired && !nextExpired) { //streak transition
                let currentExpirationDate = this.getDate24HoursAhead();
                let currentExpirationTime = this.convertFutureTimestampToHours(currentExpirationDate)

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
            }
        } else {
            throw 'Check for Expired: No streak found for this streakID';
        }
    }).catch(reason => {
        console.log(reason);
    });
    //send streak termination info to history db
};

const streakTerminationDatabaseTransfer = function(streak, streakID) {
    streak.terminated = true;
    streak.terminator = streak.currentOwner;
    streak.betrayed = streak.nextOwner;

    this.db.ref(`terminatedStreaks/${streakID}`).set(streak);
    this.db.ref(`terminatedStreakOwners/${streak.currentOwner}/${streakID}`).set(true);
    this.db.ref(`terminatedStreakOwners/${streak.nextOwner}/${streakID}`).set(true);

    this.db.ref(`streakOwners/${streak.currentOwner}/${streakID}`).remove();
    this.db.ref(`streakOwners/${streak.nextOwner}/${streakID}`).remove();
    this.db.ref(`streaks/${streakID}`).remove();
};

//sets a streak id to a users streaklist
const streakToOwner = function(ownerID, streakID) {
    this.db.ref(`streakOwners/${ownerID}/${streakID}`).set(true);
};

export {
    startStreak,
    getStreaks,
    streakToInfo,
    getStreakMessages,
    getDate24HoursAhead,
    getDate24HoursAheadOfGiven,
    stokeStreak,
    sendStreakMessage,
    checkForExpiredTime,
    checkForExpiredStreaks,
    streakTerminationDatabaseTransfer,
    streakToOwner,
};