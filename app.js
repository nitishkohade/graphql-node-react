require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const {graphqlHTTP} = require('express-graphql')
const { buildSchema }  = require('graphql')
const app = express()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const EventModel = require('./models/event')
const UserModel = require('./models/user')

const USER = process.env.USER
const PASSWORD = process.env.PASSWORD
const DB = process.env.DB


app.use(bodyParser.json())

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(
        `
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User {
            _id: ID!
            email: String!
            createdEvents: [Event!]
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

         schema {
             query: RootQuery
             mutation: RootMutation
         }   
        `
    ),
    rootValue: {
        events: (args) => {
            return EventModel.find().populate('creator').then(res => 
                {
                console.log(res)
                return res
                }
                ).catch(err => {console.log(err)})
        },
        createEvent: (args) => {
            const {title, description, price, date} = args.eventInput
            const event = new EventModel({
                title, description, price, date: new Date(date), creator: '60da136152308773b48eca66'
            })
            let createdEvent = {};
            return event
                .save()
                .then(
                    (res) => {
                        createdEvent = res;
                        return UserModel.findById('60da136152308773b48eca66')
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
                        date: createdEvent.date,
                        creator: result
                      }
                })
                .catch(err => {
                    console.log(err)
                    throw err
                })
        },
        createUser: (args) => {
            const {email, password} = args.userInput
            return UserModel.findOne({
                email
            }).then(res=> {
                if(res) {
                    throw new Error('User exists already')
                }
                
                return bcrypt.hash(password, 12)
            })            
            .then(
                hashedPass => {
                    const user = new UserModel({
                        email, password: hashedPass
                    })
                    return user.save()
                }
            )
            .then(
                (res) => res
            )
            .catch(err => {throw err})

            
        } 
    },
    graphiql: true
}))

mongoose.connect(`
    mongodb+srv://${USER}:${PASSWORD}@cluster.h3lz1.mongodb.net/${DB}?retryWrites=true&w=majority
`).then(() => {
    app.listen(3000)
}).catch(err => {
    console.log(err)
})