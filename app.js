// Dependencias
var express = require('express');
var textBody = require("body");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require("fs");
var MongoClient = require("mongodb").MongoClient;
var uuid = require('node-uuid');
var mkdirp = require('mkdirp');
var Hashids = require("hashids"),
hashids = new Hashids("this is my salt",0, "0123456789abcdef");
var connections = 0;
var chatConnections = [];

// MongoDB vars
var db = null;
const url = 'mongodb://localhost:27017';
const dbName = 'mongo_trazos';

// Mapea los socket ids con el id generado por cada cliente
var clients = {};

// Lo uso para generar ids de boards
var boardSeed = 0;
var boards = [];

// Importo la carpeta public para poder routear assets
// estaticos.
app.use(express.static(__dirname + '/public'));

//Dado que el sidebar se carga en más de una página hago un sólo archivo y lo incluyo
var SIDEBAR_INCLUDE = "{SIDEBAR}";
function includeSidebarAndSend(html, res) {
    fs.readFile('./partials/sidebar.inc.html', function (err, sidebarHTML) {
        html = html.toString();
        sidebarHTML = sidebarHTML.toString();

        var resultHTML = html.replace(SIDEBAR_INCLUDE,sidebarHTML);
        res.send(resultHTML);
    });
}

function initDB(){
    // Use connect method to connect to the server
    MongoClient.connect(url, { useNewUrlParser: true },function(err, client) {
        console.log("Connected successfully to Mongo");
        db = client.db(dbName);
    });
}

function saveImage(rawData) {
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
    fs.writeFile(publicDir + '/' + filename, buffer, function(err) {
        if (err) throw err;
    });
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
    res.sendFile(__dirname + '/about.html');
});

// Aca debería mandar un mail (capaz habría que tener cuidado con los spambots)
app.post('/sendMail', function(req, res) {
    res.send("ok");
});

// Crea un nuevo board y redirige
app.get('/board/', function(req, res) {
    boardSeed++;
    var board_id = hashids.encode(boardSeed,boardSeed);
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
    var chatUser = false;

    // Recibo desde el cliente el room_id
    var room_id = socket.handshake.query.room_id;
    var client_id = socket.client.conn.id;
    socket.join(room_id);

    if (!chatConnections[room_id]) chatConnections[room_id] = {qty:0,usernames:[]};

    // Suma una conexion
    connections++;
    if(boards[room_id]){
        boards[room_id].connections++;
    }else{
        boards[room_id] = {
            "id":room_id,
            "connections":1
        };
    }

    console.log('Usuarios conectados: ', connections);

    // Usuario conectado
    socket.broadcast.emit('connections',{
        connections: connections
    });

    // Usuario conectado
    socket.emit('connections', {
        connections: connections
    });

    socket.on('clientConnectionEvent', function(data) {
        clients[client_id] = data.id;
        console.log("Se conecto el usuario " + clients[client_id]);
    });

    // Mensaje del chat
    socket.on('new message', function (data) {
        socket.broadcast.to(room_id).emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // Nuevo usuario al chat
    socket.on('add user', function (username) {
        if (chatUser) return;
        // we store the username in the socket session for this client
        socket.username = username;
        ++chatConnections[room_id].qty;
        chatConnections[room_id].usernames.push(username);
        console.log('Usuarios conectados al chat: ', chatConnections[room_id].qty);
        console.log("Se conecto al chat el usuario " + username);
        chatUser = true;
        socket.emit('chat login', {
            numUsers: chatConnections[room_id].qty,
            usernames: chatConnections[room_id].usernames
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.to(room_id).emit('user joined', {
            username: socket.username,
            numUsers: chatConnections[room_id].qty,
            usernames: chatConnections[room_id].usernames
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.to(room_id).emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.to(room_id).emit('stop typing', {
            username: socket.username
        });
    });

    // Movimiento del puntero
    // socket.on('mousemove', function(data) {
    //     socket.broadcast.to(room_id).emit('move', data);
    // });

    // Movimiento de los trazos
    socket.on('externalMouseEvent',function(data){
        db.collection("lines").insert({board:room_id,data:data,user:client_id,timestamp:new Date()});
        socket.broadcast.to(room_id).emit('externalMouseEvent',data);
    });

    socket.on('deleteEvent', function(data) {
        socket.broadcast.to(room_id).emit('deleteEvent', data);
    });

    // Desconexion de un cliente
    socket.on('disconnect', function(data) {
        if(chatUser){
            chatConnections[room_id].qty--;
            for (var i=chatConnections[room_id].usernames.length-1; i>=0; i--) {
                if (chatConnections[room_id].usernames[i] === socket.username) {
                    chatConnections[room_id].usernames.splice(i, 1);
                    // break;       //<-- Uncomment  if only the first term has to be removed
                }
            }
            socket.broadcast.to(room_id).emit('chat logout', {
                numUsers: chatConnections[room_id].qty,
                usernames: chatConnections[room_id].usernames
            });
        }
        connections--;
        console.log("Se desconecto el usuario " + clients[client_id]);
        console.log('Usuarios conectados: ', connections);
        socket.broadcast.emit('user_disconnected', {
            connections: connections
        });
        // socket.broadcast.to(room_id).emit('deleteEvent', {
        //     username: socket.username,
        //     connections: connections
        // });
        // Delete all gestures from this client
        var id = clients[client_id];
        for (var i = 0; i < 4; i++) {
            var del = {
                'layer': i,
                'id': id
            }
            socket.broadcast.to(room_id).emit("deleteEvent", del);
            db.collection("lines").deleteMany({"user":client_id});
        }
        console.log(JSON.stringify(boards));
        boards[room_id].connections--;
        if(boards[room_id].connections < 1){
            db.collection("lines").deleteMany({"board":room_id});
        }

        delete clients[client_id];
    });

    setTimeout(function(){
        db.collection('lines').find({"board":room_id}).toArray(function (err, result) {
            if(result.length){
                socket.emit("previousLines",result);
            }
        });
    },1000);

});

// Levantamos el servidor en el puerto 3000
server.listen(3000, function() {
    console.log('Running on *:3000');
    initDB();
    console.log('Mongo running on '+url);

    // Borramos lineas viejas
    db.collection("lines").deleteMany({"timestamp" : {$lt : new Date((new Date())-THREE_HOURS)}});
    setInterval(function () {
        var THREE_HOURS = 3 * 60 * 60 * 1000; /* ms */
        db.collection("lines").deleteMany({"timestamp" : {$lt : new Date((new Date())-THREE_HOURS)}});
    }, 1 * 60 * 60 * 1000);
});
