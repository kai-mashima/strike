import React, { Component } from 'react';
import browserHistory from 'react-router';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  Switch
} from 'react-router-dom';
import History from './components/history.js';
import Friends from './components/friends.js';
import Profile from './components/profile.js';
import Unlocks from './components/unlocks.js';
import Streaks from './components/streaks.js';
import Login from './components/login.js';
import Signup from './components/signup.js';
import { DB_CONFIG } from '../config/config.js';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

export default class App extends Component {
    constructor(props) {
        super(props);

        //DATABASE
        this.app = firebase.initializeApp(DB_CONFIG);
        this.db = this.app.database();

        //BINDING
        //login|signup|setup
        this.loginUser = this.loginUser.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.signupUser = this.signupUser.bind(this);
        this.addNewUser = this.addNewUser.bind(this);
        this.signOut = this.signOut.bind(this);
        this.confirmLogin = this.confirmLogin.bind(this);
        //friends
        this.addFriend = this.addFriend.bind(this);
        this.getFriends = this.getFriends.bind(this);
        this.searchUsers = this.searchUsers.bind(this);
        //streaks
        this.startStreak = this.startStreak.bind(this);
        this.stokeStreak = this.stokeStreak.bind(this);
        this.getStreaks = this.getStreaks.bind(this);
        this.acceptStreakRequest = this.acceptStreakRequest.bind(this);
        this.rejectStreakRequest = this.rejectStreakRequest.bind(this);
        this.getUsername = this.getUsername.bind(this);
        this.getStreakRequests = this.getStreakRequests.bind(this);
        this.sendStreakRequest = this.sendStreakRequest.bind(this);
        this.convertDateToTimeDifference = this.convertDateToTimeDifference.bind(this);
        this.getDate24HoursAheadOfGiven = this.getDate24HoursAheadOfGiven.bind(this);
        this.getDate24HoursAhead = this.getDate24HoursAhead.bind(this);
        this.getDate = this.getDate.bind(this);
        this.convertTimestampToDays = this.convertTimestampToDays.bind(this);

        //STATE
        this.state = {
            loggedIn: false,
            userID: '',
            user: {},
            streaks: [],
            streaksInfo: [],
            friends: [],
            friendsInfo: [],
            streakRequests: [],
            streakRequestsInfo: [],
        };
    }

//SIGNUP
    //creates a new firebase auth for a user and initials relevant functions to grab user info and set states
    signupUser(email, password, username = '', first = '', last = '', value = 0, allowance = 5, imgAvailable = false, totalStreaks = 0, totalDays = 0) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => {
            this.confirmLogin();
            return user;
        }).then((user) => {
            this.getUserInfo(user.uid);
            this.getFriends(user.uid);
            this.getStreaks(user.uid);
            this.getStreakRequests(user.uid);
            this.addNewUser(username, user.uid, first, last, email, value, allowance, totalStreaks, totalDays);
        }).catch(error => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(`User Signup Error: ${errorCode}: ${errorMessage}`);
        });
    }

    //adds a new user to the db
    addNewUser(username = '', userID, first = '', last = '', email = '', value = 0, allowance = 5, totalStreaks = 0, totalDays = 0) {
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
        });
        this.setState({
            userID: userID,
        });
    }


//LOGIN | LOGOUT
    //grabs the information of a user by id
    getUserInfo(userID) {
        this.db.ref(`users/${userID}`)
        .once('value')
        .then(snapshot => {
            this.setState({
                user: snapshot.val()
            });
        });
    }

    //login a user with an email and password
    loginUser(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => {
            this.confirmLogin();
            return user;
        }).then((user) => {
            this.getUserInfo(user.uid);
            this.getFriends(user.uid);
            this.getStreaks(user.uid);
            this.getStreakRequests(user.uid);
        }).catch(error => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(`User Login Error: ${errorCode}: ${errorMessage}`);
        });
    }

    //confirms firebase auth
    confirmLogin() {
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
    }

    //signs out of firebase auth and resets state
    signOut() {
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
    }

//STREAK REQUESTS
    //adds a streak request to the db and calls functions to assign streak request to sender and recipient
    sendStreakRequest(userID, recipientID) {
        if (userID !== recipientID) {
            const newRequestID = this.db.ref().child(`streakRequests/`).push().key;
            this.streakRequestToSender(userID, newRequestID);
            this.streakRequestToRecipient(recipientID, newRequestID);
            this.db.ref(`streakRequests/${newRequestID}`)
            .set({
                id: newRequestID,
                sender: userID,
                recipient: recipientID,
                answered: false,
                accepted: false,
            });
        } else {
            console.log('No request sent: You cannot send a streak request to yourself.');
        }
    }

    //sets the given streak request id to the sender of the request
    streakRequestToSender(ownerID, streakRequestID) {
        this.db.ref(`streakRequestOwners/${ownerID}/sent/${streakRequestID}`).set(true);
    }

    //sets the given streak request id to the recipient of the request
    streakRequestToRecipient(recipientID, streakRequestID) {
        this.db.ref(`streakRequestOwners/${recipientID}/received/${streakRequestID}`).set(true);
    }

    //grabs and sets streak information to state by user id
    getStreakRequests(userID) {
        this.db.ref(`streakRequestOwners/${userID}/received`)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                let streakRequests = Object.keys(snapshot.val());
                this.setState({
                    streakRequests: streakRequests
                });
                return streakRequests;
            } else {
                throw 'No streak requests found for this user ID'
            }
        }).then(streakRequests => {
            const funcs = streakRequests.map(request => this.streakRequestToInfo(request));
            Promise.all(funcs).then(results => {
                results = results.filter(n => n);
                this.setState({
                    streakRequestsInfo: results
                });
            });
        }).catch(reason => {
            console.log(reason);
        });
    }

    //returns a promise containing the information of a streak request by streak request id
    streakRequestToInfo(streakRequestID) {
        let streakRequest = null;
        return this.db.ref(`streakRequests/${streakRequestID}`)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                streakRequest = snapshot.val();
                if (streakRequest.answered === false) {
                    this.getUsername(streakRequest.sender).then(username => {
                        streakRequest.senderUsername = username;
                    });
                    this.getUsername(streakRequest.recipient).then(username => {
                        streakRequest.recipientUsername = username;
                    });
                } else {
                    streakRequest = null;
                }
            }
        }).then(() => {
            return streakRequest;
        }).catch(reason => {
            console.log(reason);
        });
    }

    //accept a streak request and set according information on streak request and start a streak with relevant information
    acceptStreakRequest(streakRequestID, userID, senderID) {
        this.db.ref(`streakRequests/${streakRequestID}`)
        .set({
            answered: true,
            accepted: true,
        });

        this.startStreak(userID, senderID);
    }

    //reject a streak request and set according information on streak request 
    rejectStreakRequest(streakRequestID, userID, senderID) {
        this.db.ref(`streakRequests/${streakRequestID}`)
        .set({
            answered: true,
            accepted: false,
        });
    }

//STREAKS
    //adds a new streak to both users streak lists and the streak list
    startStreak(userID, friendID) {
        if (userID !== friendID) {
            let time = this.getDate();
            let expirationDate = this.getDate24HoursAhead();
            let expirationTime = this.convertDateToTimeDifference(expirationDate);
            const newStreakID = this.db.ref().child('streaks').push().key;
            this.db.ref(`streaks/${newStreakID}`)
            .set({
                participants: {
                    [userID]: true,
                    [friendID]: true,
                },
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
            }).then(() => {
                this.streakToOwner(friendID, newStreakID);
                this.streakToOwner(userID, newStreakID);
            }).then(() => {
                this.getStreaks(userID);
            });
        } else {
            console.log('No streak started: You cannot start a streak with yourself.');
        }
    }

    //grabs and sets state to the streaks by user id
    getStreaks(userID) {
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
            return Promise.all(streakFuncs).then(results => {
                return results;
            });
        }).then(streakList => {
            const infoFuncs = streakList.map(streakID => this.streakToInfo(streakID, userID));
            Promise.all(infoFuncs).then(results => {
                results = results.filter(n => n);
                this.setState({
                    streaksInfo: results
                });
            });
        }).catch(reason => {
            console.log(reason);
        });
    }

    //returns a promise containing the information of a streak by streak id
    streakToInfo(streakID, userID){
        let streak = null;
        return this.db.ref(`streaks/${streakID}`)
        .once('value')
        .then(snapshot => { 
            if (snapshot.exists()) {
                streak = snapshot.val();
                streak.id = streakID;
                streak.days = this.convertTimestampToDays(streak.timestamp);
                Object.keys(streak.participants).map(participant => {
                    if (participant === userID) {
                        this.getUsername(participant).then(username => {
                            streak.user = username;
                        });
                    } else {
                        this.getUsername(participant).then(username => {
                            streak.friend = username;
                            streak.friendTurn = streak.participants[participant];
                        });
                    } 
                });
            }
        }).then(() => {
            return streak;
        }).catch(reason => {
            console.log(reason);
        });
    }

    convertTimestampToDays(timestamp) {
        const newDate = new Date();
        const date = newDate.getTime();
        let days = ((date - timestamp) / (3600000 * 24)).toFixed(0);
        return days;
    }

    getDate() {
        const newDate = new Date();
        const date = newDate.getTime();
        return date;
    }

    getDate24HoursAhead() {
        const newdate = new Date();
        const date = newdate.getTime();
        let newDate = date + (24 * 3600000);
        return newDate;
    }

    getDate24HoursAheadOfGiven(date) {
        let result = date + (24 * 3600000);
        return result;
    }

    //toggles and resests the time for the ownership of a streaks termination period 
    stokeStreak(streakID, userID) {
        this.db.ref(`streaks/${streakID}`)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                let streak = snapshot.val();
                let nextExpirationDate = this.getDate24HoursAheadOfGiven(streak.currentExpirationDate);
                let nextExpirationTime = this.convertDateToTimeDifference(nextExpirationDate);
                this.db.ref(`streaks/${streakID}/nextExpirationDate`).set(nextExpirationDate);
                this.db.ref(`streaks/${streakID}/nextExpirationTime`).set(nextExpirationTime);
                this.db.ref(`streaks/${streakID}/nextExpired`).set(false);
            } else {
                throw 'No streak found for this streakID';
            }
        }).then(() => {
            this.getStreaks(userID);
        }).catch(reason => {
            console.log(reason);
        });
    }

    //returns a boolean depending on the input value
    checkForExpiredTime(val){
        return (val === '0:0') ? (
            true
        ) : (
            false
        )
    }

    //checks a streak by id and check the termination time on it and sets the expired key on the streak
    checkForExpiredStreaks(streakID) {
        return this.db.ref(`streaks/${streakID}`)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                let streak = snapshot.val();

                let currentExpirationTime = this.convertDateToTimeDifference(streak.currentExpirationDate);
                let currentExpired = this.checkForExpiredTime(currentExpirationTime);
                this.db.ref(`streaks/${streakID}/currentExpirationTime`).set(currentExpirationTime);
                this.db.ref(`streaks/${streakID}/currentExpired`).set(currentExpired);

                let nextExpirationTime = streak.nextExpirationTime;
                let nextExpired = streak.nextExpired;
                if (!streak.nextExpired) {
                    nextExpirationTime = this.convertDateToTimeDifference(streak.nextExpirationDate);
                    nextExpired = this.checkForExpiredTime(nextExpirationTime);
                    this.db.ref(`streaks/${streakID}/nextExpirationTime`).set(nextExpirationTime);
                    this.db.ref(`streaks/${streakID}/nextExpired`).set(nextExpired);
                }

                if (!currentExpired && !nextExpired) { //streak active | stoked | neutral
                    this.db.ref(`streaks/${streakID}/neutral`).set(true);
                    return streakID;
                } else if (!currentExpired && nextExpired) { //streak active | unstoked
                    return streakID;
                } else if (currentExpired && nextExpired) { //streak terminated
                    this.db.ref(`streaks/${streakID}/terminated`).set(true);
                } else if (currentExpired && !nextExpired) { //streak transition
                    let currentExpirationDate = this.getDate24HoursAhead();
                    let currentExpirationTime = this.convertDateToTimeDifference(currentExpirationDate)
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
                    return streakID;
                }
            } else {
                throw 'Check for Expired: No streak found for this streakID';
            }
        }).catch(reason => {
            console.log(reason);
        });
        //send streak termination info to history db
    }

    //returns the time difference between the current time and a provided time 
    convertDateToTimeDifference(expirationDate) {
        const date = new Date();
        const currentTime = date.getTime();
        let timeDifference = expirationDate - currentTime;
        let totalMinutes = (timeDifference / (1000 * 60)).toFixed(0);
        let hours = Math.floor(totalMinutes / 60);
        let minutes = totalMinutes % 60;
        let timeDiffString;
        if (hours < 0 && minutes < 0) {
            timeDiffString = '0:0';
            return timeDiffString;
        } else {
            timeDiffString = `${hours}:${minutes}`;
            return timeDiffString;
        }
    }

    //sets a streak id to a users streaklist
    streakToOwner(ownerID, streakID) {
        this.db.ref(`streakOwners/${ownerID}/${streakID}`).set(true);
    }

    //searches and returns a promise containing the user information by username
    searchUsers(username, userID) {
        return this.db.ref('users')
        .orderByChild('username')
        .equalTo(username)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                let result = {};
                let data = snapshot.val();
                let foundUserID = Object.keys(data)[0];
                if (foundUserID === userID) {
                    console.log('You cannot add yourself as a friend');
                    result.self = true;
                } else {
                    result.self = false;
                }
                result.uid = foundUserID;
                let innerData = snapshot.child(`${foundUserID}`).val();
                result.first = innerData.first;
                result.last = innerData.last
                return result;
            } else {
                return {};
            }
        });
    }

//FRIENDS
    //grabs and sets to state the friends list of a user by id
    getFriends(userID) {
        this.db.ref(`friends/${userID}`)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                let friends = Object.keys(snapshot.val());
                this.setState({
                    friends: friends
                });
                return friends;
            } else {
                throw 'No friends found';
            }
        }).then(friends => {
            const funcs = friends.map(friend => this.friendToInfo(friend));
            Promise.all(funcs).then(friendsInfo => {
                this.setState({
                    friendsInfo: friendsInfo
                });
            });
        }).catch(reason => {
            console.log(reason);
        });
    }

    //Grab and returns just the username of a user by id
    getUsername(userID) {
        return this.db.ref(`users/${userID}`)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                return snapshot.val().username;
            } else {
                throw 'Get Username: No user found';
            }
        }).catch(reason => {
            console.log(reason);
        });
    }

    //Grabs and returns user information by id
    friendToInfo(userID) {
        return this.db.ref(`users/${userID}`)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                let info = snapshot.val();
                info.uid = userID;
                return info;
            } else {
                throw 'Friend to Info: No user found';
            }
        }).catch(reason => {
            console.log(reason);
        });
    }

    //adds a friend to a users friends list
    addFriend(userID, friendID) {
        if (userID !== friendID) {
            let stringID = friendID.toString();
            //add functionality to check that friend isn't already a friend
            this.state.friends.map((friend, index) => {
                this.db.ref(`friends/${userID}/${stringID}`).set(true);
            });
            let friends = this.state.friends.slice();
            friends.push(friendID);
            this.setState({ //set state to reflect updated friends list
                friends: friends
            });
            this.getFriends(userID);
        } else {
            console.log('No friend added: You cannot add yourself as a friend.')
        }
    }

    getHistory(){
        //grab history by UID
    }

    getUnlocks(){
        //grab unlocks by UID
    }

    render() {
        return (
            <Router history={browserHistory}>
                <div className='wrapper'>
                    {
                        this.state.loggedIn ? (
                            <div>
                                <Switch>
                                    <Route exact path='/' render={() => (
                                            <Redirect to='/streaks' />
                                        )}
                                    />
                                    <Route path='/streaks' component={() => (
                                            <Streaks 
                                                userID={this.state.userID}
                                                streaks={this.state.streaksInfo}
                                                friends={this.state.friendsInfo}
                                                sendStreakRequest={this.sendStreakRequest}
                                                value={this.state.user.value}
                                                requests={this.state.streakRequestsInfo}
                                                acceptStreakRequest={this.acceptStreakRequest}
                                                rejectStreakRequest={this.rejectStreakRequest}
                                                stokeStreak={this.stokeStreak}
                                            />
                                        )}
                                    />
                                    <Route path='/history' component={() => (
                                            <History />
                                        )} 
                                    />
                                    <Route path='/profile' component={() => (
                                            <Profile 
                                                signOut={this.signOut}
                                                user={this.state.user}
                                            />
                                        )}
                                    />
                                    <Route path='/friends' component={() => (
                                            <Friends 
                                                friends={this.state.friendsInfo}
                                                addFriend={this.addFriend}
                                                user={this.state.userID}
                                                searchUsers={this.searchUsers}
                                            />
                                        )}
                                    />
                                    <Route path='/unlocks' component={() => (
                                            <Unlocks />
                                        )} 
                                    />
                                </Switch>
                                <div className='footernav'>
                                    <ul className='link-container'>
                                        <li className='link-item'><Link className='link-item-tag' to='/friends'><span className='glyph-span glyphicon glyphicon-plus'></span></Link></li>
                                        <li className='link-item'><Link className='link-item-tag' to='/unlocks'><span className='glyph-span glyphicon glyphicon-lock'></span></Link></li>
                                        <li className='link-item'><Link className='link-item-tag' to='/streaks'><span className='glyph-span glyphicon glyphicon-fire'></span></Link></li>
                                        <li className='link-item'><Link className='link-item-tag' to='/history'><span className='glyph-span glyphicon glyphicon-list'></span></Link></li>
                                        <li className='link-item'><Link className='link-item-tag' to='/profile'><span className='glyph-span glyphicon glyphicon-user'></span></Link></li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <Login loginUser={this.loginUser} />
                                <div className='footernav'>
                                    <Signup signupUser={this.signupUser} />
                                </div>
                            </div>
                        )
                    }
                </div>
            </Router>
        );
    }
}