import firebase from 'firebase/app';

const loginUser = function(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(user => {
        this.confirmLogin();
        return user;
    }).then((user) => {
        this.getUserInfo(user.uid);
        this.getFriendRequests(user.uid);
        this.getFriends(user.uid);
        this.getStreakRequests(user.uid);
        this.getStreaks(user.uid);
        this.checkForDailyAllowance(user.uid);
    }).catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(`User Login Error: ${errorCode}: ${errorMessage}`);
    });
};

//grabs the information of a user by id
const getUserInfo = function(userID) {
    this.db.ref(`users/${userID}`)
    .once('value')
    .then(snapshot => {
        this.setState({
            user: snapshot.val()
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
        console.log('Signed Out');
        this.setState({
            loggedIn: false,
            userID: '',
            user: {},
            streaks: [],
            streaksInfo: [],
            friends: [],
            friendsInfo: [],
            streakRequests: [],
            streakRequestsInfo: [],
        });
    }).catch(error => {
        console.log('Error Signing Out:' + error);
    });
};

//creates a new firebase auth for a user and initials relevant functions to grab user info and set states
const signupUser = function(email, password, username = '', first = '', last = '', value = 0, allowance = 5, imgAvailable = false, totalStreaks = 0, totalDays = 0, lastChecked = undefined) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(user => {
        this.confirmLogin();
        return user;
    }).then((user) => {
        this.getUserInfo(user.uid);
        this.getFriends(user.uid);
        this.getStreaks(user.uid);
        this.getStreakRequests(user.uid);
        this.addNewUser(username, user.uid, first, last, email, value, allowance, totalStreaks, totalDays, lastChecked);
    }).catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(`User Signup Error: ${errorCode}: ${errorMessage}`);
    });
};

//adds a new user to the db
const addNewUser = function(username = '', userID, first = '', last = '', email = '', value = 0, allowance = 5, totalStreaks = 0, totalDays = 0, lastChecked = undefined) {
    const date = new Date();
    const time = date.getTime();
    this.db.ref(`users/${userID}`).set({
        first: first,
        last: last, 
        email: email,
        value: value,
        allowance: allowance,
        username: username,
        created: time,
        totalStreaks: totalStreaks,
        totalDays: totalDays,
        lastChecked: lastChecked,
    });
    this.setState({
        userID: userID,
    });
};

export {
    loginUser,
    getUserInfo,
    confirmLogin,
    signOut,
    signupUser,
    addNewUser,
};