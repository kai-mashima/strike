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
        this.loginUser = this.loginUser.bind(this);
        this.getUserInfo = this.getUserInfo.bind(this);
        this.signupUser = this.signupUser.bind(this);
        this.addNewUser = this.addNewUser.bind(this);
        this.signOut = this.signOut.bind(this);
        this.addFriend = this.addFriend.bind(this);
        this.confirmLogin = this.confirmLogin.bind(this);
        this.getFriends = this.getFriends.bind(this);
        this.searchUsers = this.searchUsers.bind(this);
        this.startStreak = this.startStreak.bind(this);
        this.getStreaks = this.getStreaks.bind(this);
        this.searchUsers = this.searchUsers.bind(this);
        this.checkForStreakRequests = this.checkForStreakRequests.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.rejectRequest = this.rejectRequest.bind(this);
        this.getUsername = this.getUsername.bind(this);

        //STATE
        this.state = {
            loggedIn: false,
            uid: '',
            user: {},
            streaks: [],
            streaksInfo: [],
            friends: [],
            friendsInfo: [],
            streakRequests: [],
        };
    }

    signupUser(email, password, username = '', first = '', last = '', value = 0, allowance = 5, imgAvailable = false, img = null, totalStreaks = 0, totalDays = 0) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => {
            this.confirmLogin();
            return user;
        }).then((user) => {
            this.getUserInfo(user.uid);
            this.getFriends(user.uid);
            this.getStreaks(user.uid);
            this.addNewUser(username, user.uid, first, last, email, value, allowance, imgAvailable, img, totalStreaks, totalDays);
        }).catch(error => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(`User Signup Error: ${errorCode}: ${errorMessage}`);
        });
    }

    addNewUser(username = '', uid, first = '', last = '', email = '', value = 0, allowance = 5, imgAvailable = false, img = null, totalStreaks = 0, totalDays = 0) {
        const date = new Date();
        const time = date.getTime();
        this.db.ref(`users/${uid}`).set({
            first: first,
            last: last, 
            email: email,
            value: value,
            allowance: allowance,
            username: username,
            created: time,
            imgAvailable: imgAvailable,
            img: img,
            totalStreaks: totalStreaks,
            totalDays: totalDays,
        });
        this.setState({
            uid: uid,
        });
    }

    getUserInfo(uid) {
        this.db.ref(`users/${uid}`)
        .once('value')
        .then(snapshot => {
            this.setState({
                user: snapshot.val()
            });
        });
    }

    loginUser(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => {
            this.confirmLogin();
            return user;
        }).then((user) => {
            this.getUserInfo(user.uid);
            this.getFriends(user.uid);
            this.getStreaks(user.uid);
        }).catch(error => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(`User Login Error: ${errorCode}: ${errorMessage}`);
        });
    }

    confirmLogin() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                let email = user.email;
                let uid = user.uid;
                this.setState({
                    loggedIn: true,
                    email: email,
                    uid: uid,
                }); 
                console.log('Logged In');
            } else {
                this.setState({
                    loggedIn: false,
                    email: '',
                    uid: '',
                });
                console.log('Not Logged In');
            }
        });
    }

    signOut() {
        firebase.auth().signOut()
        .then(() => {
            console.log('Signed Out');
            this.setState({
                loggedIn: false,
                uid: '',
                streaks: null,
                streaksInfo: null,
                friends: null,                
                friendsInfo: null,
            });
        }).catch(error => {
            console.log('Error Signing Out:' + error);
        });
    }

    getStreaks(userID) {
        this.db.ref(`streakOwners/${userID}`) //grab streak list from streakOwners db
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                let streaks = Object.keys(snapshot.val());
                this.setState({
                    streaks: streaks
                });
                console.log('streaks grabbed: ' + this.state.streaks);
                return streaks;
            } else {
                throw 'No owners for this uid';
            }
        }).then(streakList => {
            const infoFuncs = streakList.map(streakID => this.streakToInfo(streakID, userID));
            Promise.all(infoFuncs).then(results => {
                this.setState({
                    streaksInfo: results
                });
            });
            const requestFuncs = streakList.map(streakID => this.checkForStreakRequests(streakID, userID));
            Promise.all(requestFuncs).then(results => {
                this.setState({
                    streakRequests: results
                });
                console.log(this.state.streakRequests);
            });
        }).catch(reason => {
            console.log(reason);
        });
    }

    streakToInfo(streakID, userID){
        return this.db.ref(`streaks/${streakID}`)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                let info = snapshot.val();
                let participants = Object.keys(info.participants);
                const funcs = participants.map(participant => {
                        return this.db.ref(`users/${participant}`)
                        .once('value')
                        .then(snapshot => {
                            if (snapshot.exists()) {
                                return snapshot.val().username;
                            } else {
                                throw 'No user by this participant id';
                            }
                        }).catch(reason => {
                            console.log(reason);
                        });
                    });
                return Promise.all(funcs).then(results => {
                    info.users = results;
                    info.id = streakID;
                    return info;
                });
            } else {
                throw 'No streak found for this streakID';
            }
        }).catch(reason => {
            console.log(reason);
        });
    }

    checkForStreakRequests(streakID, userID) {
        return this.db.ref(`streaks/${streakID}/participants`)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                let participants = snapshot.val();
                let notification = {
                    friendID: null,
                    friendUsername: null,
                    needsNotification: false,
                };
                for (var prop in participants) {
                    if (prop === userID && participants[prop] === false) {
                        notification.needsNotification = true;
                    } 
                    if (prop !== userID) {
                        notification.friendID = prop;
                    }
                }
                return this.getUsername(notification.friendID).then(username => {
                    notification.friendUsername = username;
                }).then(() => {
                    if (notification.needsNotification) {
                        return notification;
                    } else {
                        return notification;
                    }
                });
            } else {
                throw 'No streak found for this streak ID';
            }
        }).catch(reason => {
            console.log(reason);
        });
    }

    acceptRequest(userID, friendID) {

    }

    rejectRequest(userID, friendID) {

    }

    startStreak(userID, friendID) {
        if (userID !== friendID) {
            const date = new Date();
            const time = date.getTime();
            const newStreakID = this.db.ref().child('streaks').push().key;
            this.db.ref(`streaks/${newStreakID}`)
            .set({
                participants: {
                    [userID]: true,
                    [friendID]: false,
                },
                value: 0,
                timestamp: time,
                expirationTime: 0, //24 hours plus timestamp
                days: 0,
                allowance: 1,
                penalty: 0,
            }).then(() => {
                this.streakToInfo(newStreakID);
                this.streakToOwner(friendID, newStreakID);
                this.streakToOwner(userID, newStreakID);
            }).then(() => {
                this.getStreaks(userID);
            });
        } else {
            console.log('No streak started: You cannot start a streak with yourself.');
        }
    }

    streakToOwner(ownerID, streakID) {
        this.db.ref(`streakOwners/${ownerID}`).child(`${streakID}`).set(true);
    }

    searchUsers(username, currUID) {
        return this.db.ref('users')
        .orderByChild('username')
        .equalTo(username)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                let result = {};
                let data = snapshot.val();
                let uid = Object.keys(data)[0];
                if (uid === currUID) {
                    console.log('You cannot add yourself as a friend');
                    result['self'] = true;
                } else {
                    result['self'] = false;
                }
                result['uid'] = uid;
                let innerData = snapshot.child(`${uid}`).val();
                result['first'] = innerData.first;
                result['last'] = innerData.last
                return result;
            } else {
                return {};
            }
        });
    }

    getFriends(uid) {
        this.db.ref(`friends/${uid}`)
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

    getUsername(userID) {
        return this.db.ref(`users/${userID}`)
        .once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                return snapshot.val().username;
            } else {
                throw 'No user found';
            }
        }).catch(reason => {
            console.log(reason);
        });
    }

    friendToInfo(userID) { //uses uid to grab users data 
        return this.db.ref(`users/${userID}`)
        .once('value') //grab snapshot once
        .then(snapshot => {
            if (snapshot.exists()) {
                let info = snapshot.val();
                info.uid = userID;
                return info;
            } else {
                throw 'No user found';
            }
        }).catch(reason => {
            console.log(reason);
        });
    }

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
                                                uid={this.state.uid}
                                                streaks={this.state.streaksInfo}
                                                friends={this.state.friendsInfo}
                                                startStreak={this.startStreak}
                                                value={this.state.user.value}
                                                requests={this.state.streakRequests}
                                                acceptRequest={this.state.acceptRequest}
                                                rejectRequest={this.state.rejectRequest}
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
                                                user={this.state.uid}
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