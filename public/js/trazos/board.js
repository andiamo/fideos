var room_id = window.location.pathname.split("/")[2];
var socket = io({query: 'room_id='+room_id});
var id = Math.round($.now() * Math.random()); // Temporal ID Generator
var clients = {};
var pointers = {};
var connected = false;
var modals_open = 0;

$(document).ready(function() {
    initSidebar();
    initChat();
    initSocketObservers();

    // Borramos las conexiones viejas (cada 5000ms)
    setInterval(function() {
        for (var i in clients) {
            if ($.now() - clients[i].updated > 5000) {
                pointers[i].remove();
                delete clients[i];
                delete pointers[i];
            }
        }
    }, 5000);

  var con = {
    'id': id
  }  
  socket.emit("clientConnectionEvent", con);

});

function initSocketObservers(){
    socket.on('move', externalMoveHandler);
    // socket.on('connections', connectionHandler);
    // socket.on('user_disconnected',connectionHandler);
    socket.on('deleteEvent', deleteHandler);
    // Whenever the server emits 'login', log the login message
    socket.on('chat login', function (data) {
        console.log(data.username + ' entered');
        connected = true;
        // Display the welcome message
        chat.$welcome.text("Bienvenido al chat de Trazos club! Estas en el tablero: "+room_id, {
            prepend: true
        });
        updateParticipants(data);;
    });
    socket.on('chat logout', function (data) {
        console.log(data.username + ' left');
        updateParticipants(data);
        removeChatTyping(data);
    });
    socket.on('new message', function (data) {
        addUnreadMsg();
        addChatMessage(data);
    });
    socket.on('user joined', function (data) {
        log(data.username + ' joined');
        updateParticipants(data);
    });
    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
        addChatTyping(data);
    });
    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
        removeChatTyping(data);
    });
    socket.on('disconnect', function () {
        log('you have been disconnected');
    });
    socket.on('reconnect', function () {
        log('you have been reconnected');
        if (username) {
            socket.emit('add user', username);
        }
    });
    socket.on('reconnect_error', function () {
        log('attempt to reconnect has failed');
    });
    socket.on('externalMouseEvent', externalMouseEvent);

    socket.on('previousLines', async function(lines){
        document.querySelector("#joining-modal").style.display = "flex";
        $("#joining-modal .msg").html("Cargando "+lines.length+" trazos");
        $("#joining-modal .start").on("click",function(){
            document.querySelector("#joining-modal").style.display = "none";
        })
        setTimeout(
            function(){
                lines.forEach(function(line){externalMouseEvent(line.data)});
                $("#joining-modal .msg").html(lines.length+" trazos cargados.");
                $("#joining-modal .trazos-spinner").fadeOut(null,null,function(){$("#joining-modal .start").fadeIn()});
            },
            1500
        );
    });
}