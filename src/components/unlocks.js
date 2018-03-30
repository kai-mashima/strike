import React, { Component } from 'react';
import { render } from 'react-dom';
import emoji from 'node-emoji';
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
                        <div className='col-container '>
                            <div className='col-item col-container unlock-container'>
                                <span className='unlock-title'>Streaks</span>
                                {
                                    this.props.streaks.map(unlock => (
                                        <div className='col-item row-container unlock-item-container'>
                                            <span className='row-item unlock-item'>{emoji.emojify(`:${unlock.emoji}:`)}</span>
                                            <span className='row-item unlock-item'>{this.props.progress.days}</span>
                                            <span className='row-item unlock-item'>{unlock.goal}</span>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className='col-item col-container unlock-container'>
                                <span className='unlock-title'>Days</span>
                                {
                                    this.props.days.map(unlock => (
                                        <div className='col-item row-container unlock-item-container'>
                                            <span className='row-item unlock-item'>{emoji.emojify(`:${unlock.emoji}:`)}</span>
                                            <span className='row-item unlock-item'>{this.props.progress.days}</span>
                                            <span className='row-item unlock-item'>{unlock.goal}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}