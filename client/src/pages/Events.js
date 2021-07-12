import React, {Component} from 'react';
import Backdrop from '../components/Backdrop';
import EventList from '../components/event/eventList/eventList';
import Modal from '../components/Modal';
import Spinner from '../components/spinner/Spinner';
import AuthContext from '../context/auth-context';
import './event.css'

class EventPage extends Component {

    state = {
        creating: false,
        events: [],
        isLoading: false,
        selectedEvent: null
    }

    isActive = true

    static contextType = AuthContext

    constructor(props) {
        super(props)
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();

    }

    componentDidMount() {
        this.fetchEvents()
    }

    startCreateEventHandler = () => {
        this.setState({
            creating: true
        })
    }

    onCancel = () => {
        this.setState({
            creating: false, selectedEvent: null
        })
    }

    onConfirm = () => {
        this.setState({
            creating: false
        })
        const title = this.titleElRef.current.value.trim()
        const price = +this.priceElRef.current.value
        const date = this.dateElRef.current.value.trim()
        const description = this.descriptionElRef.current.value.trim()

        if(title.length === 0 || price <= 0 || date.length === 0 || description.length === 0) {
            return
        }

        const requestBody = {
            query: `
                mutation {
                    createEvent(eventInput: {title: "${title}", price: ${price}, date: "${date}", description: "${description}"}) {
                        _id
                        title
                        description
                        price
                        date
                    }
                }
            `
        }
        
        const token = this.context.token

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!')
            }
            return res.json()
        })
        .then(resData => {
            if(this.isActive) {
                this.setState(prevstate => {
                    const updatedEvents = [...prevstate.events]
                    const {_id, title, description, price, date} = resData.data.createEvent
                    updatedEvents.push({
                        _id: _id,
                        title: title,
                        description: description, 
                        price: price,
                        date: date,
                        creator: {
                            _id: this.context.userId
                        }
                    })
                    return {events: updatedEvents}
                })
            }
        })
        .catch(err => {
            console.log(err)
        })

    }

    fetchEvents() {
        this.setState({isLoading: true})
        const requestBody = {
            query: `
                query {
                    events {
                        _id
                        title
                        description
                        price
                        date
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        }
        
        const token = this.context.token

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!')
            }
            return res.json()
        })
        .then(resData => {
            const events = resData.data.events
            if(this.isActive) {
                this.setState({
                    events,
                    isLoading: false
                })
            }
        })
        .catch(err => {
            console.log(err)
            if(this.isActive) {

               this.setState({
                    isLoading: false
                })
            }
        })
    }

    onDetails = (eventId) => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(e => e._id === eventId)
            return {selectedEvent}
        })
    }

    bookEventHandler = () => {
        if(!this.context.token) {
            this.setState({selectedEvent: null})
            return
        }
        this.setState({isLoading: true})
        const requestBody = {
            query: `
                mutation {
                    bookEvent(eventId: "${this.state.selectedEvent._id}") {
                        _id
                        createdAt
                        updatedAt
                    }
                }
            `
        }
        
        const token = this.context.token

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.context.token}`
            }
        }).then(res => {
            if(res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!')
            }
            return res.json()
        })
        .then(resData => {
            if(this.isActive) {
                this.setState({selectedEvent: null, isLoading: false})
            }
        })
        .catch(err => {
            console.log(err)
            if(this.isActive) {
                this.setState({selectedEvent: null, isLoading: false})
            }
        })
    }

    componentWillUnmount() {
        this.isActive = false
    }

    render() {
        return (
            <React.Fragment>
                    {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
                    {this.state.creating && 
                    <Modal title="Add Event" 
                        canCancel 
                        canConfirm 
                        onCancel={this.onCancel} 
                        onConfirm={this.onConfirm}
                        confirmText={"Confirm"}>
                        <form>
                            <div className="form-control">
                                <label htmlFor="title">Title</label>
                                <input type="text" id="title" ref={this.titleElRef}></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="price">Price</label>
                                <input type="number" id="price" ref={this.priceElRef}></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="date">Date</label>
                                <input type="datetime-local" id="date" ref={this.dateElRef}></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="description">Description</label>
                                <textarea id="description" rows="4" ref={this.descriptionElRef}></textarea>
                            </div>
                        </form>
                    </Modal>}

                    {this.state.selectedEvent && 
                        <Modal title={this.state.selectedEvent.title}
                            canCancel 
                            canConfirm 
                            onCancel={this.onCancel} 
                            onConfirm={this.bookEventHandler}
                            confirmText={this.context.token ? "Book" : 'Confirm'}>
                            
                            <h1>{this.state.selectedEvent.title}</h1>
                            <h2>${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>
                            <p>{this.state.selectedEvent.description}</p>

                        </Modal>
                    }

                    {this.context.token && <div className="event-control">
                        <p>Share your own Events!</p>
                        <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>    
                    </div>}
                    {this.state.isLoading ? <Spinner /> : ''}
                    <EventList 
                    events={this.state.events}
                    userId={this.context.userId}
                    onDetails={this.onDetails}
                    />
                   
            </React.Fragment>
        )
    }
}

export default EventPage