// client will contact this central server
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const {Server}= require('socket.io')

const io = new Server(server, {
    cors:{
        origin: 'http://localhost:3000',
        methods:['GET', 'POST']
    }
})

module.exports= {
    io
}

const cors = require('cors')
const body_parser = require('body-parser')

const uploadRoutes = require('./routes/upload.routes')
app.use(body_parser.urlencoded({extended:true}))
app.use(express.json())

app.use(cors({                         // for express app
    origin: [
        // process.env.CLIENT_ORIGIN,
        'http://localhost:3000'   
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders:[
        'Access-Control-Allow-Origin',
        'Content-Type',
        'Authorization',
    ]
}))

app.get('/', (req, res)=>{
    res.send("Connected")
})

app.use('/render', uploadRoutes)


// io.on('connection', (socket)=>{
//     // socket of user
//     console.log("new user connected", socket.id)


//     socket.on('disconnect', ()=>{
//         console.log('user disconnected', socket.id)
//     })

// })

server.listen(8000, ()=>{
    console.log('central server up and running...')
})