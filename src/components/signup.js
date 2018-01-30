import React, { Component } from 'react';
import { render } from 'react-dom';
import { Modal } from 'react-bootstrap';
import strikeLogo from '../assets/strikeLogo.png';

export default class Signup extends Component {
    constructor(props){
        super(props);

        //BINDING
        this.toggleSignup = this.toggleSignup.bind(this);
        this.handleFirstName = this.handleFirstName.bind(this);
        this.handleLastName = this.handleLastName.bind(this);
        this.handleUsername = this.handleUsername.bind(this);
        this.handleEmail = this.handleEmail.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleSignup = this.handleSignup.bind(this);

        //STATE
        this.state = {
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            password: '',
            isVisible: false,
        };
    }

    handleFirstName(e){
        this.setState({
            firstName: e.target.value
        });
    }

    handleLastName(e){
        this.setState({
            lastName: e.target.value
        });
    }

    handleUsername(e){
        this.setState({
            username: e.target.value
        });
    }

    handleEmail(e){
        this.setState({
            email: e.target.value
        });
    }

    handlePassword(e){
        this.setState({
            password: e.target.value
        });
    }

    toggleSignup(){
        this.setState({
            isVisible: !this.state.isVisible
        });
    }

    handleSignup(){
        this.props.signupUser(this.state.email, this.state.password, this.state.username, this.state.firstName, this.state.lastName, 0, 5, false, null, 0, 0);
    }

    render() {
        return (
            <div>
                <div className='login-footer'>
                    <p className='login-footer-item'>Don't have an account?</p>
                    <p className='signup-text login-footer-item' onClick={this.toggleSignup}>Sign Up</p>
                    <Modal show={this.state.isVisible} onHide={this.toggleSignup}>
                        <Modal.Header>
                            <Modal.Title>Sign Up</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className='signup-modal-container'>
                                <input className='signup-modal-item signup-modal-input' type='text' onChange={this.handleFirstName} placeholder='First Name' />
                                <input className='signup-modal-item signup-modal-input' type='text' onChange={this.handleLastName} placeholder='Last Name' />
                                <input className='signup-modal-item signup-modal-input' type='text' onChange={this.handleUsername} placeholder='Username' />
                                <input className='signup-modal-item signup-modal-input' type='email' onChange={this.handleEmail} placeholder='E-Mail' />
                                <input className='signup-modal-item signup-modal-input' type='password' onChange={this.handlePassword} placeholder='Password' />
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <span className='btn btn-success' onClick={this.handleSignup}>Sign Up</span>
                            <span className='btn btn-default' onClick={this.toggleSignup}>Close</span>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        );
    }
}