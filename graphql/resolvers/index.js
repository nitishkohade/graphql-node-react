const EventModel = require('../../models/event')
const UserModel = require('../../models/user')
const BookingModel = require('../../models/booking')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const DataLoader = require('dataloader')

const eventLoader = new DataLoader((eventIds) => {
    const d = events(eventIds)
    return d
})

const userLoader = new DataLoader((userIds) => {
    const d = UserModel.find({_id: {$in: userIds}})
    return d
})

const user = async userId => {
    try{
        const user = await userLoader.load(userId.toString())
        return {
            ...user,
            _id: user._id,
            email: user.email,
            createdEvents: eventLoader.loadMany.bind(this, user.createdEvents)
        }
    } catch(err) {
        throw err
    }
}

const events = async eventIds => {

    try {
       const events = await EventModel.find({_id: {$in: eventIds}})
       return events.map(obj => {
            return {
                _id: obj._id,
                title: obj.title,
                description: obj.description,
                price: obj.price,
                date: new Date(obj.date).toISOString(),
                creator: user(obj.creator)
            }
        })
    } catch(err) {
        throw err
    }
}

const singleEvent = async eventId => {
    try {
        // const event = await EventModel.findById(eventId)
        const event = await eventLoader.load(eventId.toString())
        return event
    } catch(err) {
        throw err;
    }
}

module.exports = {
    events: (args) => {
        return EventModel.find().then(res => 
            {
                
            return res.map(obj => ({
                _id: obj._id,
                title: obj.title,
                description: obj.description,
                price: obj.price,
                date: new Date(obj.date).toISOString(),
                creator: user(obj.creator).then(res => res)
            }))
            }
            ).catch(err => {console.log(err)})
    },
    bookings: async (args, req) => {
        if(!req.isAuth) {
            throw new Error('unauthenticated')
        }
        try{
            const bookings = await BookingModel.find({userId: req.userId});
            return bookings.map(async booking => {
                return {
                    ...booking, 
                    _id: booking._id,
                    user: await user(booking.userId),
                    event: await singleEvent(booking.eventId),
                    createdAt: new Date(booking.createdAt).toISOString(),
                    updatedAt: new Date(booking.updatedAt).toISOString(),
                }
            })

        } catch(err) {
            throw err;
        }
    },
    createEvent: (args, req) => {
        const {title, description, price, date} = args.eventInput
        if(!req.isAuth) {
            throw new Error('unauthenticated')
        }
        const event = new EventModel({
            title, description, price, date: new Date(date), creator: req.userId
        })
        let createdEvent = {};
        return event
            .save()
            .then(
                (res) => {
                    createdEvent = res;
                    return UserModel.findById(req.userId)
                }
            )
            .then(user => {
                if(!user) {
                    throw new Error("User not found")
                }
                user.createdEvents.push(event)
                return user.save()
            })
            .then(result => {
                return {
                    _id: createdEvent._id,
                    title: createdEvent.title,
                    description: createdEvent.description,
                    price: createdEvent.price,
                    date: new Date(createdEvent.date).toISOString(),
                    creator: result
                  }
            })
            .catch(err => {
                console.log(err)
                throw err
            })
    },
    createUser: async (args) => {
        const {email, password} = args.userInput
        const user = await UserModel.findOne({email: email})
        if(user) {
            throw new Error('User exists already')
        }
        const hashedPass = await bcrypt.hash(password, 12)
        const newUser = new UserModel({
            email, password: hashedPass
        })
        const res = await newUser.save()
        if(!res) {throw new Error("Something went wrong")}
        return res 
    },
    bookEvent: async (args, req) => {
        if(!req.isAuth) {
            throw new Error('unauthenticated')
        }
        const event = await EventModel.findOne({_id: args.eventId})
        const booking = new BookingModel({
            userId: req.userId,
            eventId: event
        })
        const result = await booking.save()
        return {...result,
            _id: result._id,
            user: await user(result.userId),
            event: await singleEvent(result.eventId),
            createdAt: new Date(result.createdAt).toISOString(),
            updatedAt: new Date(result.updatedAt).toISOString()
        }
    },
    cancelBooking: async (args, req) => {
        if(!req.isAuth) {
            throw new Error('unauthenticated')
        }
        try {
            const booking = await BookingModel.findById(args.bookingId)
            const event = await singleEvent(booking.eventId)
            await BookingModel.deleteOne({_id: args.bookingId})
            return event
        } catch(err) {
            throw err;
        }
    },
    login: async (args) => {
        const {email, password} = args;
        const user = await UserModel.findOne({email: email})
        if(!user) {
            throw new Error('User does not exist!')
        }
        const isEqual = await bcrypt.compare(password, user.password)
        if(!isEqual) {
            throw new Error('Password is incorrect!')
        }
        const token = jwt.sign({userId: user.id, email: user.email}, 'nitish', {
            expiresIn: '1h'
        })
        return { userId: user.id, token, tokenExpiration: 1 }
    }
}
