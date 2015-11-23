// Dependencias
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var connections = 0;

// Importo la carpeta public para poder routear assets
// estaticos.
app.use(express.static(__dirname + '/public'));

// Main route
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Conexión
io.on('connection', function(socket) {

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
        socket.broadcast.emit('move', data);
    });

    // Movimiento de los trazos
    socket.on('externalMouseEvent',function(data){
        socket.broadcast.emit('externalMouseEvent',data);
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
