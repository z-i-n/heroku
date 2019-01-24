var socketIO = require('socket.io'),
    http = require('http'),
    uuid = require('node-uuid'),
    crypto = require('crypto');
fs = require('fs');


module.exports = function (app) {
    var server = http.createServer(app);
    server.listen(process.env.PORT || 5000);
    var io = socketIO(server);

    io.on('connection', function (socket) {
        let room_id;
        console.log('user connected', socket.id);
        //socket.broadcast.emit('offer', socket.id);

        socket.on('joinRoom',function(data, fn){
            room_id = data;
            socket.join(room_id);
            // console.log(JSON.stringify(io.sockets.adapter.rooms[room_id]));
            // console.log(io.sockets.adapter.rooms[room_id].length);
            // console.log(socket.rooms);
            // io.of('/').clients(function(error, clients){
            //   if (error) throw error;
            //   console.log(clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
            // });
            // socket.to(room_id).emit('socket.to',socket.id);
            // socket.broadcast.to(room_id).emit('socket.broadcast.to',socket.id);
            // io.sockets.to(room_id).emit('io.sockets.to',socket.id);
            // console.log(socket.rooms);

            //console.log(JSON.stringify(io.sockets.adapter.rooms));
            if (io.sockets.adapter.rooms[room_id].length == 1) {
                fn('waiting');
            } else if (io.sockets.adapter.rooms[room_id].length == 2) {
                fn('request_offer');
                socket.broadcast.to(room_id).emit('request.offer');
            }
        });

        socket.on('leaveRoom',function(){
            socket.leave(room_id);//룸퇴장
            console.log('OUT ROOM LIST', io.sockets.adapter.rooms);
        });

        socket.on('offer', function (data) {
            console.log('relaying offer');
            socket.broadcast.to(room_id).emit('offer', data);
        });

        socket.on('answer', function(data) {
            console.log('relaying answer');
            socket.broadcast.to(room_id).emit('answer', data);
        });

        socket.on('candidate', function (data) {
            console.log('relaying candidate');
            socket.broadcast.to(room_id).emit('candidate', data);
        });

        socket.on('hangup', function (data) {
            console.log('relaying hangup', room_id);
            socket.leave(room_id);
            socket.broadcast.to(room_id).emit('hangup');
        });
        //socket.broadcast.emit('new');
    });

};
