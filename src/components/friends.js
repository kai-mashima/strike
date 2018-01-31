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
        this.handleAddFriend = this.handleAddFriend.bind(this);
        this.handleSearchInput = this.handleSearchInput.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);

        this.state = {
            isVisible: false,
            searchResults: null,
            searchInput: null,
        }
    }

    handleSearchInput(e) {
        this.setState({
            searchInput: e.target.value
        });
    }

    handleSearchSubmit() {
        this.props.searchUsers(this.state.searchInput)
        .then(result => {
            this.setState({
                searchResults: result
            });
        });
    }

    toggleAddFriendModal(){
        this.setState({
            isVisible: !this.state.isVisible
        });
    }

    handleAddFriend(){
        this.props.addFriend(this.props.user, this.state.searchResults.uid);
    }

    render() {
        return (
            <div>
                <div className='main'>
                    <div className='header'>
                        <div className='header-left'>
                            <div className='friends-header-left-item'>
                                <span onClick={this.toggleAddFriendModal} className='add-friend-btn glyphicon glyphicon-plus-sign'></span>
                                <Modal show={this.state.isVisible} onHide={this.toggleAddFriendModal}>
                                    <Modal.Header>
                                        <Modal.Title>Add Friend</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div className='search-body'>
                                            <div className='search-body-item search-header'>
                                                <span className='search-header-item add-friend-search glyphicon glyphicon-search'></span>
                                                <input className='search-header-item add-friend-input' onChange={this.handleSearchInput} placeholder='Search friend by username...'/>
                                                <span className='search-header-item btn btn-default' onClick={this.handleSearchSubmit}>Search</span>
                                            </div>
                                            <div className='search-body-item'>
                                                <div className='search-content'>
                                                    {
                                                        this.state.searchResults ? (
                                                            <div className='search-item'>
                                                                <span className='search-item-part'>{this.state.searchResults.first}</span>
                                                                <span className='search-item-part'>{this.state.searchResults.last}</span>
                                                                <span className='add-friend-btn search-item-part btn btn-success' onClick={this.handleAddFriend}>Add</span>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div> 
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <span onClick={this.toggleAddFriendModal}>Close</span>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        </div>
                        <div className='header-mid'>
                            <img src={strikeLogo} className='logo'/>
                        </div>
                        <div className='header-right'>
                            <span className='friends-header-right-item'>{this.props.friends.length} friends</span>
                        </div>
                    </div>
                    <div className='content'>
                        <div className='friends-content'>
                            {
                                this.props.friends ? (
                                    this.props.friends.map((friend, index) => (
                                        <Friend key={index} friend={friend} />
                                    ))
                                ) : (
                                    <div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
