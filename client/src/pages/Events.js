import React, {Component} from 'react';
import Backdrop from '../components/Backdrop';
import Modal from '../components/Modal';
import './event.css'

class EventPage extends Component {

    state = {
        creating: false
    }

    startCreateEventHandler = () => {
        this.setState({
            creating: true
        })
    }

    onCancel = () => {
        this.setState({
            creating: false
        })
    }

    onConfirm = () => {
        this.setState({
            creating: false
        })
    }

    render() {
        return (
            <React.Fragment>
                    {this.state.creating && <Backdrop />}
                    {this.state.creating && 
                    <Modal title="Add Event" 
                        canCancel 
                        canConfirm 
                        onCancel={this.onCancel} 
                        onConfirm={this.onCancel}>
                        <form>
                            <div className="form-control">
                                <label htmlFor="title">Title</label>
                                <input type="text" id="title"></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="price">Price</label>
                                <input type="number" id="price"></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="date">Date</label>
                                <input type="date" id="date"></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="description">Description</label>
                                <textarea id="description" rows="4"></textarea>
                            </div>
                        </form>
                    </Modal>}
                    <div className="event-control">
                        <p>Share your own Events!</p>
                        <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>    
                    </div>
            </React.Fragment>
        )
    }
}

export default EventPage