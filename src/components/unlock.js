import React, { Component } from 'react';
import { render } from 'react-dom';
import { Modal } from 'react-bootstrap';
import Emoji from 'node-emoji';

export default class Unlock extends Component {
    constructor(props){
        super(props);

        this.toggleDescriptionModal = this.toggleDescriptionModal.bind(this);

        this.state = {
            isVisible: false,
        };
    }

    toggleDescriptionModal() {
        this.setState({
            isVisible: !this.state.isVisible
        });
    }

    render() {
        let descriptionModalRender = (
            <Modal show={this.state.isVisible} onHide={this.toggleDescriptionModal}>
                <Modal.Header>
                    <Modal.Title>Unlock Description: {this.props.emoji}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row-container'>
                        <span>{this.props.description}</span>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <span className='btn btn-danger' onClick={this.toggleDescriptionModal}>Close</span>
                </Modal.Footer>
            </Modal>
        );

        return (
            <div>
                {descriptionModalRender}
                <div className='col-item row-container unlock-item-container' onClick={this.toggleDescriptionModal}>
                    <span className='row-item unlock-item'>{this.props.emoji}</span>
                    <span className='row-item unlock-item'>{this.props.progress}</span>
                    <span className='row-item unlock-item'>{this.props.goal}</span>
                </div>
            </div>
        );
    }
}