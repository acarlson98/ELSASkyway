var app = require('express')();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT);

// needed?
// app.use(app.static(__dirname + 'static'));

app.get('/static/script.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/script.js'));
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/static/index.html");
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});