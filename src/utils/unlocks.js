import firebase from 'firebase/app';

const startUnlocks = function(userID) {
    this.db.ref(`unlocks/${userID}`).set(newUnlocksObject);
};

const getUnlockedEmojis = function(userID) {
    let currentNumberOfStreaks = 0;
    let currentTotalDays = 0;
    let currentNumberOfFriends = 0;

    const streaks = this.getNumberOfStreaks(userID);
    const days = this.getNumberOfTotalStreakDays(userID);
    const friends = this.getNumberOfFriends(userID);

    Promise.all([streaks, days, friends]).then(results => {
        currentNumberOfStreaks = results[0];
        currentTotalDays = results[1];
        currentNumberOfFriends = results[2];
    }).then(() => {
        this.checkForUnlockProgress(userID, currentNumberOfStreaks, currentTotalDays, currentNumberOfFriends).then(result => {
            this.db.ref(`unlocks/${userID}`)
            .once('value')
            .then(snapshot => {
                let unlocked = [];
                if (snapshot.exists()) {
                    const unlocksInfo = snapshot.val();
                    const unlocks = Object.keys(unlocksInfo);
                    unlocks.map(category => {
                        console.log(unlocksInfo);
                        const categoryUnlocks = [];
                        unlocksInfo[`${category}`].map(emoji => {
                            if (emoji.unlocked) {
                                unlocked.push(emoji);
                                categoryUnlocks.push({emoji: emoji, goal: emoji.goal});
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
                    };
                    this.setState({
                        unlockedEmojis: unlocked,
                        unlockProgress: progress,
                    });
                }
            }).catch(reason => {
                console.log(reason);
            });
        });
    });
};

const checkForUnlockProgress = function(userID, currentNumberOfStreaks, currentTotalDays, currentNumberOfFriends) {
    return this.db.ref(`unlocks/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            const categoryInfo = snapshot.val();
            const categories = Object.keys(categoryInfo);
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
                    // currentCategoryCount = 
                }

                if (Object.keys(emojiProgress).length !== 0) {
                    if (currentCategoryCount > numberOfUnlocks) {
                        this.db.ref(`unlocks/${userID}/${category}`).update({progress: currentCategoryCount});
                        Object.keys(emojiProgress).map(emoji => {
                            if (currentCategoryCount < emojiProgress[emoji].goal) {
                                this.db.ref(`unlocks/${userID}/${category}/emojis/${emoji}`).update({progress: currentCategoryCount});
                            } else {
                                this.db.ref(`unlocks/${userID}/${category}/emojis/${emoji}`).update({progress: emojiProgress[emoji].goal});
                                this.db.ref(`unlocks/${userID}/${category}/emojis/${emoji}`).update({unlocked: true});
                            }
                        });
                    }
                }
            });
            return true;
        } else {
            throw 'Check for Unlock Progress: No unlocks found for this user ID';
            return false;
        }
    }).catch(reason => {
        console.log(reason);
    });
};

const newUnlocksObject = {
    streaks: {
        progress: 0,
        emojis: {
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
           'sos': {
                description: '',
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
                code: '100',
                description: '',
                goal: 100,
                progress: 0,
                unlocked: false,
            }, 
            '4Days': {
                code: '1234',
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
            'v': {
                description: '',
                goal: 1,
                progress: 0,
                unlocked: false,
            }, 
        },
    },
};

export {
    startUnlocks,
    getUnlockedEmojis,
    checkForUnlockProgress,
    newUnlocksObject,
};