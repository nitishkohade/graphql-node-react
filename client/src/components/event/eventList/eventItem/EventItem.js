import React from 'react'
import './eventItem.css'

const EventItem = props => (
    <li className="events__list-item">
            <div>
                <h1>{props.title}</h1>
                <h2>${props.price} - {new Date(props.date).toLocaleDateString()}</h2>
            </div>
            <div>
                {
                    props.userId === props.creatorId ? 
                    <p>Your the owner of this event</p> :
                    <button className="btn" onClick={props.onDetails.bind(this, props.eventId)}>View Details</button>
                }
            </div>
    </li>
)

export default EventItem