import React, { Component } from 'react';
import { render } from 'react-dom';
import Friend from './friend.js';
import {Modal} from 'react-bootstrap';
import strikeLogo from '../assets/strikeLogo.png';

export default class Friends extends Component {
    constructor(props){
        super(props);

        //BINDING
        this.toggleAddFriendModal = this.toggleAddFriendModal.bind(this);
        this.handleSendFriendRequest = this.handleSendFriendRequest.bind(this);
        this.handleSearchInput = this.handleSearchInput.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.toggleFriendRequestModal = this.toggleFriendRequestModal.bind(this);
        this.handleRequestAcceptance = this.handleRequestAcceptance.bind(this);
        this.handleRequestRejection = this.handleRequestRejection.bind(this);
        this.clearSearchResults = this.clearSearchResults.bind(this);

        //STATE
        this.state = {
            isVisibleAdd: false,
            isVisibleRequests: false,
            isVisibleConfirmation: false,
            searchResults: [],
            searchInput: null,
        }
    }

    //grab search input information
    handleSearchInput(e) {
        this.setState({
            searchInput: e.target.value
        });
    }

    //search for a user by username and populate state with results
    handleSearchSubmit() {
        this.props.searchUsers(this.state.searchInput, this.props.user)
        .then(result => {
            this.setState({
                searchResults: result
            });
        });
    }

    clearSearchResults() {
        this.setState({
            searchInput: null,
        });
    }

    //toggle state for adding a friend modal
    toggleAddFriendModal(){
        this.setState({
            isVisibleAdd: !this.state.isVisibleAdd
        });
    }

    //toggle state for adding a friend modal
    toggleConfirmationModal(){
        this.setState({
            isVisibleConfirmation: true
        });

        setTimeout(() => {
            this.setState({
                isVisibleConfirmation: false
            });
        }, 3000);
    }

    //add a friend with search results info
    handleSendFriendRequest(){
        let confirmation = this.props.sendFriendRequest(this.props.user, this.state.searchResults.uid);
        this.toggleAddFriendModal();
        this.clearSearchResults();
        if (confirmation) {
            this.toggleConfirmationModal();
        }
    }

    toggleFriendRequestModal(){
        this.setState({
            isVisibleRequests: !this.state.isVisibleRequests
        });
    }

    //accept friend request and toggle modal
    handleRequestAcceptance(requestID, userID, friendID) {
        this.props.acceptFriendRequest(requestID, userID, friendID);
        this.toggleFriendRequestModal();
    }

    //reject friend request and toggle modal
    handleRequestRejection(requestID, userID, friendID) {
        this.props.rejectFriendRequest(requestID, userID, friendID);
        this.toggleFriendRequestModal();
    }

    render() {
        let searchRender = <div><span>No Users Found</span></div>;
        if (this.state.searchResults.length != 0) {
            let searchAddBtn = this.state.searchResults.self ? (
                <span className='add-friend-btn search-item-part btn btn-secondary disabled'>Add</span>
            ) : (
                <span className='add-friend-btn search-item-part btn btn-success' onClick={this.handleSendFriendRequest}>Add</span>
            )
            searchRender =  (
                <div className='search-item'>
                    <span className='search-item-part'>{this.state.searchResults.first}</span>
                    <span className='search-item-part'>{this.state.searchResults.last}</span>
                    {searchAddBtn}
                </div>
            );
        }

        let requestsRender = <div><span>You have no friend requests</span></div>;
        if (this.props.requests.length != 0) { 
            //handle no unanswered requests
            requestsRender = this.props.requests.map((request, index) => {
                if (request.answered !== true) {
                    return (
                        <div className='col-item row-container request-list-container' key={index}>
                            <span className='request-list-item row-item'>@{request.senderUsername}</span>
                            <span className='request-list-item row-item btn btn-success' onClick={() => this.handleRequestAcceptance(request.id, request.recipient, request.sender)}>Accept Friend Request</span>
                            <span className='request-list-item row-item btn btn-danger' onClick={() => this.handleRequestRejection(request.id, request.recipient, request.sender)}>Reject Friend Request</span>
                        </div>
                    )
                }
            });
        }

        // let friendsCountRender = <span className='friends-header-right-item'>0 friends</span>;
        // if (this.props.friends.length != 0) {
        //     friendsCountRender = <span className='friends-header-right-item'>{this.props.friends.length} friends</span>;
        // }

        let friendsRender = <div><span>You have no friends</span></div>;
        if (this.props.friends.length != 0) {
            friendsRender = this.props.friends.map((friend, index) => (
                <Friend user={this.props.user} key={index} friend={friend} removeFriend={this.props.removeFriend}/>
            ));
        }

        return (
            <div>
                <div className='main'>
                    <div className='header'>
                        <div className='header-left'>
                            <div className='friends-header-left-item'>
                                <span onClick={this.toggleAddFriendModal} className='add-friend-btn glyphicon glyphicon-plus-sign'></span>
                                <Modal show={this.state.isVisibleAdd} onHide={this.toggleAddFriendModal}>
                                    <Modal.Header>
                                        <Modal.Title>Add Friend</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div className='search-body'>
                                            <div className='search-body-item search-header'>
                                                <span className='search-header-item add-friend-search glyphicon glyphicon-search'></span>
                                                <input className='search-header-item add-friend-input' onChange={this.handleSearchInput} placeholder='Search friend by username...'/>
                                                <span className='search-header-item btn btn-success' onClick={this.handleSearchSubmit}>Search</span>
                                            </div>
                                            <div className='search-body-item'>
                                                <div className='search-content'>
                                                    {searchRender}
                                                </div>
                                            </div> 
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <span onClick={this.toggleAddFriendModal}>Close</span>
                                    </Modal.Footer>
                                </Modal>
                                <Modal show={this.state.isVisibleConfirmation}>
                                    <Modal.Header>
                                        <Modal.Title>Friend Requests Confirmation</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <span>Your friend request has been sent.</span>
                                    </Modal.Body>
                                </Modal>
                            </div>
                        </div>
                        <div className='header-mid'>
                            <img src={strikeLogo} className='logo'/>
                        </div>
                        <div className='header-right'>
                            <div className='friends-header-right-item'>
                                <span onClick={this.toggleFriendRequestModal} className='add-friend-btn glyphicon glyphicon-bell'></span>
                                <Modal show={this.state.isVisibleRequests} onHide={this.toggleFriendRequestModal}>
                                    <Modal.Header>
                                        <Modal.Title>Friend Requests</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div className='col-container'>
                                            {requestsRender}
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <span onClick={this.toggleFriendRequestModal}>Close</span>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        </div>
                    </div>
                    <div className='content'>
                        <div className='friends-content'>
                            {friendsRender}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
