const connectToMongo = require('./db')
const express = require('express')
var cors = require('cors')
//ASYNCHRONOUS NATURE OF JS
//Although connectToMongo is called before app.listen(express part),it will be executed later as it takes some time to connect to Mongo
connectToMongo()

const app = express()
//changing port to 5000 as on port 3000 react app will run
const port = 5000

// app.get('/', (req, res) => {//endpoint
//     res.send('Sidd here!')
// })
app.use(cors())
app.use(express.json())//middleware

//Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

//ASYNCHRONOUS NATURE OF JS
//Although connectToMongo is called before app.listen(express part),it will be executed later as it takes some time to connect to Mongo
app.listen(port, () => {
    console.log(`Notes app listening on port ${port}`)
})
