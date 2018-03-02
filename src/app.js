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
    friendRequestToSender,
    friendRequestToRecipient,
    getFriendRequests,
    friendRequestsToInfo,
    acceptFriendRequest,
    rejectFriendRequest,
} from './utils/friendRequests.js';
import {
    getFriends,
    friendToInfo,
    addFriend,
} from './utils/friends.js';
import {
    startStreak,
    getStreaks,
    streakToInfo,
    getDate24HoursAhead,
    getDate24HoursAheadOfGiven,
    stokeStreak,
    checkForExpiredTime,
    checkForExpiredStreaks,
    convertDateToTimeDifference,
    streakToOwner,
    searchUsers,
} from './utils/streaks.js';
import {
    sendStreakRequest,
    streakRequestToSender,
    streakRequestToRecipient,
    getStreakRequests,
    streakRequestToInfo,
    acceptStreakRequest,
    rejectStreakRequest,
} from './utils/streakRequests.js';
import { 
    loginUser,
    confirmLogin,
    signOut,
    getUserInfo,
    signupUser,
    addNewUser,
} from './utils/login.js';
import {
    getUsername,
    getStreak,
    getUser,
    getNumberOfFriends,
    getNumberOfTotalStreakDays,
    getNumberOfStreaks,
    convertTimestampToDays,
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
        //helperFunctions
        this.getUsername = getUsername.bind(this);
        this.convertTimestampToDays = convertTimestampToDays.bind(this);
        this.getNumberOfTotalStreakDays = getNumberOfTotalStreakDays.bind(this);
        this.convertTimeDifferenceToDays = convertTimeDifferenceToDays.bind(this);
        this.getDate = getDate.bind(this);
        this.getStreak = getStreak.bind(this);
        this.getUser = getUser.bind(this);
        this.getNumberOfFriends = getNumberOfFriends.bind(this);
        this.getNumberOfStreaks = getNumberOfStreaks.bind(this);

        //login|signup|setup
        this.loginUser = loginUser.bind(this);
        this.getUserInfo = getUserInfo.bind(this);
        this.signOut = signOut.bind(this);
        this.confirmLogin = confirmLogin.bind(this);
        this.signupUser = signupUser.bind(this);
        this.addNewUser = addNewUser.bind(this);

        //friendRequests
        this.sendFriendRequest = sendFriendRequest.bind(this);
        this.friendRequestToSender = friendRequestToSender.bind(this);
        this.friendRequestToRecipient = friendRequestToRecipient.bind(this);
        this.getFriendRequests = getFriendRequests.bind(this);
        this.friendRequestsToInfo = friendRequestsToInfo.bind(this);
        this.acceptFriendRequest = acceptFriendRequest.bind(this);
        this.rejectFriendRequest = rejectFriendRequest.bind(this);

        //friends
        this.addFriend = addFriend.bind(this);
        this.getFriends = getFriends.bind(this);
        this.friendToInfo = friendToInfo.bind(this);

        //streakRequests
        this.sendStreakRequest = sendStreakRequest.bind(this);
        this.streakRequestToSender = streakRequestToSender.bind(this);
        this.streakRequestToRecipient = streakRequestToRecipient.bind(this);
        this.getStreakRequests = getStreakRequests.bind(this);
        this.streakRequestToInfo = streakRequestToInfo.bind(this);
        this.acceptStreakRequest = acceptStreakRequest.bind(this);
        this.rejectStreakRequest = rejectStreakRequest.bind(this);

        //streaks
        this.startStreak = startStreak.bind(this);
        this.getStreaks = getStreaks.bind(this);
        this.streakToInfo = streakToInfo.bind(this);
        this.getDate24HoursAhead = getDate24HoursAhead.bind(this);
        this.getDate24HoursAheadOfGiven = getDate24HoursAheadOfGiven.bind(this);
        this.stokeStreak = stokeStreak.bind(this);
        this.checkForExpiredTime = checkForExpiredTime.bind(this);
        this.checkForExpiredStreaks = checkForExpiredStreaks.bind(this);
        this.convertDateToTimeDifference = convertDateToTimeDifference.bind(this);
        this.streakToOwner = streakToOwner.bind(this);
        this.searchUsers = searchUsers.bind(this);

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

        //STATE
        this.state = {
            loggedIn: false,
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
        };
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
                                                user={this.state.userID}
                                                searchUsers={this.searchUsers}
                                                sendFriendRequest={this.sendFriendRequest}
                                                requests={this.state.friendRequestsInfo}
                                                acceptFriendRequest={this.acceptFriendRequest}
                                                rejectFriendRequest={this.rejectFriendRequest}
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