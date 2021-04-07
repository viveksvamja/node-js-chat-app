const users = []
const rooms = []

// Add user
const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: "Username and room required!"
        }
    }

    // check existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: "User already exists!"
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

// Remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

// Get User
const getUser = (id) => {
    return users.find((user) => user.id == id)
}

// Get users by room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}