import firebase from 'firebase/app';

const loginUser = function(email, password) {
    return firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(() => {
        return firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => {
            this.confirmLogin();
            return user;
        }).then(user => {
            this.getUserInfo(user.uid);
            this.getFriendRequests(user.uid);
            this.getFriends(user.uid);
            this.getStreakRequests(user.uid);
            this.getStreaks(user.uid);
            this.getUnlockedEmojis(user.uid);
            this.checkForDailyAllowance(user.uid);
            this.loadEmojiBank();
            this.setState({
                current: 'streaks'
            });
            return true;
        }).catch(error => {
            console.log(`User Login Error: ${error.code}: ${error.message}`);
            return false;
        });
    }).catch(error => {
        console.log(`User Login Error: ${error.code}: ${error.message}`);
        return false;
    });
};

const checkLogin = function() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            this.confirmLogin();
            this.getUserInfo(user.uid);
            this.getFriendRequests(user.uid);
            this.getFriends(user.uid);
            this.getStreakRequests(user.uid);
            this.getStreaks(user.uid);
            this.getUnlockedEmojis(user.uid);
            this.checkForDailyAllowance(user.uid);
            this.loadEmojiBank();        
        }
    });
};

//grabs the information of a user by id
const getUserInfo = function(userID) {
    this.db.ref(`users/${userID}`)
    .once('value')
    .then(snapshot => {
        let user = snapshot.val();
        const streaks = this.getNumberOfStreaks(userID);
        const friends = this.getNumberOfFriends(userID);
        const days = this.getNumberOfTotalStreakDays(userID)
        
        Promise.all([streaks, friends, days]).then(results => {
            user.totalStreaks = results[0];
            user.totalFriends = results[1];
            user.totalDays = results[2];
        });

        this.setState({
            user: user
        });
    }); 
};

//confirms firebase auth
const confirmLogin = function() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            let email = user.email;
            let userID = user.uid;
            this.setState({
                loggedIn: true,
                email: email,
                userID: userID,
            }); 
            console.log('Logged In');
        } else {
            this.setState({
                loggedIn: false,
                email: '',
                userID: '',
            });
            console.log('Not Logged In');
        }
    });
};

//signs out of firebase auth and resets state
const signOut = function() {
    firebase.auth().signOut()
    .then(() => {
        this.setState({
            loggedIn: false,
            isVisibleSplash: false,
            previousCurrent: false,
            first: true,
            second: true,
            current: false,
            userID: '',
            user: {},
            friendRequestsInfo: [],
            friendRequests: [],
            friends: [],
            friendsInfo: [],
            streakRequests: [],
            streakRequestsInfo: [],
            streaks: [],
            streaksInfo: [],
            emojis: [],
            unlockProgress: {},
            unlockedEmojis: [],
            dayUnlocks: [],
            streaksUnlocks: [],
            friendsUnlocks: [],
            terminatedUnlocks: [],
        });
        console.log('Signed Out');
    }).catch(error => {
        console.log('Error Signing Out:' + error);
    });
};

//creates a new firebase auth for a user and initials relevant functions to grab user info and set states
const signupUser = function(email, password, username = '', first = '', last = '', value = 0, totalStreaks = 0, totalDays = 0, lastChecked = false) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(user => {
        this.addNewUser(username, user.uid, first, last, email, value, totalStreaks, totalDays, lastChecked);
        return user;
    }).then(user => {
        this.getUserInfo(user.uid);
        this.getFriends(user.uid);
        this.getStreaks(user.uid);
        this.getStreakRequests(user.uid);
        this.startUnlocks(user.uid);
    }).catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(`User Signup Error: ${errorCode}: ${errorMessage}`);
    });
};

//adds a new user to the db
const addNewUser = function(username = '', userID, first = '', last = '', email = '', value = 0, totalStreaks = 0, totalDays = 0, lastChecked = false) {
    const date = new Date();
    const time = date.getTime();
    this.db.ref(`users/${userID}`).set({
        first: first,
        last: last, 
        email: email,
        value: value,
        username: username,
        created: time,
        totalStreaks: totalStreaks,
        totalDays: totalDays,
        lastChecked: lastChecked,
    });
    this.setState({
        isVisibleSplash: true,
        loggedIn: true,
        email: email,
        userID: userID,
    }); 
};

export {
    loginUser,
    checkLogin,
    getUserInfo,
    confirmLogin,
    signOut,
    signupUser,
    addNewUser,
};