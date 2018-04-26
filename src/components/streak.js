import React, { Component } from 'react';
import { render } from 'react-dom';
import {Modal} from 'react-bootstrap';
import emoji from 'node-emoji';

export default class Streak extends Component {
    constructor(props){
        super(props);

        this.toggleInfoModal = this.toggleInfoModal.bind(this);
        this.toggleStokeModal = this.toggleStokeModal.bind(this);
        this.handleInitialStoke = this.handleInitialStoke.bind(this);
        this.handleConfirmationStoke = this.handleConfirmationStoke.bind(this);
        this.handleEmojiClick = this.handleEmojiClick.bind(this);

        this.state = {
            isVisibleInfo: false,
            isVisibleStoke: false,
            message: [],
        }
    }

    //toggle state for streak information modal
    toggleInfoModal() {
        this.setState({
            isVisibleInfo: !this.state.isVisibleInfo
        });
    }

    toggleStokeModal() {
        this.setState({
            isVisibleStoke: !this.state.isVisibleStoke,
            message: [],
        });
    }

    //stoke a streak and toggle modal
    handleInitialStoke() {
        this.toggleStokeModal();
    }

    handleConfirmationStoke() {
        this.props.stokeStreak(this.props.streak.id, this.props.userID, this.props.streak.friendID, this.state.message);
        this.toggleStokeModal();
        this.toggleInfoModal();
    }

    handleEmojiClick(e) {
        let emojiCode = e.target.id;
        let message = this.state.message.slice();

        message.push(emojiCode);

        this.setState({
            message: message
        });
    }

    render() {
        const streak = this.props.streak;
        let expiring = false;
        if (streak.currentExpired && streak.currentOwner === this.props.userID) {
            expiring = true;
        }

        let userRender = <span className='streak-user-glyph glyphicon glyphicon-user'></span>;

        let initialStokeBtnRender = expiring ? (
            <span onClick={this.handleInitialStoke} className='btn btn-success'>Stoke for ${streak.stokePrice}</span>
        ) : (
            <span className='btn btn-default disabled'>Stoke</span>
        );

        let confirmationStokeBtnRender = expiring ? (
            <span onClick={this.handleConfirmationStoke} className='btn btn-success'>Stoke for ${streak.stokePrice}</span>
        ) : (
            <span className='btn btn-default disabled'>Stoke</span>
        );

        let expirationGlyphRender = <span className='streak-item-glyph glyphicon glyphicon-time'></span>
        if (expiring) {
            expirationGlyphRender = (
                <span className='streak-item-glyph glyphicon glyphicon-time expiring'></span>
            );
        } else {
            expirationGlyphRender = (
                <span className='streak-item-glyph glyphicon glyphicon-time stoked'></span>
            );
        }

        let stokeModalRender = (
            <Modal show={this.state.isVisibleStoke} onHide={this.toggleStokeModal}>
                <Modal.Header>
                    <Modal.Title>Stoke Streak With {streak.friend}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-container emoji-container'>
                        <div className='col-item emoji-message-preview row-container'>
                            {
                                this.state.message.map((emojiCode, index) => (
                                    <span key={index} className='row-item emoji-message-item'>{emoji.emojify(`:${emojiCode}:`)}</span>
                                ))
                            }
                        </div>
                        <div className='col-item row-container emoji-bank-container'>
                            {
                                this.props.unlocks.map((emojiCode, index) => (
                                    <span key={index} onClick={this.handleEmojiClick} id={emojiCode} className='row-item emoji-bank-item'>
                                        {emoji.emojify(`:${emojiCode}:`)}
                                    </span>
                                ))
                            }
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className='streak-modal-footer-container row-container'>
                        <div className='streak-modal-footer-item row-item'>
                            {confirmationStokeBtnRender}
                        </div>
                        <div className='streak-modal-footer-item row-item'>
                            <span className='btn btn-danger' onClick={this.toggleStokeModal}>Close</span>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        );


        let messagesRender = <div className='center-text light-small-text'><span>No messages</span></div>;
        if (streak.messages) {
            messagesRender = Object.values(streak.messages).map((message, index) => {
                let messageSender = 'You';
                if (message.sender !== this.props.userID) {
                    messageSender = streak.friend;
                }

                return (
                    <div className='col-item row-container emoji-message' key={index}>
                        <span className='row-item emoji-message-item'>{messageSender}:</span>
                        <div className='row-item emoji-message-item'>
                            {
                                message.message.map((emojiCode, index) => (
                                    <span key={index} className='emoji-message-item'>{emoji.emojify(`:${emojiCode}:`)}</span>
                                ))
                            }
                        </div>
                    </div>
                );
            });
        }

        let modalRender = (
            <Modal show={this.state.isVisibleInfo} onHide={this.toggleInfoModal}>
                <Modal.Header>
                    <Modal.Title>Streak With {streak.friend}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-container'>
                        <div className='col-item streak-modal-container'>
                            <div className='streak-modal-item'>
                                <span>Value: ${streak.value}</span>
                            </div>
                            <div className='streak-modal-item'>
                                <span>Days: {streak.days}</span>
                            </div>
                            <div className='streak-modal-item'>
                                <span>Expirates In: {streak.currentExpirationTime} hours</span>
                            </div>
                        </div>
                        <div className='col-item emoji-messages-container'>
                            <div className='col-item row-container message-subtitle-container'>
                                <span className='row-item message-subtitle-item'>Sender</span>
                                <span className='row-item message-subtitle-item'>Message</span>
                                <span className='row-item message-subtitle-item'></span>
                            </div>
                            {messagesRender}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className='streak-modal-footer-container row-container'>
                        <div className='streak-modal-footer-item row-item'>
                            <span className='btn btn-success'>Boost</span>
                        </div>
                        <div className='streak-modal-footer-item row-item'>
                            {initialStokeBtnRender}
                        </div>
                        <div className='streak-modal-footer-item row-item'>
                            <span className='btn btn-danger' onClick={this.toggleInfoModal}>Close</span>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        );
        
        return (
            <div>
                {modalRender}
                {stokeModalRender}
                <div onClick={this.toggleInfoModal} className='streaks-item'>
                    <div className='streak-item-img streak-user-img'>
                        {userRender}
                    </div>
                    <div className='streak-item'>
                        <span>{streak.friend}</span>
                    </div>
                    <div className='streak-item'>
                        <span className='streak-item-glyph glyphicon glyphicon-fire'></span>
                        <span>{streak.days}</span>
                    </div>
                    <div className='streak-item'>
                        {expirationGlyphRender}
                        <span>{streak.currentExpirationTime}</span>
                    </div>
                </div>
            </div>
        );
    }
}
