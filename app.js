// Dependencias
var express = require('express');
var textBody = require("body")
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require("fs");
var uuid = require('node-uuid');
var mkdirp = require('mkdirp')
var Hashids = require("hashids"),
hashids = new Hashids("this is my salt",0, "0123456789abcdef");
var connections = 0;

// Lo uso para generar ids de boards
var boards = 0;

// Importo la carpeta public para poder routear assets
// estaticos.
app.use(express.static(__dirname + '/public'));

//Dado que el sidebar se carga en más de una página hago un sólo archivo y lo incluyo
var SIDEBAR_INCLUDE = "{SIDEBAR}";
function includeSidebarAndSend(html, res) {
    fs.readFile('./sidebar.inc.html', function (err, sidebarHTML) {
        html = html.toString();
        sidebarHTML = sidebarHTML.toString();

        var resultHTML = html.replace(SIDEBAR_INCLUDE,sidebarHTML);
        res.send(resultHTML);
    });
}

function saveImage(rawData) {
    var fs = require('fs');
    var regex = /^data:.+\/(.+);base64,(.*)$/;

    var matches = rawData.match(regex);
    var ext = matches[1];
    var data = matches[2];
    var buffer = new Buffer(data, 'base64');
    const publicDir = 'public';
    const usrImgDir = 'user-img';
    const pubUserImgDir = publicDir + '/' + usrImgDir;
    var filename = usrImgDir + '/' + uuid.v4() + '.' + ext;
    mkdirp(pubUserImgDir, function(err) {});
    fs.writeFileSync(publicDir + '/' + filename, buffer);
    return filename;
}

// Main route, muestra la página de inicio
app.get('/', function(req, res) {
    fs.readFile('./index.html', function (err, indexHTML) {
        if (err) throw err;
        includeSidebarAndSend(indexHTML, res);
    });
});

// Página de informacion (singlePageInfo)
app.get('/info', function(req, res) {
    res.sendFile(__dirname + '/singlePageInfo.html');
});

// Aca debería mandar un mail (capaz habría que tener cuidado con los spambots)
app.post('/sendMail', function(req, res) {
    res.send("ok");
});

// Crea un nuevo board y redirige
app.get('/board/', function(req, res) {
    boards++;
    var board_id = hashids.encode(boards,boards);
    res.redirect('/board/'+board_id);
});

app.get('/board/:board_id',function(req,res){
    fs.readFile('./board.html', function (err, html) {
        if (err) throw err;
        includeSidebarAndSend(html, res);
    });
});

app.post('/files', function(req, res) {
    const extract = function (err, data) {
        if (!data) return
        res.setHeader('Content-Type', 'application/json');
        const filePath = saveImage(data);
        res.send(JSON.stringify({ filename: filePath}));
        console.log('Saved file: ' + filePath);
    }

    textBody(req, extract);
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
