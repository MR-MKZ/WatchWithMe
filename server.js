import express from 'express'
import {createServer} from 'http'
import {Server} from 'socket.io'

var app = express()
app.set('port', 7040);
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
})

var rooms = {}

io.on('connection', (socket) => {
    socket.on('connectedToRoom', (userData, callback) => {
        if (!rooms[userData.link]) {
            if (userData.isOwner) {
                rooms[userData.link] = {
                    "owner": userData.uid,
                    "memberCount": 1,
                    "roomId": userData.roomId,
                    "played": 0,
                    "members": {}
                }
                rooms[userData.link]["members"][userData.uid] = {
                    "id": userData.uid,
                    "name": userData.userName
                }
            } else {
                rooms[userData.link] = {
                    "owner": userData.ownerId,
                    "roomId": userData.roomId,
                    "played": 0,
                    "members": {}
                }
                rooms[userData.link]["members"][userData.uid] = {
                    "id": userData.uid,
                    "name": userData.userName
                }
            }
        } else {
            if (!rooms[userData.link]["members"][userData.uid]) {
                rooms[userData.link]["members"][userData.uid] = {
                    "id": userData.uid,
                    "name": userData.userName
                }
            } else {
                delete rooms[userData.link]['members'][userData.uid]
                rooms[userData.link]["members"][userData.uid] = {
                    "id": userData.uid,
                    "name": userData.userName
                }
                // rooms[userData.link]["memberCount"] = rooms[userData.link]["memberCount"]
            }
        }
        socket.join(userData.link)
        announceRoomChanges(userData.link, rooms[userData.link])
        callback(rooms[userData.link])
        // console.log(rooms[userData.link])
        console.log(userData.userName + " connected to room " + userData.link)
        socket.on('sendMessage', (msgData) => {
            sendMessageToRooms(msgData.link, msgData)
        })
        socket.on('disconnect', () => {
            console.log(userData.userName + " disconnected from room " + userData.link)
            if (rooms[userData.link]["members"][userData.uid]["id"] === rooms[userData.link]["owner"]) {
                socket.broadcast.to(userData.link).emit('playPauseChanged', false)
                // pauseForLeaveOwner(userData.link)
            }
            delete rooms[userData.link]['members'][userData.uid]
            announceRoomChanges(userData.link, rooms[userData.link])
        })
    })
    socket.on('handlePlayPause', (data) => {
        if (data.uid === rooms[data.link]['owner']) {
            socket.broadcast.to(data.link).emit('playPauseChanged', data.playPauseStatus)
        }
    })
    socket.on("handleSeekChange", (data) => {
        if (data.uid === rooms[data.link]['owner']) {
            socket.broadcast.to(data.link).emit('seekChanged', {
                "playedSeconds": data.playedSeconds,
                "playingStatus": data.playingStatus
            })
        }
    })
    socket.on('progressUpdated', (data) => {
        if (data.uid === rooms[data.link]['owner']) {
            rooms[data.link]["played"] = data.playedSeconds
            socket.broadcast.to(data.link).emit('hostProgress', data.playedSeconds + 1)
        }
    })
})

const announceRoomChanges = (room, roomData) => {
    io.to(room).emit("roomUsersChanged", roomData)
}

const sendMessageToRooms = (room, msgData) => {
    io.to(room).emit("newMessage", msgData)
}

httpServer.listen(app.get("port"), '0.0.0.0', () => {
    let address = httpServer.address().address + ":" + httpServer.address().port
    console.log(`Server running on : ${address}`);
})
