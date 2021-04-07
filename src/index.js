const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {generateMessage, generateLocation} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDir = path.join(__dirname, '../public')

app.use(express.static(publicDir))

io.on('connection', (socket) => {

    socket.on('join', (options, callback) => {
        console.log('Join user ID ', socket.id, options);
        const {error, user} = addUser({
            id: socket.id,
            ...options
        })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit("message", generateMessage("Admin", "Welcome!"))
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })

    socket.on('sendMessage', (message) => {
        console.log('Send Message user ID ', socket.id);
        let user = getUser(socket.id)
        console.log('Send Message user data ', user);
        io.to(user.room).emit("message", generateMessage(user.username, message))
    })

    socket.on('disconnect', () => {
        let user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} has left!`)) 

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (position, callback) => {
        let user = getUser(socket.id)
        io.to(user.room).emit("locationMessage", generateLocation(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude} `))
        callback()
    })
})



server.listen(port, () => {
    console.log(`Server running on ${port}`);
})