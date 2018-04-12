import firebase from 'firebase/app';

const startUnlocks = function(userID) {
    this.db.ref(`unlocks/${userID}`).set(newUnlocksObject);
};

const getUnlockedEmojis = function(userID) {
    return this.db.ref(`unlocks/${userID}`)
    .once('value')
    .then(snapshot => {
        let unlocked = [];
        if (snapshot.exists()) {
            const unlocks = snapshot.val();
            unlocks.map(category => {
                category.map(emoji => {
                    if (emoji.unlocked) {
                        unlocked.push(emoji);
                    }
                });
            });
            return unlocked;
        } else {
            return unlocked;
        }
    }).catch(reason => {
        console.log(reason);
    });
};

const checkForUnlockProgress = function(userID) {
    const currentNumberOfStreaks = this.getNumberOfStreaks(userID);
    const currentTotalDays = this.getNumberOfTotalStreakDays(userID);
    const currentNumberOfFriends = this.getNumberOfFriends(userID);
    // const currentTerminationNumber 

    this.db.ref(`unlocks/${userID}/streaks/`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            const streaksUnlocks = snapshot.val();
            const numberOfStreaks = streaksUnlocks.categoryProgress;
            const emojiProgress = streaksUnlocks.emojis;

            if (numberOfStreaks < currentNumberOfStreaks) {
                emojiProgress.map(emoji => {
                    if (currentNumberOfStreaks >= emoji.goal) {
                        this.db.ref(`unlocks/${userID}/streaks/emojis/`)
                    }
                });
            }
        } else {
            throw 'Check for Unlock Progress: No streak category progress found';
        }
    }).catch(reason => {
        console.log(reason);
    });

    this.db.ref(`unlocks/${userID}/days/categoryProgress`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            const totalDays = snapshot.val();

        } else {
            throw 'Check for Unlock Progress: No days category progress found';
        }
    }).catch(reason => {
        console.log(reason);
    });

    this.db.ref(`unlocks/${userID}/friends/categoryProgress`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            const numberOfFriends = snapshot.val();

        } else {
            throw 'Check for Unlock Progress: No friends category progress found';
        }
    }).catch(reason => {
        console.log(reason);
    });

    // this.db.ref(`unlocks/${userID}/termination/categoryProgress`)
    // .once('value')
    // .then(snapshot => {
    //     if (snapshot.exists()) {
    //         const termination = snapshat.val();

    //     }
    // }).catch(reason => {
    //     console.log(reason);
    // });

};

const newUnlocksObject = {
    streaks: 
        categoryProgress: 0,
        emojis: {
            '1Streak': {
                code: 'point_up',
                description: '',
                goal: 1,
                progress: 0,
                unlocked: false,
            }, 
            '2Streaks': {
                code: 'two_hearts',
                description: '',
                goal: 2,
                progress: 0,
                unlocked: false,
            }, 
            '3Streaks': {
                code: 'trident',
                description: '',
                goal: 3,
                progress: 0,
                unlocked: false,
            },
        },
    },
    termination: {
        categoryProgress: 0,
        emojis: {

        },
    },
    days: {
        categoryProgress: 0,
        emojis: {
            '100Days': {
                code: '100'
                description: '',
                goal: 100,
                progress: 0,
                unlocked: false,
            }, 
            '4Days': {
                code: '1234'
                description: '',
                goal: 4,
                progress: 0,
                unlocked: false,
            },
        },
    },
    friends: {
        categoryProgress: 0,
        emojis: {

        },
    },
};

export {
    startUnlocks,
    getUnlockedEmojis,
    checkForUnlockProgress,
    newUnlocksObject,
};