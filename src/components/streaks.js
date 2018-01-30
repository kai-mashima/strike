import React, { Component } from 'react';
import { render } from 'react-dom';
import Streak from './streak.js'
import strikeLogo from '../assets/strikeLogo.png';
import {Modal} from 'react-bootstrap';

export default class Streaks extends Component {
    constructor(props){
        super(props);

        this.toggleNewStreakModal = this.toggleNewStreakModal.bind(this);

        this.state = {
            isVisible: false
        }
    }

    toggleNewStreakModal(){
        this.setState({
            isVisible: !this.state.isVisible
        });
    }

    render() {
        return (
            <div>
                <div className='main'>
                    <div className='header'>
                        <div className='header-left'>
                            <span onClick={this.toggleNewStreakModal} className='new-streak-btn glyphicon glyphicon-plus-sign'></span>
                            <Modal show={this.state.isVisible} onHide={this.toggleNewStreakModal}>
                                <Modal.Header>
                                    <Modal.Title>New Streak</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className='col-container'>
                                        {
                                            this.props.friends.map((friend, index) => (
                                                <div className='col-item row-container friend-list-container' key={index}>
                                                    <span className='friend-list-item row-item'>@{friend.username}</span>
                                                    <span className='friend-list-item row-item btn btn-success'>Start Streak</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    <span onClick={this.toggleNewStreakModal}>Close</span>
                                </Modal.Footer>
                            </Modal>
                        </div>
                        <div className='header-mid'>
                            <img src={strikeLogo} className='logo'/>
                        </div>
                        <div className='header-right'>
                            <p>${this.state.value}</p>
                        </div>
                    </div>
                    <div className='content'>
                        <div className='streaks-content'>
                            {
                                this.props.streaks.map((streak, index) => (
                                    <Streak key={index} streak={streak}/>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
