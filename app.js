// Dependencias
var fs = require('fs');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Hashids = require("hashids"),
hashids = new Hashids("this is my salt",0, "0123456789abcdef");
var connections = 0;

// Lo uso para generar ids de boards
var boards = 0;

// Importo la carpeta public para poder routear assets
// estaticos.
app.use(express.static(__dirname + '/public'));


// Main route (Si la persona entra sin un ID)
app.get('/', function(req, res) {
    boards++;
    var board_id = hashids.encode(boards,boards);
    res.redirect('/board/'+board_id);
});


app.get('/board/:board_id',function(req,res){
    res.sendFile(__dirname + '/index.html');
});


// Conexión
io.on('connection', function(socket) {

    // Recibo desde el cliente el room_id
    var room_id = socket.handshake.query.room_id;
    socket.join(room_id);

    // Suma una conexion
    connections++;
    console.log('Usuarios conectados: ', connections);

    // Usuario conectado
    socket.broadcast.emit('connections',{
        connections: connections
    });

    // Usuario conectado
    socket.emit('connections', {
        connections: connections
    });

    // Movimiento del puntero
    socket.on('mousemove', function(data) {
        socket.broadcast.to(room_id).emit('move', data);
    });

    // Movimiento de los trazos
    socket.on('externalMouseEvent',function(data){
        socket.broadcast.to(room_id).emit('externalMouseEvent',data);
    });

    socket.on('deleteEvent', function(data) {
        socket.broadcast.to(room_id).emit('deleteEvent', data);
    });


    socket.on('saveEvent', function(data) {
        console.log("save button pressed");
fs.writeFile('helloworld.txt', 'save button pressed', function (err) {
  if (err) return console.log(err);
  console.log('Hello World > helloworld.txt');
});
    });

    // Desconexion de un cliente
    socket.on('disconnect', function() {
        connections--;
        console.log("Se desconecto un usuario.");
        console.log('Usuarios conectados: ', connections);
        socket.broadcast.emit('user_disconnected', {
            connections: connections
        });
    });

});

// Levantamos el servidor en el puerto 3000
server.listen(3000, function() {
    console.log('Running on *:3000');
});
