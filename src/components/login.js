import React, { Component } from 'react';
import { render } from 'react-dom';
import { Modal } from 'react-bootstrap';
import strikeLogo from '../assets/strikeLogo.png';

export default class Login extends Component {
    constructor(props){
        super(props);

        //BINDING
        this.handleEmail = this.handleEmail.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.failedLoginModalToggle = this.failedLoginModalToggle.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        //STATE
        this.state = {
            email: '',
            password: '',
            isVisible: false,
        };
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

    failedLoginModalToggle(){
        this.setState({
            isVisible: !this.state.isVisible,
            email: '',
            password: '',
        });
    }

    handleSubmit(){
        this.props.loginUser(this.state.email, this.state.password).then(result => {
            if (result === false) {
                this.failedLoginModalToggle();
            }
        });
    }

    render() {
        return (
            <div>
                <div className='content login-container'>
                    <div className='login-logo'>
                        <img src={strikeLogo} className='login-logo'/>
                    </div>
                    <div className='login-block'>
                        <input className='login-input login-item' type='email' value={this.state.email} onChange={this.handleEmail} placeholder='E-Mail' />
                        <input className='login-input login-item' type='password' value={this.state.password} onChange={this.handlePassword} placeholder='Password' />
                        <input className='btn login-item' type='submit' value='Login' onClick={this.handleSubmit}/>

                        <Modal show={this.state.isVisible} onHide={this.failedLoginModalToggle}>
                            <Modal.Header>
                                <Modal.Title>Forgot Password?</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <span>The login information you entered was incorrect.</span>
                            </Modal.Body>
                            <Modal.Footer>
                                <span className='btn btn-success' onClick={this.failedLoginModalToggle}>Try Again</span>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </div>
        );
    }
}