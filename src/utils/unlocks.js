import firebase from 'firebase/app';

const startUnlocks = function(userID) {
    this.db.ref(`unlocks/${userID}`).set(newUnlocksObject);
};

const loadEmojiBank = function() {
    this.setState({
        emojis: newUnlocksObject
    });
};

const getUnlockedEmojis = function(userID) {
    let currentNumberOfStreaks = 0;
    let currentTotalDays = 0;
    let currentNumberOfFriends = 0;
    let currentNumberOfTerminatedStreaks = 0;

    const streaks = this.getNumberOfStreaks(userID);
    const days = this.getNumberOfTotalStreakDays(userID);
    const friends = this.getNumberOfFriends(userID);
    const terminated = this.getNumberOfTerminatedStreaks(userID);

    Promise.all([streaks, days, friends, terminated]).then(results => {
        currentNumberOfStreaks = results[0];
        currentTotalDays = results[1];
        currentNumberOfFriends = results[2];
        currentNumberOfTerminatedStreaks = results[3];
    }).then(() => {
        this.db.ref(`unlocks/${userID}`)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const categoryInfo = snapshot.val();
                const categories = Object.keys(categoryInfo);
                let unlocked = [];
                categories.map(category => {
                    const unlocks = categoryInfo[`${category}`];
                    const numberOfUnlocks = unlocks.progress;
                    const emojiProgress = unlocks.emojis;
                    let currentCategoryCount = 0;

                    if (category === 'streaks') {
                        currentCategoryCount = currentNumberOfStreaks;
                    } else if (category === 'days') {
                        currentCategoryCount = currentTotalDays;
                    } else if (category === 'friends') {
                        currentCategoryCount = currentNumberOfFriends;
                    } else if (category === 'termination') {
                        currentCategoryCount = currentNumberOfTerminatedStreaks;
                    }
                    
                    const categoryUnlocks = [];

                    this.db.ref(`unlocks/${userID}/${category}`).update({progress: currentCategoryCount});

                    Object.keys(emojiProgress).map(emoji => {
                        if (currentCategoryCount < emojiProgress[emoji].goal) {
                            this.db.ref(`unlocks/${userID}/${category}/emojis/${emoji}`).update({progress: currentCategoryCount});
                        } else {
                            this.db.ref(`unlocks/${userID}/${category}/emojis/${emoji}`).update({progress: emojiProgress[emoji].goal});
                            this.db.ref(`unlocks/${userID}/${category}/emojis/${emoji}`).update({unlocked: true});
                            unlocked.push(emoji);
                            categoryUnlocks.push({emoji: emoji, goal: emojiProgress[emoji].goal});
                        }
                    });

                    const categoryUnlocksObject = {};
                    categoryUnlocksObject[`${category}Unlocks`] = categoryUnlocks;
                    this.setState(categoryUnlocksObject);
                });

                const progress = {
                    streaks: currentNumberOfStreaks,
                    days: currentTotalDays,
                    friends: currentNumberOfFriends,
                    terminated:  currentNumberOfTerminatedStreaks,
                };

                this.setState({
                    unlockedEmojis: unlocked,
                    unlockProgress: progress,
                });
            } else {
                throw 'Check for Unlock Progress: No unlocks found for this user ID';
            }
        }).catch(reason => {
            console.log(reason);
        });
    });
};

const newUnlocksObject = {
    streaks: {
        progress: 0,
        emojis: {
            'point_up': {
                description: 'Have 1 active streak.',
                goal: 1,
                progress: 0,
                unlocked: false,
            }, 
            'two_hearts': {
                description: 'Have 2 active streak.',
                goal: 2,
                progress: 0,
                unlocked: false,
            },
            'trident': {
                description: 'Have 3 active streak.',
                goal: 3,
                progress: 0,
                unlocked: false,
            },
        },
    },
    termination: {
        progress: 0,
        emojis: {
           'sos': {
                description: 'Have 1 terminated streak.',
                goal: 1,
                progress: 0,
                unlocked: false,
            },  
        },
    },
    days: {
        progress: 0,
        emojis: {
            '100Days': {
                description: 'Have 100 combined days of all your active streak.',
                goal: 100,
                progress: 0,
                unlocked: false,
            }, 
            '4Days': {
                description: 'Have 4 combined days of all your active streak.',
                goal: 4,
                progress: 0,
                unlocked: false,
            },
        },
    },
    friends: {
        progress: 0,
        emojis: {
            'v': {
                description: 'Have 1 friend.',
                goal: 1,
                progress: 0,
                unlocked: false,
            }, 
        },
    },
};

export {
    startUnlocks,
    loadEmojiBank,
    getUnlockedEmojis,
    newUnlocksObject,
};