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

    render() {
        const bank = this.props.emojis;

        const streaksInfo = bank.streaks.emojis;
        const streaks = Object.keys(streaksInfo);
        const streakProgress = this.props.progress.streaks;

        let streakRender = streaks.map((unlock, index) => {
            let completed = streakProgress >= streaksInfo[unlock].goal ? true : false;
            return (
                <div className='col-item row-container unlock-item-container' key={index}>
                    <span className='row-item unlock-item'>{completed ? emoji.emojify(`:${unlock}:`) : emoji.emojify(':lock:')}</span>
                    <span className='row-item unlock-item'>{streakProgress}</span>
                    <span className='row-item unlock-item'>{streaksInfo[unlock].goal}</span>
                </div>
            );
        });

        const daysInfo = bank.days.emojis;
        const days = Object.keys(daysInfo);
        const daysProgress = this.props.progress.days;

        let daysRender =  days.map((unlock, index) => {
            let completed = daysProgress >= daysInfo[unlock].goal ? true : false;

            return (
                <div className='col-item row-container unlock-item-container' key={index}>
                    <span className='row-item unlock-item'>{completed ? emoji.emojify(`:${unlock}:`) : emoji.emojify(':lock:')}</span>
                    <span className='row-item unlock-item'>{daysProgress}</span>
                    <span className='row-item unlock-item'>{daysInfo[unlock].goal}</span>
                </div>
            );
        });

        const friendsInfo = bank.friends.emojis;
        const friends = Object.keys(friendsInfo);
        const friendsProgress = this.props.progress.friends;

        let friendsRender = friends.map((unlock, index) => {
            let completed = friendsProgress >= friendsInfo[unlock].goal ? true : false;

            return (
                <div className='col-item row-container unlock-item-container' key={index}>
                    <span className='row-item unlock-item'>{completed ? emoji.emojify(`:${unlock}:`) : emoji.emojify(':lock:')}</span>
                    <span className='row-item unlock-item'>{friendsProgress}</span>
                    <span className='row-item unlock-item'>{friendsInfo[unlock].goal}</span>
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
                            <div className='col-item col-container unlock-container'>
                                <span className='unlock-title'>Friends</span>
                                <div className='row-container unlock-subtitle-container'>
                                    <span className='row-item unlock-subtitle-item'>Emoji</span>
                                    <span className='row-item unlock-subtitle-item'>Progress</span>
                                    <span className='row-item unlock-subtitle-item'>Goal</span>
                                </div>
                                {friendsRender}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}