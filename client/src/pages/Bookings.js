import React, {Component} from 'react';
import BookingChart from '../components/booking/bookingChart/BookingChart';
import BookingControl from '../components/booking/bookingControl/bookingControl';
import BookingList from '../components/booking/bookingList/BookingList';
import Spinner from '../components/spinner/Spinner';
import AuthContext from '../context/auth-context';

class BookingPage extends Component {

    state = {
        isLoading: false,
        bookings: [],
        outputType: 'list'
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
                          price
                        }
                    }
                }
            `
        }
        
        fetch('graphql', {
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
        
        fetch('graphql', {
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

    changeOutputTypeHandler = (outputType) => {
        if(outputType === 'list') {
            this.setState({ outputType: 'list' })
        } else {
            this.setState({ outputType: 'chart' })
        }
    }

    render() {
        let content = <Spinner />
        if(!this.state.isLoading) {
            content = (
               <React.Fragment>
                   <BookingControl 
                        activeOutputType={this.state.outputType} 
                        changeOutputTypeHandler={this.changeOutputTypeHandler}
                    />
                    {
                        this.state.outputType === 'list' 
                        ?
                        <BookingList 
                            bookings={this.state.bookings} 
                            onDelete={this.deleteBookingHandler} 
                        />
                        :
                        <BookingChart 
                            bookings={this.state.bookings} 
                        />
                    }
               </React.Fragment>
            )
        }

        return (
            <React.Fragment>
                {content}                
            </React.Fragment>
        )
    }
}

export default BookingPage