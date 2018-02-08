import React, { Component } from 'react';
import { render } from 'react-dom';
import {Modal} from 'react-bootstrap';

export default class Streak extends Component {
    constructor(props){
        super(props);

        this.toggleModal = this.toggleModal.bind(this);
        this.handleStreakStoke = this.handleStreakStoke.bind(this);

        this.state = {
            isVisible: false,
        }
    }

    toggleModal() {
        this.setState({
            isVisible: !this.state.isVisible
        });
    }

    handleStreakStoke() {
        this.props.stokeStreak(this.props.streak.id, this.props.userID);
        this.toggleModal();
    }

    render() {
        let userRender = <span className='streak-user-glyph glyphicon glyphicon-user'></span>;
        // this.props.streak.imgAvailable ? (
        //     <img src='' className='' />
        // ) : (
        //     <span className='streak-user-glyph glyphicon glyphicon-user'></span>
        // );

        let stokeBtnRender = (this.props.streak.friendTurn) ? ( //add onclick to active btn
            <span onClick={this.handleStreakStoke} className='btn btn-success'>Stoke</span>
        ) : (
            <span className='btn btn-default disabled'>Stoke</span>
        );

        let modalRender = (
            <Modal show={this.state.isVisible} onHide={this.toggleModal}>
                <Modal.Header>
                    <Modal.Title>Streak Info</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='col-container'>
                        <p>Streak Info</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className='streak-modal-footer-container row-container'>
                        <div className='streak-modal-footer-item row-item'>
                            <span className='btn btn-success'>Boost</span>
                        </div>
                        <div className='streak-modal-footer-item row-item'>
                            {stokeBtnRender}
                        </div>
                        <div className='streak-modal-footer-item row-item'>
                            <span className='btn btn-danger' onClick={this.toggleModal}>Close</span>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        );

        return (
            <div>
                {modalRender}
                <div onClick={this.toggleModal} className='streaks-item'>
                    <div className='streak-item-img streak-user-img'>
                        {userRender}
                    </div>
                    <div className='streak-item'>
                        <span>@{this.props.streak.friend}</span>
                    </div>
                    <div className='streak-item'>
                        <span>{this.props.streak.days}</span>
                        <span className='streak-item-glyph glyphicon glyphicon-fire'></span>
                    </div>
                    <div className='streak-item'>
                        <span>{this.props.streak.expirationTime}</span>
                        <span className='streak-item-glyph glyphicon glyphicon-time'></span>
                    </div>
                </div>
            </div>
        );
    }
}
