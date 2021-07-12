import React, {Component} from 'react';
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

    render() {
        return (
            <React.Fragment>
                {this.state.isLoading ? <Spinner /> : ''}
                <ul>
                    {
                        this.state.bookings.map(booking => (
                            <li key={booking._id}>
                                {booking.event.title} - {new Date(booking.createdAt).toLocaleDateString()}
                            </li>
                        ))
                    }
                </ul>
            </React.Fragment>
        )
    }
}

export default BookingPage