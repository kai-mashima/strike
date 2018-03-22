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

        //STATE
        this.state = {
            isVisibleStreak: false,
            isVisibleRequests: false,
            isVisibleConfirmation: false,
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

    //initiate streak request process and toggle modal
    handleStreakStart(userID, friendID) {
        this.props.sendStreakRequest(userID, friendID)
        .then(confirmation => {
            this.toggleNewStreakModal();
            if (confirmation) {
                this.toggleConfirmationModal();
            }
        });       
    }

    //accept streak request and toggle modal
    handleRequestAcceptance(requestID, userID, friendID) {
        this.props.acceptStreakRequest(requestID, userID, friendID);
        this.toggleRequestsModal();
    }

    //reject streak request and toggle modal
    handleRequestRejection(requestID, userID, friendID) {
        this.props.rejectStreakRequest(requestID, userID, friendID);
        this.toggleRequestsModal();
    }

    render() {
        let friendsRender = <div><span>You have no friends</span></div>;
        if (this.props.friends.length != 0) {
            friendsRender = this.props.friends.map((friend, index) => (
                <div className='col-item row-container friend-list-container' key={index}>
                    <span className='friend-list-item row-item'>@{friend.username}</span>
                    <span className='friend-list-item row-item btn btn-success' onClick={() => this.handleStreakStart(this.props.userID, friend.uid)}> Start Streak</span>
                </div>
            ));
        }

        let requestsRender = <div><span>You have no requests</span></div>;
        if (this.props.requests.length != 0) { 
            //handle no unanswered requests
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

        let streaksRender = <div><span>You have no streaks</span></div>;
        if (this.props.streaks.length != 0) {
            streaksRender = this.props.streaks.map((streak, index) => (
                <Streak key={index} streak={streak} stokeStreak={this.props.stokeStreak} userID={this.props.userID}/>
            ));
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
                                    <Modal.Body>
                                        <div className='col-container'>
                                            {friendsRender}
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <span onClick={this.toggleNewStreakModal}>Close</span>
                                    </Modal.Footer>
                                </Modal>
                                <Modal show={this.state.isVisibleConfirmation}>
                                    <Modal.Header>
                                        <Modal.Title>Streak Requests Confirmation</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <span>Your streak request has been sent.</span>
                                    </Modal.Body>
                                </Modal>
                            </div>
                        </div>
                        <div className='header-mid'>
                            <img src={strikeLogo} className='logo'/>
                        </div>
                        <div className='header-right'>
                            <div className='streak-header-right-item'>
                                <span onClick={this.toggleRequestsModal} className='streak-request-btn glyphicon glyphicon-bell'></span>
                                <Modal show={this.state.isVisibleRequests} onHide={this.toggleRequestsModal}>
                                    <Modal.Header>
                                        <Modal.Title>Streak Requests</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div className='col-container'>
                                            {requestsRender}
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <span onClick={this.toggleRequestsModal}>Close</span>
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
