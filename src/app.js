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
        this.signupUser = this.signupUser.bind(this);
        this.addNewUser = this.addNewUser.bind(this);
        this.signOut = this.signOut.bind(this);
        this.addFriend = this.addFriend.bind(this);
        this.confirmLogin = this.confirmLogin.bind(this);
        this.getFriends = this.getFriends.bind(this);
        this.searchUsers = this.searchUsers.bind(this);
        this.addStreak = this.addStreak.bind(this);
        this.getStreaks = this.getStreaks.bind(this);
        this.getFriends = this.getFriends.bind(this);
        this.searchUsers = this.searchUsers.bind(this);

        //STATE
        this.state = {
            loggedIn: true,
            uid: '',
            streaks: [
                {imgAvailable: false, img: null, days: 15, username: 'testuser', expirationTime: 264},
                {imgAvailable: false, img: null, days: 56, username: 'usertest', expirationTime: 54},
                {imgAvailable: false, img: null, days: 1, username: 'toaster', expirationTime: 400}
            ],
            friends: [
                // {imgAvailable: false, img: null, username: 'tested', value: 4300, totalStreaks: 23, totalDays: 501},
                // {imgAvailable: false, img: null, username: 'bested', value: 8000, totalStreaks: 54, totalDays: 577},
                // {imgAvailable: false, img: null, username: 'rested', value: 50, totalStreaks: 2, totalDays: 5},
            ],
            friendsInfo: [],
        };
    }

    signupUser(email, password, first, last, value, allowance, username) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => {
            this.confirmLogin();
            this.addNewUser(user.uid, first, last, email, value, allowance, username);
        }).catch(error => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(`User Signup Error: ${errorCode}: ${errorMessage}`);
        });
    }

    addNewUser(uid, first, last, email, value, allowance, username) {
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
        });
        this.setState({
            uid: uid,
        });
    }

    loginUser(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => {
            this.confirmLogin();
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
                let UID = user.uid;
                this.setState({
                    loggedIn: true,
                    email: email,
                    uid: UID,
                }); 
                console.log('Logged In');
                this.getFriends();
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
        }).catch(error => {
            console.log('Error Signing Out:' + error);
        });
    }

    getStreaks() {
        let streakList;
        const streaksRef = this.db.ref(`streaks/${this.state.uid}`);
        streaksRef.once('value', snapshot => {
            streakList = snapshot.val();
        });
        //for each streak in streakList grab streak info by id
    }

    addStreak(friendUID) {
        const date = new Date();
        const time = date.getTime();
        const newStreakID = this.db.ref().child('streaks').push().key;
        this.db.ref(`streaks/${newStreakID}`).set({
            participants: [ friendUID, this.state.uid ],
            value: 0,
            timestamp: time,
            allowance: 1,
            penalty: 0,
        });
        this.getStreaks();
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

    getFriends() {
        const friendsRef = this.db.ref(`friends/${this.state.uid}`);
        friendsRef.once('value', snapshot => {
            this.setState({
                friends: snapshot.val().friends
            });
        });
        console.log('friends grabbed: ' + this.state.friends);
        //add functionality to iterate over friends and grab their info from users db
    }

    addFriend(friendUID) {
        //add functionality to check that friend isn't already a friend
        let friends = this.state.friends.slice();
        friends.push(friendUID);
        this.db.ref(`friends/${this.state.uid}`).set({
            friends
        });
        this.setState({
            friends: friends
        });
        //add functionality to grab user data using uid
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
                                    <Route path='/streaks' component={() => <Streaks streaks={this.state.streaks} />} />
                                    <Route path='/history' component={() => <History />} />
                                    <Route path='/profile' component={() => <Profile signOut={this.signOut} />} />
                                    <Route path='/friends' component={() => <Friends friends={this.state.friends} addFriend={this.addFriend} searchUsers={this.searchUsers} />}/>
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