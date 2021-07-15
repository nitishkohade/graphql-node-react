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
const path = require('path')

app.use(bodyParser.json())

const PORT = process.env.PORT || 3000

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
app.use(express.static(path.join(__dirname, 'client/build')))

app.use('/graphql', (req, res) => {
    graphqlHTTP({
        schema,
        rootValue,
        graphiql: true,
        customFormatErrorFn: (err) => {
            console.log(err)
            return ({message: err.message, statusCode: 500})
        }
    })(req, res)
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
})

mongoose.connect(`
    mongodb+srv://${USER}:${PASSWORD}@cluster.h3lz1.mongodb.net/${DB}?retryWrites=true&w=majority
`).then(() => {
    app.listen(PORT)
}).catch(err => {
    console.log(err)
})