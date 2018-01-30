import React, { Component } from 'react';
import { render } from 'react-dom';

export default class Streak extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <div className='streaks-item'>
                <div className='streak-item-img streak-user-img'>
                     {
                        this.props.streak.imgAvailable ? (
                            <img src='' className='' />
                        ) : (
                            <span className='streak-user-glyph glyphicon glyphicon-user'></span>
                        )
                    }
                </div>
                <div className='streak-item'>
                    <span>@{this.props.streak.users[0]} & @{this.props.streak.users[1]}</span>
                </div>
                <div className='streak-item'>
                    <span>{this.props.streak.days} Days</span>
                </div>
                <div className='streak-item'>
                    <span>{this.props.streak.expirationTime} Minutes</span>
                </div>
            </div>
        );
    }
}
