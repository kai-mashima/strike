import React, { Component } from 'react';
import { render } from 'react-dom';
import strikeLogo from '../assets/strikeLogo.png';

export default class Unlocks extends Component {
    render() {
        return (
            <div>
                <div className='main'>
                    <div className='header'>
                        <div className='header-left'>
                        </div>
                        <div className='header-mid'>
                            <img src={strikeLogo} className='logo'/>
                        </div>
                        <div className='header-right'>
                        </div>
                    </div>
                    <div className='content'>
                        <p>Unlocks</p>
                    </div>
                </div>
            </div>
        );
    }
}