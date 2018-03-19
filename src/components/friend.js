import React, { Component } from 'react';
import { render } from 'react-dom';
import {Modal} from 'react-bootstrap';

export default class Friend extends Component {
    constructor(props){
        super(props);

        this.toggleInfoModal = this.toggleInfoModal.bind(this);
        this.toggleConfirmationModal = this.toggleConfirmationModal.bind(this);
        this.handleRemoveFriend = this.handleRemoveFriend.bind(this);


        this.state = {
            isVisibleInfo: false,
            isVisibleConfirmation: false,
        };
    }

    toggleInfoModal() {
        this.setState({
            isVisibleInfo: !this.state.isVisibleInfo
        });
    }

    toggleConfirmationModal() {
        this.setState({
            isVisibleConfirmation: true,
        });

        setTimeout(() => {
            this.setState({
                isVisibleConfirmation: false,
            });           
        }, 3000);
    }

    handleRemoveFriend(){
        this.props.removeFriend(friendID)
        .then(confirmation => {
            this.toggleInfoModal();
            if (confirmation) {
                this.toggleConfirmationModal();
            }
        });
    }

    render() {
        let modalRender = (
            <Modal show={this.state.isVisibleInfo} onHide={this.toggleInfoModal}>
                <Modal.Header>
                    <Modal.Title>Friend Info</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row-container'>
                        <span onClick={this.handleRemoveFriend()}>Remove Friend</span>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className='row-container'>
                        <div className='row-item'>
                            <span className='btn btn-danger' onClick={this.toggleInfoModal}>Close</span>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        );

        return (
            <div>
                {modalRender}
                <div className='friends-item' onClick={this.toggleInfoModal}>
                    <div className='friend-item-img friend-user-img'>
                        {
                            this.props.friend.imgAvailable ? (
                                <img src='' className='' />
                            ) : (
                                <span className='friend-user-glyph glyphicon glyphicon-user'></span>
                            )
                        }
                    </div>
                    <div className='friend-item'>
                        <span>{this.props.friend.username}</span>
                    </div>
                    <div className='friend-item'>
                        <span className='streak-item-glyph glyphicon glyphicon-fire'></span>
                        <span>{this.props.friend.totalStreaks}</span>
                    </div>
                    <div className='friend-item'>
                        <span className='streak-item-glyph glyphicon glyphicon-flash'></span>
                        <span>{this.props.friend.totalDays}</span>
                    </div>
                    <div className='friend-item'>
                        <span className='large-font'>$</span>
                        <span>{this.props.friend.value}</span>
                    </div>
                </div>
            </div>
        );
    }
}