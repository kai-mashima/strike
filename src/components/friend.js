import React, { Component } from 'react';
import { render } from 'react-dom';

export default class Friend extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <div className='friends-item'>
                <div className='friend-item-img friend-user-img'>
                    {
                        this.props.friend.imgAvailable ? (
                            <img src='' className='' />
                        ) : (
                            <span className='friend-user-glyph glyphicon glyphicon-user'></span>
                        )
                    }
                </div>
                <div className='friend-item'>
                    <span>{this.props.friend.username}</span>
                </div>
                <div className='friend-item'>
                    <span className='streak-item-glyph glyphicon glyphicon-fire'></span>
                    <span>{this.props.friend.totalStreaks}</span>
                </div>
                <div className='friend-item'>
                    <span className='streak-item-glyph glyphicon glyphicon-flash'></span>
                    <span>{this.props.friend.totalDays}</span>
                </div>
                <div className='friend-item'>
                    <span className='large-font'>$</span>
                    <span>{this.props.friend.value}</span>
                </div>
            </div>
        );
    }
}