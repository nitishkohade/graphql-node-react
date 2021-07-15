import React from 'react'
import './bookingControl.css'

const BookingControl = (props) => {
    return (
        <div className="booking-control">
            <button 
            className={props.activeOutputType === 'list' ? 'active' : ''}
            onClick={props.changeOutputTypeHandler.bind(this, 'list')}>List</button>
            <button 
            className={props.activeOutputType === 'chart' ? 'active' : ''}
            onClick={props.changeOutputTypeHandler.bind(this, 'chart')}>Chart</button>
        </div>
    )
}

export default BookingControl