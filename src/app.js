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
import Home from './components/home.js';
import Profile from './components/profile.js';
import Returns from './components/returns.js';
import Streaks from './components/streaks.js';

export default class App extends Component {
  render() {
    return (
        <Router history={browserHistory}>
            <div>
                <p>App</p>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/returns">Returns</Link></li>
                    <li><Link to="/history">History</Link></li>
                    <li><Link to="/streaks">Streaks</Link></li>
                </ul>
                <Switch>
                    <Route exact path="/" component={() => <Home />} />
                    <Route path="/history" component={() => <History />} />
                    <Route path="/profile" component={() => <Profile />} />
                    <Route path="/returns" component={() => <Returns />} />
                    <Route path="/streaks" component={() => <Streaks />} />
                </Switch>
            </div>
        </Router>
    );
  }
}