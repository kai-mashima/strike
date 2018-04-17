import firebase from 'firebase/app';

const startUnlocks = function(userID) {
    this.db.ref(`unlocks/${userID}`).set(newUnlocksObject);
};

const getUnlockedEmojis = function(userID) {
    const currentNumberOfStreaks = this.getNumberOfStreaks(userID);
    const currentTotalDays = this.getNumberOfTotalStreakDays(userID);
    const currentNumberOfFriends = this.getNumberOfFriends(userID);

    this.checkForUnlockProgress(userID, currentNumberOfStreaks, currentTotalDays, currentNumberOfFriends).then(() => {
        this.db.ref(`unlocks/${userID}`)
        .once('value')
        .then(snapshot => {
            let unlocked = [];
            if (snapshot.exists()) {
                const unlocks = Object.keys(snapshot.val());
                unlocks.map(category => {
                    const categoryUnlocks = [];
                    category.map(emoji => {
                        if (emoji.unlocked) {
                            unlocked.push(emoji);
                            categoryUnlocks.push({emoji: emoji, goal: emoji.goal});
                        }
                    });
                    this.setState({
                        `${category}Unlocks`: categoryUnlocks 
                    });
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
    })
};

const checkForUnlockProgress = function(userID, currentNumberOfStreaks, currentTotalDays, currentNumberOfFriends) {
    this.db.ref(`unlocks/${userID}`)
    .once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
            const categories = Object.keys(snapshot.val());
                categories.map(category => {
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
                this.db.ref(`unlocks/${userID}/${category}/`)
                .once('value')
                .then(snapshot => {
                    if (snapshot.exists()) {
                        const unlocks = snapshot.val();
                        const numberOfUnlocks = unlocks.progress;
                        const emojiProgress = Object.keys(unlocks.emojis);

                        if (Object.keys(emojiProgress).length !== 0 && emojiProgress.constructor === Object) {
                            if (currentCategoryCount > numberOfUnlocks) {
                                Object.keys(emojiProgress).map(emoji => {
                                    if (currentCategoryCount < emoji.goal ) {
                                        this.db.ref(`unlocks/${userID}/${category}/emojis/${emoji}/progress`).update(currentCategoryCount);
                                    } else if (currentCategoryCount >= emoji.goal) {
                                        this.db.ref(`unlocks/${userID}/${category}/emojis/${emoji}/progress`).update(emoji.goal);
                                        this.db.ref(`unlocks/${userID}/${category}/emojis/${emoji}/unlocked`).update(true);
                                    }
                                });
                            }
                        }
                    } else {
                        throw `Check for Unlock Progress: No ${category} category progress found`;
                    }
                }).catch(reason => {
                    console.log(reason);
                });
            });
        } else {
            throw 'Check for Unlock Progress: No unlocks found for this user ID';
        }
    }).catch(reason => {
        console.log(reason);
    });

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