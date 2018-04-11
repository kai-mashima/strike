import firebase from 'firebase/app';

//EmojiProgress
    //UserID
        //emoji
            //progress: NUMBER
            //goal: NUMBER
            //unlock: BOOLEAN

const startUnlocks = function(userID) {
    this.db.ref(`unlocks/${userID}`).set(newUnlocksObject);
};

const getUnlockedEmojis = function() {
    //iterate over emojis
        //grab emojis that are unlocked
        //return array of unlocked emojis

};

const getUnlockProgress = function() {
    //call functions to check if any new progress has been made
        //number of streaks
        //total days
        //number of friends

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

};