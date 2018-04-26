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
            const goal = streaksInfo[unlock].goal;
            const completed = streakProgress >= goal ? true : false;
            const emoji = completed ? Emoji.emojify(`:${unlock}:`) : Emoji.emojify(':lock:');
            const progress = streakProgress <= goal ? streakProgress : goal;
            return (
                <Unlock description={streaksInfo[unlock].description} emoji={emoji} progress={progress} goal={goal} key={index}/>
            );
        });

        const daysInfo = bank.days.emojis;
        const days = Object.keys(daysInfo);
        const daysProgress = this.props.progress.days;

        const daysRender =  days.map((unlock, index) => {
            const goal = daysInfo[unlock].goal;
            const completed = daysProgress >= goal ? true : false;
            const emoji = completed ? Emoji.emojify(`:${unlock}:`) : Emoji.emojify(':lock:');
            const progress = daysProgress <= goal ? daysProgress : goal;
            return (
                <Unlock description={daysInfo[unlock].description} emoji={emoji} progress={progress} goal={goal} key={index}/>
            );
        });

        const friendsInfo = bank.friends.emojis;
        const friends = Object.keys(friendsInfo);
        const friendsProgress = this.props.progress.friends;

        const friendsRender = friends.map((unlock, index) => {
            const goal = friendsInfo[unlock].goal;
            const completed = friendsProgress >= goal ? true : false;
            const emoji = completed ? Emoji.emojify(`:${unlock}:`) : Emoji.emojify(':lock:');
            const progress = friendsProgress <= goal ? friendsProgress : goal;
            return (
                <Unlock description={friendsInfo[unlock].description} emoji={emoji} progress={progress} goal={goal} key={index}/>
            );
        });

        const terminatedInfo = bank.terminated.emojis;
        const terminated = Object.keys(terminatedInfo);
        const terminatedProgress = this.props.progress.terminated;

        const terminatedRender = terminated.map((unlock, index) => {
            const goal = terminatedInfo[unlock].goal;
            const completed = terminatedProgress >= goal ? true : false;
            const emoji = completed ? Emoji.emojify(`:${unlock}:`) : Emoji.emojify(':lock:');
            const progress = terminatedProgress <= goal ? terminatedProgress : goal;
            return (
                <Unlock description={terminatedInfo[unlock].description} emoji={emoji} progress={progress} goal={goal} key={index}/>
            );
        });

        const subtitleRender = (
            <div className='row-container unlock-subtitle-container'>
                <span className='row-item unlock-subtitle-item'>Emoji</span>
                <span className='row-item unlock-subtitle-item'>Progress</span>
                <span className='row-item unlock-subtitle-item'>Goal</span>
            </div>
        );

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
                                {subtitleRender}
                                {streakRender}
                            </div>
                            <div className='col-item col-container unlock-container'>
                                <span className='unlock-title'>Days</span>
                                {subtitleRender}
                                {daysRender}
                            </div>
                            <div className='col-item col-container unlock-container'>
                                <span className='unlock-title'>Friends</span>
                                {subtitleRender}
                                {friendsRender}
                            </div>
                            <div className='col-item col-container unlock-container'>
                                <span className='unlock-title'>Termination</span>
                                {subtitleRender}
                                {terminatedRender}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}