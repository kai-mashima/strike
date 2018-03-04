import React, { Component } from 'react';
import { render } from 'react-dom';
import strikeLogo from '../assets/strikeLogo.png';
import { Link } from 'react-router-dom';

export default class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }
    render() {
        return (
            <div>
                <div className='main'>
                    <div className='header'>
                        <div className='header-left'>
                        </div>
                        <div className='header-mid'>
                            <img src={strikeLogo} className='logo'/>
                        </div>
                        <div className='header-right'>
                            <div className='profile-header-right-item'>
                                <span className='glyphicon glyphicon-cog'></span>
                            </div>
                        </div>
                    </div>
                    <div className='content profile-content'>
                        <div className='profile-item profile-user-img'>
                            {
                                this.props.user.imgAvailable ? (
                                    <img src='' className='' />
                                ) : (
                                    <span className='profile-user-glyph glyphicon glyphicon-user'></span>
                                )
                            }
                        </div>
                        <div className='profile-item'>
                            <p>@{this.props.user.username}</p>
                        </div>
                        <div className='profile-item'>
                            <p>${this.props.user.value}</p>
                        </div>
                        <div className='profile-item'>
                            <p>{this.props.user.totalFriends} Friends</p>
                        </div>
                        <div className='profile-item'>
                            <p>{this.props.user.totalStreaks} Streaks</p>
                        </div>
                        <div className='profile-item'>
                            <p>{this.props.user.totalDays} Total Days</p>
                        </div>
                        <div className='profile-item'>
                            <Link to='/' className='btn btn-danger' onClick={this.props.signOut}>Sign Out</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
