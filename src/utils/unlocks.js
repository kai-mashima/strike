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
            const numberOfStreaks = streaksUnlocks.progress;
            const emojiProgress = streaksUnlocks.emojis;

            if (currentNumberOfStreaks > numberOfStreaks) {
                emojiProgress.map(emoji => {
                    if (currentNumberOfStreaks < emoji.goal ) {
                        this.db.ref(`unlocks/${userID}/streaks/emojis/${emoji}/progress`).update(currentNumberOfStreaks);
                    } else if (currentNumberOfStreaks >= emoji.goal) {
                        this.db.ref(`unlocks/${userID}/streaks/emojis/${emoji}/progress`).update(emoji.goal);
                        this.db.ref(`unlocks/${userID}/streaks/emojis/${emoji}/unlocked`).update(true);
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
        progress: 0,
        emojis: 
            'point_up': {
                description: '',
                goal: 1,
                progress: 0,
                unlocked: false,
            }, 
            'two_hearts': {
                description: '',
                goal: 2,
                progress: 0,
                unlocked: false,
            },
            'trident': {
                description: '',
                goal: 3,
                progress: 0,
                unlocked: false,
            },
        },
    },
    termination: {
        progress: 0,
        emojis: {

        },
    },
    days: {
        progress: 0,
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
        progress: 0,
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