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
    //call functions to check if any new progress has been made
        //number of streaks
            // this.getNumberOfStreaks(userID);
        //total days
            // this.getNumberOfTotalStreakDays(userID);
        //number of friends
            // this.getNumberOfFriends(userID);
};

const newUnlocksObject = {
    Streaks: 
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
    Termination: {

    },
    Days: {
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
    Friends: {

    },
};

export {
    startUnlocks,
    getUnlockedEmojis,
    checkForUnlockProgress,
    newUnlocksObject,
};