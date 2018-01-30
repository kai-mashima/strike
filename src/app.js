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
        this.addStreak = this.addStreak.bind(this);
        this.getStreaks = this.getStreaks.bind(this);
        this.searchUsers = this.searchUsers.bind(this);

        //STATE
        this.state = {
            loggedIn: false,
            uid: '',
            user: {},
            streaks: [
                // {imgAvailable: false, img: null, days: 15, username: 'testuser', expirationTime: 264},
                // {imgAvailable: false, img: null, days: 56, username: 'usertest', expirationTime: 54},
                // {imgAvailable: false, img: null, days: 1, username: 'toaster', expirationTime: 400}
            ],
            streaksInfo: [],
            friends: [
                // {imgAvailable: false, img: null, username: 'tested', value: 4300, totalStreaks: 23, totalDays: 501},
                // {imgAvailable: false, img: null, username: 'bested', value: 8000, totalStreaks: 54, totalDays: 577},
                // {imgAvailable: false, img: null, username: 'rested', value: 50, totalStreaks: 2, totalDays: 5},
            ],
            friendsInfo: [],
        };
    }

    signupUser(email, password, username = '', first = '', last = '', value = 0, allowance = 5, imgAvailable = false, img = null, totalStreaks = 0, totalDays = 0) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => {
            this.confirmLogin();
            return user;
        }).then((user) => {
            getUserInfo(user.uid);
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
                console.log('No User');
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
                streaks: [],
                friends: [],
                friendsInfo: [],
            });
        }).catch(error => {
            console.log('Error Signing Out:' + error);
        });
    }

    getStreaks(userID) {
        let streaks = this.state.streaks.slice();
        this.db.ref(`streakOwners/${userID}`) //grab streak list from streakOwners db
        .once('value')
        .then(snapshot => {
            this.setState({
                streaks: snapshot.val()
            });
            console.log('streaks grabbed: ' + this.state.streaks);
            return snapshot.val();
        }).then(streaks => {
            const funcs = streaks.map(streak => this.streakToInfo(streak));
            Promise.all(funcs).then(results => {
                this.setState({
                    streaksInfo: results
                });
            });
        });
    }

    streakToInfo(streakID){
        return this.db.ref(`streaks/${streakID}`)
        .once('value')
        .then(snapshot => {
            let info = snapshot.val();
            info.id = streakID;
            return info;
        });
    }

    addStreak(userID, friendID) {
        const date = new Date();
        const time = date.getTime();
        const newStreakID = this.db.ref().child('streaks').push().key;
        this.db.ref(`streaks/${newStreakID}`)
        .set({
            participants: {
                [friendID]: true,
                [userID]: true,
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
        });
    }

    streakToOwner(ownerID, streakID) {
        this.db.ref(`streakOwners/${ownerID}`).child(`${streakID}`).set(true);
    }

    searchUsers(username) {
        return this.db.ref('users')
        .orderByChild('username')
        .equalTo(username)
        .once('value')
        .then(snapshot => {
            let result = {};
            let data = snapshot.val();
            let uid = Object.keys(data)[0];
            result['uid'] = uid;
            let innerData = snapshot.child(`${uid}`).val();
            result['first'] = innerData.first;
            result['last'] = innerData.last
            return result;
        });
    }

    getFriends(uid) {
        this.db.ref(`friends/${uid}`)
        .once('value')
        .then(snapshot => {
            let friends = Object.keys(snapshot.val());
            this.setState({
                friends: friends
            });
            return friends;
        }).then(friends => {
            const funcs = friends.map(friend => this.friendToInfo(friend));
            Promise.all(funcs).then(friendsInfo => {
                this.setState({
                    friendsInfo: friendsInfo
                });
            });
        });
    }

    friendToInfo(uid) { //uses uid to grab users data 
        return this.db.ref(`users/${uid}`)
        .once('value') //grab snapshot once
        .then(snapshot => {
            let info = snapshot.val();
            info.uid = uid;
            return info;
        });
    }

    //FIX first friend end doesnt work
    addFriend(userID, friendID) {
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
                                        <Redirect to='/streaks'/>
                                    )}/>
                                    <Route path='/streaks' component={() => <Streaks uid={this.state.uid} streaks={this.state.streaksInfo} friends={this.state.friendsInfo} addStreak={this.addStreak}/>} />
                                    <Route path='/history' component={() => <History />} />
                                    <Route path='/profile' component={() => <Profile signOut={this.signOut} user={this.state.user}/>} />
                                    <Route path='/friends' component={() => <Friends friends={this.state.friendsInfo} addFriend={this.addFriend} user={this.state.uid} searchUsers={this.searchUsers} />}/>
                                    <Route path='/unlocks' component={() => <Unlocks />} />
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



    // render() {
    //     return (
    //         <Router history={browserHistory}>
    //             <div className='wrapper'>
    //                 {
    //                     this.state.loggedIn ? (

    //                     ) : (
                        
    //                     )
    //                 }
    //                 <Switch>
    //                     <Route exact path='/' render={() => (
    //                         this.state.loggedIn ? (
    //                             <Redirect to='/streaks'/>
    //                         ) : (
    //                             <Redirect to='/login'/>
    //                         )
    //                     )}/>
    //                     <Route path='/login' component={() => <Login loginUser={this.loginUser} signupUser={this.signupUser} />} />
    //                     <Route path='/streaks' component={() => <Streaks streaks={this.state.streaks}/>} />
    //                     <Route path='/history' component={() => <History />} />
    //                     <Route path='/profile' component={() => <Profile signOut={this.signOut}/>} />
    //                     <Route path='/friends' component={() => <Friends friends={this.state.friends}/>} />
    //                     <Route path='/unlocks' component={() => <Unlocks />} />
    //                 </Switch>
    //                 <div className='footernav'>
    //                     {
    //                         this.state.loggedIn ? (
    //                             <ul className='link-container'>
    //                                 <li className='link-item'><Link className='link-item-tag' to='/friends'><span className='glyph-span glyphicon glyphicon-plus'></span></Link></li>
    //                                 <li className='link-item'><Link className='link-item-tag' to='/unlocks'><span className='glyph-span glyphicon glyphicon-lock'></span></Link></li>
    //                                 <li className='link-item'><Link className='link-item-tag' to='/'><span className='glyph-span glyphicon glyphicon-fire'></span></Link></li>
    //                                 <li className='link-item'><Link className='link-item-tag' to='/history'><span className='glyph-span glyphicon glyphicon-list'></span></Link></li>
    //                                 <li className='link-item'><Link className='link-item-tag' to='/profile'><span className='glyph-span glyphicon glyphicon-user'></span></Link></li>
    //                             </ul>
    //                         ) : (
    //                             <Signup />
    //                         )
    //                     }  
    //                 </div>
    //             </div>
    //         </Router>
    //     );
    // }