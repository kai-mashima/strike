import React, { Component } from 'react';
import { render } from 'react-dom';
import Emoji from 'node-emoji';
import strikeLogo from '../assets/strikeLogo.png';
import Unlock from './unlock.js'

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

        const streakRender = streaks.map((unlock, index) => {
            const completed = streakProgress >= streaksInfo[unlock].goal ? true : false;
            const emoji = completed ? Emoji.emojify(`:${unlock}:`) : Emoji.emojify(':lock:');
            return (
                <Unlock description={streaksInfo[unlock].description} emoji={emoji} progress={streakProgress} goal={streaksInfo[unlock].goal} key={index}/>
            );
        });

        const daysInfo = bank.days.emojis;
        const days = Object.keys(daysInfo);
        const daysProgress = this.props.progress.days;

        let daysRender =  days.map((unlock, index) => {
            let completed = daysProgress >= daysInfo[unlock].goal ? true : false;
            const emoji = completed ? Emoji.emojify(`:${unlock}:`) : Emoji.emojify(':lock:');
            return (
                <Unlock description={daysInfo[unlock].description} emoji={emoji} progress={daysProgress} goal={daysInfo[unlock].goal} key={index}/>
            );
        });

        const friendsInfo = bank.friends.emojis;
        const friends = Object.keys(friendsInfo);
        const friendsProgress = this.props.progress.friends;

        let friendsRender = friends.map((unlock, index) => {
            let completed = friendsProgress >= friendsInfo[unlock].goal ? true : false;
            const emoji = completed ? Emoji.emojify(`:${unlock}:`) : Emoji.emojify(':lock:');
            return (
                <Unlock description={friendsInfo[unlock].description} emoji={emoji} progress={friendsProgress} goal={friendsInfo[unlock].goal} key={index}/>
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