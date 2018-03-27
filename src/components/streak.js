import React, { Component } from 'react';
import { render } from 'react-dom';
import {Modal} from 'react-bootstrap';

export default class Streak extends Component {
    constructor(props){
        super(props);

        this.toggleInfoModal = this.toggleInfoModal.bind(this);
        this.toggleStokeModal = this.toggleStokeModal.bind(this);
        this.handleInitialStoke = this.handleInitialStoke.bind(this);
        this.handleConfirmationStoke = this.handleConfirmationStoke.bind(this);
        this.handleMessageInput = this.handleMessageInput.bind(this);

        this.state = {
            isVisibleInfo: false,
            isVisibleStoke: false,
            message: '',
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
            isVisibleStoke: !this.state.isVisibleStoke
        });
    }

    handleMessageInput(e) {
        this.setState({
            message: e.target.value
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

    render() {
        let userRender = <span className='streak-user-glyph glyphicon glyphicon-user'></span>;

        let initialStokeBtnRender = (!this.props.streak.neutral && this.props.streak.currentOwner === this.props.userID) ? (
            <span onClick={this.handleInitialStoke} className='btn btn-success'>Stoke for ${this.props.streak.stokePrice}</span>
        ) : (
            <span className='btn btn-default disabled'>Stoke</span>
        );

        let confirmationStokeBtnRender = (!this.props.streak.neutral && this.props.streak.currentOwner === this.props.userID) ? (
            <span onClick={this.handleConfirmationStoke} className='btn btn-success'>Stoke for ${this.props.streak.stokePrice}</span>
        ) : (
            <span className='btn btn-default disabled'>Stoke</span>
        );

        let stokeModalRender = (
            <Modal show={this.state.isVisibleStoke} onHide={this.toggleStokeModal}>
                <Modal.Header>
                    <Modal.Title>Stoke Streak With {this.props.streak.friend}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-container'>
                        <input onChange={this.handleMessageInput} placeholder='Message...' />
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


        let messagesRender = <div className='center-text'><span>No messages</span></div>;
        if (this.props.streak.messages) {
            messagesRender = Object.values(this.props.streak.messages).map((message, index) => (
                <div className='col-item' key={index}>
                    <span>{message.message}</span>
                </div>
            ));
        }

        let modalRender = (
            <Modal show={this.state.isVisibleInfo} onHide={this.toggleInfoModal}>
                <Modal.Header>
                    <Modal.Title>Streak With {this.props.streak.friend}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-container'>
                        <div className='col-item streak-modal-container'>
                            <div className='streak-modal-item'>
                                <span>Value: ${this.props.streak.value}</span>
                            </div>
                            <div className='streak-modal-item'>
                                <span>Days: {this.props.streak.days}</span>
                            </div>
                            <div className='streak-modal-item'>
                                <span>Expirates In: {this.props.streak.currentExpirationTime} hours</span>
                            </div>
                        </div>
                        <div className='col-item col-container'>
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
                        <span>{this.props.streak.friend}</span>
                    </div>
                    <div className='streak-item'>
                        <span className='streak-item-glyph glyphicon glyphicon-fire'></span>
                        <span>{this.props.streak.days}</span>
                    </div>
                    <div className='streak-item'>
                        <span className='streak-item-glyph glyphicon glyphicon-time'></span>
                        <span>{this.props.streak.currentExpirationTime}</span>
                    </div>
                </div>
            </div>
        );
    }
}
