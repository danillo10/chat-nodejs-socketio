const express = require('express');
const path = require('path');

const app = express('');
const server = require('http').createServer(app);
const io = require('socket.io')(server, { allowEIO3: true });

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
    res.render('index.html');
});

var messages = [];
let users = [];

io.on('connection', socket => {
    const userId = socket.id;
    users.push(userId);

    socket.emit('previousMessages', messages);
    socket.emit('previousUsers', users);
    socket.broadcast.emit('previousUsers', users);
    socket.broadcast.emit('userConnected', userId);

    socket.on('sendMessage', data => {
        messages.push(data);
        socket.broadcast.emit('receivedMessage', data);
    })

    socket.on("disconnect", () => {
        users = users.filter(user => user !== userId);
        socket.emit("previousUsers", users);
        socket.broadcast.emit('previousUsers', users);
        socket.broadcast.emit('userDisconnected', userId);
    });
})

server.listen(3000);