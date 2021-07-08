require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const {graphqlHTTP} = require('express-graphql')
const app = express()
const mongoose = require('mongoose')

const schema = require('./graphql/schema/index')
const rootValue = require('./graphql/resolvers/index')

const USER = process.env.USER
const PASSWORD = process.env.PASSWORD
const DB = process.env.DB
const isAuth = require('./middleware/is-auth')

app.use(bodyParser.json())

app.use(isAuth)

app.use('/graphql', graphqlHTTP({
    schema,
    rootValue,
    graphiql: true
}))

mongoose.connect(`
    mongodb+srv://${USER}:${PASSWORD}@cluster.h3lz1.mongodb.net/${DB}?retryWrites=true&w=majority
`).then(() => {
    app.listen(3000)
}).catch(err => {
    console.log(err)
})