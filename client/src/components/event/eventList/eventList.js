import React from 'react'
import EventItem from './eventItem/EventItem'
import './eventList.css'


const EventList = (props) => {
    
    const events = props.events.map(event => {
        return (<EventItem  
            key={event._id}
            eventId={event._id}
            userId={props.userId}
            title={event.title}
            price={event.price}
            date={event.date}
            description={event.description}
            creatorId={event.creator._id}
            onDetails={props.onDetails}
        />)
    })

    return (
        <ul className="events__list">
            {events}
        </ul>
    )
}

export default EventList