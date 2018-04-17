import React, { Component } from 'react';
import { render } from 'react-dom';
import emoji from 'node-emoji';
import strikeLogo from '../assets/strikeLogo.png';

export default class Unlocks extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    // componentDidMount() {
    //     this.props.getUnlocks(this.props.user);
    //     console.log('Get Unlocks during component mounting');
    // }

    render() {
        let streakRender = this.props.streaks.map((unlock, index) => {
            let completed = false; 
            if (this.props.progress.streaks >= unlock.goal) {
                completed = true;
            }
            
            return (
                <div className='col-item row-container unlock-item-container' key={index}>
                    <span className='row-item unlock-item'>{completed ? emoji.emojify(`:${unlock.emoji}:`) : emoji.emojify(':lock:')}</span>
                    <span className='row-item unlock-item'>{this.props.progress.streaks > unlock.goal ? unlock.goal : this.props.progress.streaks}</span>
                    <span className='row-item unlock-item'>{unlock.goal}</span>
                </div>
            );
        });

        let daysRender =  this.props.days.map((unlock, index) => {
            let completed = false;
            if (this.props.progress.days >= unlock.goal) {
                completed = true;
            }

            return (
                <div className='col-item row-container unlock-item-container' key={index}>
                    <span className='row-item unlock-item'>{completed ? emoji.emojify(`:${unlock.emoji}:`) : emoji.emojify(':lock:')}</span>
                    <span className='row-item unlock-item'>{completed ? unlock.goal : this.props.progress.days}</span>
                    <span className='row-item unlock-item'>{unlock.goal}</span>
                </div>
            );
        });

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
                                <div className='row-container unlock-subtitle-container'>
                                    <span className='row-item unlock-subtitle-item'>Emoji</span>
                                    <span className='row-item unlock-subtitle-item'>Progress</span>
                                    <span className='row-item unlock-subtitle-item'>Goal</span>
                                </div>
                                {streakRender}
                            </div>
                            <div className='col-item col-container unlock-container'>
                                <span className='unlock-title'>Days</span>
                                <div className='row-container unlock-subtitle-container'>
                                    <span className='row-item unlock-subtitle-item'>Emoji</span>
                                    <span className='row-item unlock-subtitle-item'>Progress</span>
                                    <span className='row-item unlock-subtitle-item'>Goal</span>
                                </div>
                                {daysRender}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}