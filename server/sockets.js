var socketIO = require('socket.io'),
    http = require('http'),
    uuid = require('node-uuid'),
    crypto = require('crypto');


module.exports = function (app) {
    var server = http.createServer(app);
    server.listen(process.env.PORT || 5000);
    var io = socketIO(server);

    io.on('connection', function (socket) {
        console.log('user connected', socket.id);

        socket.on('offer', function (data) {
            console.log('relaying offer');
            socket.broadcast.emit('offer', data);
        });

        socket.on('answer', function(data) {
            console.log('relaying answer');
            socket.broadcast.emit('answer', data);
        });

        socket.on('candidate', function (data) {
            console.log('relaying candidate');
            socket.broadcast.emit('candidate', data);
        });

        socket.broadcast.emit('new');
    });

    setInterval(() =>{ console.log('time emit'); io.emit('time', new Date().toTimeString());},5000);
};
