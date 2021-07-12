import React, {Component} from 'react';
import BookingList from '../components/booking/bookingList/BookingList';
import Spinner from '../components/spinner/Spinner';
import AuthContext from '../context/auth-context';

class BookingPage extends Component {

    state = {
        isLoading: false,
        bookings: []
    }

    componentDidMount() {
        this.fetchBokings()
    }

    static contextType = AuthContext

    fetchBokings = () => {
        this.setState({isLoading: true})
        const requestBody = {
            query: `
                query {
                    bookings {
                        _id
                        createdAt
                        event {
                          _id
                          title
                          date
                        }
                    }
                }
            `
        }
        
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
            const bookings = resData.data.bookings
            this.setState({
                bookings,
                isLoading: false
            })
        })
        .catch(err => {
            console.log(err)
            this.setState({
                isLoading: false
            })
        })
    }

    deleteBookingHandler = (id) => {
        this.setState({isLoading: true})
        const requestBody = {
            query: `
                mutation {
                    cancelBooking(bookingId: "${id}") {
                        _id
                        title
                    }
                }
            `
        }
        
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
            
            this.setState(prevState => {
                const updatedBookings = prevState.bookings.filter(booking => booking._id !== id)
                return {bookings: updatedBookings, isLoading: false}
            })
            
        })
        .catch(err => {
            console.log(err)
            this.setState({
                isLoading: false
            })
        })
    }

    render() {
        return (
            <React.Fragment>
                {this.state.isLoading ? <Spinner /> : <BookingList 
                    bookings={this.state.bookings} 
                    onDelete={this.deleteBookingHandler} 
                />}
                
            </React.Fragment>
        )
    }
}

export default BookingPage