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

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

app.use(isAuth)

app.use('/graphql', graphqlHTTP({
    schema,
    rootValue,
    graphiql: true
}))

mongoose.connect(`
    mongodb+srv://${USER}:${PASSWORD}@cluster.h3lz1.mongodb.net/${DB}?retryWrites=true&w=majority
`).then(() => {
    app.listen(8000)
}).catch(err => {
    console.log(err)
})