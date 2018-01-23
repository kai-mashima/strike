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
        this.handleSubmit = this.handleSubmit.bind(this);

        //STATE
        this.state = {
            email: null,
            password: null,
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

    handleSubmit(){
        this.props.loginUser(this.state.email, this.state.password);
    }

    render() {
        return (
            <div>
                <div className='content login-container'>
                    <div className='login-logo'>
                        <img src={strikeLogo} className='login-logo'/>
                    </div>
                    <div className='login-block'>
                        <input className='login-input login-item' type='email' onChange={this.handleEmail} placeholder='E-Mail' />
                        <input className='login-input login-item' type='password' onChange={this.handlePassword} placeholder='Password' />
                        <input className='btn login-item' type='submit' value='Login' onClick={this.handleSubmit}/>
                    </div>
                </div>
            </div>
        );
    }
}