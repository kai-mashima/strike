import React, { Component } from 'react';
import { render } from 'react-dom';
import Streak from './streak.js'
import strikeLogo from '../assets/strikeLogo.png';
import {Modal} from 'react-bootstrap';

export default class Streaks extends Component {
    constructor(props) {
        super(props);

        //BINDING
        this.toggleNewStreakModal = this.toggleNewStreakModal.bind(this);
        this.toggleRequestsModal = this.toggleRequestsModal.bind(this);
        this.handleStreakStart = this.handleStreakStart.bind(this);
        this.handleRequestAcceptance = this.handleRequestAcceptance.bind(this);
        this.handleRequestRejection = this.handleRequestRejection.bind(this);
        this.toggleConfirmationModal = this.toggleConfirmationModal.bind(this); 
        this.toggleErrorModal = this.toggleErrorModal.bind(this); 

        //STATE
        this.state = {
            isVisibleStreak: false,
            isVisibleRequests: false,
            isVisibleConfirmation: false,
            isVisibleError: false,
        }
    }

    //toggle state for streak request modal
    toggleRequestsModal() {
        this.setState({
            isVisibleRequests: !this.state.isVisibleRequests
        });
    }

    //toggle state for new streak modal
    toggleNewStreakModal() {
        this.setState({
            isVisibleStreak: !this.state.isVisibleStreak
        });
    }

    toggleConfirmationModal() {
        this.setState({
            isVisibleConfirmation: true
        });

        setTimeout(() => {
            this.setState({
                isVisibleConfirmation: false
            });
        }, 2000);
    }

    toggleErrorModal() {
        this.setState({
            isVisibleError: true
        });

        setTimeout(() => {
            this.setState({
                isVisibleError: false
            });
        }, 3000);
    }

    //initiate streak request process and toggle modal
    handleStreakStart(userID, friendID) {
        this.props.sendStreakRequest(userID, friendID).then(confirmation => {
            this.toggleNewStreakModal();
            if (confirmation) {
                this.toggleConfirmationModal();
            } else {
                this.toggleErrorModal();
            }
        });       
    }

    //accept streak request and toggle modal
    handleRequestAcceptance(requestID, userID, friendID) {
        this.props.acceptStreakRequest(requestID, userID, friendID);
        this.props.getStreakRequests(userID);
        this.props.getStreaks(userID);
        this.toggleRequestsModal();
    }

    //reject streak request and toggle modal
    handleRequestRejection(requestID, userID, friendID) {
        this.props.rejectStreakRequest(requestID, userID, friendID);
        this.props.getStreakRequests(userID);
        this.toggleRequestsModal();
    }

    render() {
        let friendsRender = <div className='light-small-text center-text'><span>No friends</span></div>;
        if (this.props.friends.length != 0) {
            friendsRender = this.props.friends.map((friend, index) => (
                <div className='col-item row-container friend-list-container' key={index}>
                    <span className='friend-list-item row-item'>@{friend.username}</span>
                    <span className='friend-list-item row-item btn btn-success' onClick={() => this.handleStreakStart(this.props.userID, friend.uid)}> Start Streak</span>
                </div>
            ));
        }

        let requestsRender = <div className='light-small-text center-text'><span>No streak requests</span></div>;
        if (this.props.requests.length != 0) {
            requestsRender = this.props.requests.map((request, index) => {
                if (request.answered !== true) {
                    return (
                        <div className='col-item row-container request-list-container' key={index}>
                            <span className='request-list-item row-item'>@{request.senderUsername}</span>
                            <span className='request-list-item row-item btn btn-success' onClick={() => this.handleRequestAcceptance(request.id, request.recipient, request.sender)}>Accept Streak</span>
                            <span className='request-list-item row-item btn btn-danger' onClick={() => this.handleRequestRejection(request.id, request.recipient, request.sender)}>Reject Streak</span>
                        </div>
                    )
                }
            });
        }

        let streaksRender = (
            <div className='center-text col-container floating-div'>
                <span className='col-item light-small-text'>No streaks</span>
                <span className='btn btn-success col-item new-btn' onClick={this.toggleNewStreakModal}>Start Streak</span>
            </div>
        );
        if (this.props.streaks.length != 0) {
            streaksRender = this.props.streaks.map((streak, index) => (
                <Streak unlocks={this.props.unlocks} key={index} streak={streak} stokeStreak={this.props.stokeStreak} userID={this.props.userID}/>
            ));
        }

        let notificationIconRender = (
            <div>
                <span onClick={this.toggleRequestsModal} className='streak-request-btn glyphicon glyphicon-bell'></span>
            </div>
        );
        if (this.props.requests.length != 0) {
            notificationIconRender = (
                <div>
                    <span onClick={this.toggleRequestsModal} className='streak-request-btn glyphicon glyphicon-bell'></span>
                    <span className='notification-icon'></span>
                </div>
            );
        }
        return (
            <div>
                <div className='main'>
                    <div className='header'>
                        <div className='header-left'>
                            <div className='streak-header-left-item'>
                                <span onClick={this.toggleNewStreakModal} className='new-streak-btn glyphicon glyphicon-plus-sign'></span>
                                <Modal show={this.state.isVisibleStreak} onHide={this.toggleNewStreakModal}>
                                    <Modal.Header>
                                        <Modal.Title>New Streak</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body bsClass='no-padding-modal'>
                                        <div className='col-container'>
                                            {friendsRender}
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <span className='btn btn-danger' onClick={this.toggleNewStreakModal}>Close</span>
                                    </Modal.Footer>
                                </Modal>
                                <Modal show={this.state.isVisibleConfirmation}>
                                    <Modal.Header>
                                        <Modal.Title>Streak Request Confirmation</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <span>Your streak request has been sent.</span>
                                    </Modal.Body>
                                </Modal>
                                <Modal show={this.state.isVisibleError}>
                                    <Modal.Header>
                                        <Modal.Title>Streak Request Error</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <span>Your streak request has not been sent. Please make sure you have not already sent a request to this user or that you do not already have a streak with this user.</span>
                                    </Modal.Body>
                                </Modal>
                            </div>
                        </div>
                        <div className='header-mid'>
                            <img src={strikeLogo} className='logo'/>
                        </div>
                        <div className='header-right'>
                            <div className='streak-header-right-item'>
                                {notificationIconRender}
                                <Modal show={this.state.isVisibleRequests} onHide={this.toggleRequestsModal}>
                                    <Modal.Header>
                                        <Modal.Title>Streak Requests</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body bsClass='no-padding-modal'>
                                        <div className='col-container'>
                                            {requestsRender}
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <span className='btn btn-danger' onClick={this.toggleRequestsModal}>Close</span>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        </div>
                    </div>
                    <div className='content'>
                        <div className='streaks-content'>
                            {streaksRender}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
