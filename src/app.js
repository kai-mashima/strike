import React, { Component } from 'react';
import browserHistory from 'react-router';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  Switch
} from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import emoji from 'node-emoji';
import strikeLogo from './assets/strikeLogo.png';

import { DB_CONFIG } from '../config/config.js';

import History from './components/history.js';
import Friends from './components/friends.js';
import Profile from './components/profile.js';
import Unlocks from './components/unlocks.js';
import Streaks from './components/streaks.js';
import Login from './components/login.js';
import Signup from './components/signup.js';

import {
    streakTermination,
    calculateStreakTerminatorTerminationPrice,
    calculateStreakBetrayedTerminationPrice,
    increaseUserValue,
    decreaseUserValue,
    updateStreakValue,
    calculateStokePrice,
    streakStoke,
    streakBoost,
    checkforStreakPayouts,
    calculateStreakPayout,
    checkForDailyAllowance,
    calculateDailyAllowance,
} from './utils/currency.js';
import {
    sendFriendRequest,
    friendRequestToPair,
    friendRequestToOwners,
    getFriendRequests,
    friendRequestsToInfo,
    acceptFriendRequest,
    rejectFriendRequest,
} from './utils/friendRequests.js';
import {
    getFriends,
    friendToInfo,
    addFriend,
    removeFriend,
    searchUsers,
} from './utils/friends.js';
import {
    startUnlocks,
    loadEmojiBank,
    getUnlockedEmojis,
    newUnlocksObject,
} from './utils/unlocks.js';
import {
    startStreak,
    getStreaks,
    streakToInfo,
    getStreakMessages,
    getDate24HoursAhead,
    getDate24HoursAheadOfGiven,
    stokeStreak,
    sendStreakMessage,
    checkForExpiredTime,
    checkForExpiredStreaks,
    convertDateToTimeDifference,
    streakTerminationDatabaseTransfer,
    streakToOwners,
    removeStreak,
    removeStreakRequest,
} from './utils/streaks.js';
import {
    sendStreakRequest,
    streakRequestAction,
    streakRequestToPair,
    streakRequestToOwners,
    getStreakRequests,
    streakRequestToInfo,
    acceptStreakRequest,
    rejectStreakRequest,
} from './utils/streakRequests.js';
import { 
    loginUser,
    checkLogin,
    confirmLogin,
    signOut,
    getUserInfo,
    signupUser,
    addNewUser,
} from './utils/login.js';
import {
    getUsername,
    getStreak,
    getTerminatedStreak,
    getUser,
    getNumberOfFriends,
    getNumberOfTotalStreakDays,
    getNumberOfStreaks,
    getNumberOfTerminatedStreaks,
    convertPastTimestampToDays,
    convertFutureTimestampToHours,
    convertTimeDifferenceToDays,
    getDate,
} from './utils/helperFunctions.js';

export default class App extends Component {
    constructor(props) {
        super(props);

        //DATABASE
        this.app = firebase.initializeApp(DB_CONFIG);
        this.db = this.app.database();

        //BINDINGS
        this.toggleSplash = this.toggleSplash.bind(this);
        this.toggleCurrentPage = this.toggleCurrentPage.bind(this);

        //helperFunctions
        this.getUsername = getUsername.bind(this);
        this.convertPastTimestampToDays = convertPastTimestampToDays.bind(this);
        this.convertFutureTimestampToHours = convertFutureTimestampToHours.bind(this);
        this.getNumberOfTotalStreakDays = getNumberOfTotalStreakDays.bind(this);
        this.convertTimeDifferenceToDays = convertTimeDifferenceToDays.bind(this);
        this.getDate = getDate.bind(this);
        this.getStreak = getStreak.bind(this);
        this.getTerminatedStreak = getTerminatedStreak.bind(this);
        this.getUser = getUser.bind(this);
        this.getNumberOfFriends = getNumberOfFriends.bind(this);
        this.getNumberOfStreaks = getNumberOfStreaks.bind(this);
        this.getNumberOfTerminatedStreaks = getNumberOfTerminatedStreaks.bind(this);

        //login|signup|setup
        this.loginUser = loginUser.bind(this);
        this.checkLogin = checkLogin.bind(this);
        this.getUserInfo = getUserInfo.bind(this);
        this.signOut = signOut.bind(this);
        this.confirmLogin = confirmLogin.bind(this);
        this.signupUser = signupUser.bind(this);
        this.addNewUser = addNewUser.bind(this);

        //friendRequests
        this.sendFriendRequest = sendFriendRequest.bind(this);
        this.friendRequestToPair = friendRequestToPair.bind(this);
        this.friendRequestToOwners = friendRequestToOwners.bind(this);
        this.getFriendRequests = getFriendRequests.bind(this);
        this.friendRequestsToInfo = friendRequestsToInfo.bind(this);
        this.acceptFriendRequest = acceptFriendRequest.bind(this);
        this.rejectFriendRequest = rejectFriendRequest.bind(this);

        //friends
        this.addFriend = addFriend.bind(this);
        this.getFriends = getFriends.bind(this);
        this.friendToInfo = friendToInfo.bind(this);
        this.removeFriend = removeFriend.bind(this);
        this.searchUsers = searchUsers.bind(this);

        //unlocks
        this.startUnlocks = startUnlocks.bind(this);
        this.loadEmojiBank = loadEmojiBank.bind(this);
        this.getUnlockedEmojis = getUnlockedEmojis.bind(this);

        //streakRequests
        this.sendStreakRequest = sendStreakRequest.bind(this);
        this.streakRequestAction = streakRequestAction.bind(this);
        this.streakRequestToPair = streakRequestToPair.bind(this);
        this.streakRequestToOwners = streakRequestToOwners.bind(this);
        this.getStreakRequests = getStreakRequests.bind(this);
        this.streakRequestToInfo = streakRequestToInfo.bind(this);
        this.acceptStreakRequest = acceptStreakRequest.bind(this);
        this.rejectStreakRequest = rejectStreakRequest.bind(this);

        //streaks
        this.startStreak = startStreak.bind(this);
        this.getStreaks = getStreaks.bind(this);
        this.streakToInfo = streakToInfo.bind(this);
        this.getStreakMessages = getStreakMessages.bind(this);
        this.getDate24HoursAhead = getDate24HoursAhead.bind(this);
        this.getDate24HoursAheadOfGiven = getDate24HoursAheadOfGiven.bind(this);
        this.stokeStreak = stokeStreak.bind(this);
        this.sendStreakMessage = sendStreakMessage.bind(this);
        this.checkForExpiredTime = checkForExpiredTime.bind(this);
        this.checkForExpiredStreaks = checkForExpiredStreaks.bind(this);
        this.streakTerminationDatabaseTransfer = streakTerminationDatabaseTransfer.bind(this);
        this.streakToOwners = streakToOwners.bind(this);
        this.removeStreak = removeStreak.bind(this);
        this.removeStreakRequest = removeStreakRequest.bind(this);

        //currency
        this.streakTermination = streakTermination.bind(this);
        this.calculateStreakTerminatorTerminationPrice = calculateStreakBetrayedTerminationPrice.bind(this);
        this.calculateStreakBetrayedTerminationPrice = calculateStreakBetrayedTerminationPrice.bind(this);
        this.increaseUserValue = increaseUserValue.bind(this);
        this.decreaseUserValue = decreaseUserValue.bind(this);
        this.updateStreakValue = updateStreakValue.bind(this);
        this.calculateStokePrice = calculateStokePrice.bind(this);
        this.streakStoke = streakStoke.bind(this);
        this.streakBoost = streakBoost.bind(this);
        this.checkforStreakPayouts = checkforStreakPayouts.bind(this);
        this.calculateStreakPayout = calculateStreakPayout.bind(this);
        this.checkForDailyAllowance = checkForDailyAllowance.bind(this);
        this.calculateDailyAllowance = calculateDailyAllowance.bind(this);

        this.checkLogin();

        const pageID = window.location.pathname.slice(1);

        //STATE
        this.state = {
            loggedIn: false,
            isVisibleSplash: false,
            previousCurrent: false,
            first: true,
            second: true,
            current: pageID,
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
        };
    }

    toggleSplash() {
        this.setState({
            isVisibleSplash: !this.state.isVisibleSplash
        });
    }

    toggleCurrentPage(e) {
        //update state with current page
        const pageID = window.location.pathname.slice(1);
        this.setState({
            current: pageID
        });

        //remove current-page class from refresh page classlist
        if (this.state.second) {
            document.getElementById(this.state.current).classList.remove('current-page');
            this.setState({
                second: false
            });
        }

        let lastPageID = window.location.pathname.slice(1);

        //set current page as next previousCurrent
        this.setState({
            previousCurrent: e.target
        });

        //remove current-page class from previous page
        if (this.state.previousCurrent === false) {
            document.getElementById(lastPageID).classList.remove('current-page');
        } else {
            this.state.previousCurrent.classList.remove('current-page');
        }

        //add current-page class to current page
        e.target.classList.add('current-page');
    }

    componentDidUpdate() {
        if (this.state.first && document.getElementById(this.state.current)) {
            document.getElementById(this.state.current).classList.add('current-page');
            this.setState({
                first: false
            });
        }
    }

    render() {
        let splashScreen = (
            <Modal show={this.state.isVisibleSplash}>
                <Modal.Header>
                    <Modal.Title>Welcome to Strike!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-container'>  
                        <img src={strikeLogo} className='col-item login-logo'/>
                        <span className='col-item'>The goal of the Strike application is to encourage users to maintain contact with their close friends, build a small group of close connections, and build up the amount of in-game currency they have and the number of streaks they maintain. These goals are meant to address some of the negative impacts of social media usage. The hope is that users will foster outside-of-game communication with the few friends they choose to add and keep in their in-game network. The platform is designed to be competitive and allow participants to have fun but also learn who they want to care about. </span>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <span onClick={this.toggleSplash}>Close</span>
                </Modal.Footer>
            </Modal>
        );

        return (
            <Router history={browserHistory}>
                <div className='wrapper'>
                    {
                        this.state.loggedIn ? (
                            <div>
                                {splashScreen}
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
                                                unlocks={this.state.unlockedEmojis}
                                                getStreaks={this.getStreaks}
                                                getStreakRequests={this.getStreakRequests}
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
                                                user={this.state.userID}
                                                searchUsers={this.searchUsers}
                                                sendFriendRequest={this.sendFriendRequest}
                                                requests={this.state.friendRequestsInfo}
                                                acceptFriendRequest={this.acceptFriendRequest}
                                                rejectFriendRequest={this.rejectFriendRequest}
                                                removeFriend={this.removeFriend}
                                                getFriendRequests={this.getFriendRequests}
                                                getFriends={this.getFriends}
                                            />
                                        )}
                                    />
                                    <Route path='/unlocks' component={() => (
                                            <Unlocks
                                                user={this.state.userID}
                                                getUnlocks={this.getUnlockedEmojis}
                                                emojis={this.state.emojis}
                                                progress={this.state.unlockProgress}
                                                days={this.state.dayUnlocks}
                                                streaks={this.state.streaksUnlocks}
                                                terminated={this.state.terminatedUnlocks}
                                                friends={this.state.friendUnlocks}
                                            />
                                        )} 
                                    />
                                </Switch>
                                <div className='footernav'>
                                    <ul className='link-container'>
                                        <li className='link-item'><Link className='link-item-tag' to='/friends'><span onClick={this.toggleCurrentPage} id='friends' className='glyph-span glyphicon glyphicon-plus'></span></Link></li>
                                        <li className='link-item'><Link className='link-item-tag' to='/unlocks'><span onClick={this.toggleCurrentPage} id='unlocks' className='glyph-span glyphicon glyphicon-lock'></span></Link></li>
                                        <li className='link-item'><Link className='link-item-tag' to='/streaks'><span onClick={this.toggleCurrentPage} id='streaks' className='glyph-span glyphicon glyphicon-fire'></span></Link></li>
                                        <li className='link-item'><Link className='link-item-tag' to='/history'><span onClick={this.toggleCurrentPage} id='history' className='glyph-span glyphicon glyphicon-list'></span></Link></li>
                                        <li className='link-item'><Link className='link-item-tag' to='/profile'><span onClick={this.toggleCurrentPage} id='profile' className='glyph-span glyphicon glyphicon-user'></span></Link></li>
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