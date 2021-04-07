const socket = io()

const $txtMessage = document.querySelector('#txtMessage')
const $messageForm = document.querySelector('#messageForm')

const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML

const $sendLocationButton = document.querySelector('#sendLocation')
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const $sidebar = document.querySelector('#sidebar')

// Remove questionmarks from query string, default value false
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    $messages.scrollTop = $messages.scrollHeight
}

socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a"),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforebegin', html)

    autoscroll();
})

socket.on("locationMessage", (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm a"),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforebegin', html)

    autoscroll();
})

socket.on("roomData", ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {

    e.preventDefault()

    let message = $txtMessage.value

    $txtMessage.value = ''

    $txtMessage.focus()

    if (message != undefined || message != '') {
        socket.emit('sendMessage', message)
    } else {
        alert("Please type a message!")
    }
})

$sendLocationButton.addEventListener('click', () => {

    if(!navigator.geolocation) {
        return alert("Geo location is not supported by your browser!")
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            $sendLocationButton.removeAttribute('disabled')
                if (error) {
                    return console.log(error)
                }
                console.log("Location shared!")
        })
    })
})


socket.emit('join', {
    username: username,
    room: room
}, (error) => {

})