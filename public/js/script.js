// Socket.io
var socket = io();
var id = Math.round($.now() * Math.random());

// El DOM termina de cargar.
$(document).ready(function() {

    var doc = $(document);
    var win = $(window);
    var connections = $('#connections');
    var clients = {};
    var pointers = {};
    var prev = {};
    var lastEmit = $.now();



    $("#pallete .color").click(function(){
        console.log($(this).index());
        currColor = STROKE_COLORS[$(this).index()];
    })



    /*

    connectionHandler()

    Muestra la cantidad de usuarios conectados en el DOM.

    */

    function connectionHandler(data) {
        $("#connected_users").text(data.connections);
    }

    /*

    externalMoveHandler()

    Maneja el movimiento de los punteros externos.

    */

    function externalMoveHandler(data) {

        // Si este Id no esta en los clientes actuales.
        if(!(data.id in clients)){
            // Asignamos un nodo único
            pointers[data.id] = $('<i class="pointer fa fa-mouse-pointer"></i>').appendTo('#pointers');
        }

        // Situamos el cursor externo
        pointers[data.id].css({
            'left' : data.x,
            'top' : data.y
        });

        // Actualizamos el array local de cientes
        clients[data.id] = data;
        clients[data.id].updated = $.now();

    }

    /*

    mouseMoveHandler()

    Cuando el mouse local se mueve.

    */

    function mouseMoveHandler(e) {

        // Chequeamos cuando fue el lastEmit para no emitir mensajes de mas
        if ($.now() - lastEmit > 20) {
            var movement = {
                'x': e.pageX,
                'y': e.pageY,
                'id': id
            }
            socket.emit("mousemove", movement);
            lastEmit = $.now();
        }

    }

    /*

    Capturamos los eventos del mouse

    */

    doc.on('mousemove', mouseMoveHandler);

    /*

    Socket.io events

    */

    socket.on('move', externalMoveHandler);
    socket.on('connections', connectionHandler);
    socket.on('user_disconnected',connectionHandler);

    // Borramos las conexiones viejas
    setInterval(function() {
        for (var i in clients) {
            if ($.now() - clients[i].updated > 5000) {
                pointers[i].remove();
                delete clients[i];
                delete pointers[i];
            }
        }
    }, 5000);


});// End ready



/*

ANDIAMO

*/


var startGestureTime = 0;


/*

mousePressed() - P5.js

Captura el mousePressed dentro del canvas de P5.js.

*/

function mousePressed() {

    var t0 = startGestureTime = millis();

    var connected = false;
    if (lastGesture && grouping && t0 - lastGesture.t1 < 1000 * MAX_GROUP_TIME) {
        t0 = lastGesture.t0;
        connected = true;
    }

    // Este es el objeto que se emite
    var movement = {
        'e': "PRESS",
        'x': mouseX,
        'y': mouseY,
        'color': currColor,
        'id': id
    }

    socket.emit("andiamoMouseEvent", movement);

    currGesture = new StrokeGesture(t0, dissapearing, fixed, lastGesture);

    if (connected) {
        lastGesture.next = currGesture;
    }


    addPointToRibbon(mouseX, mouseY);
}

/*

mouseDragged() - P5.js

Captura el mouseDragged dentro del canvas de P5.js

*/

function mouseDragged() {
    if (currGesture) {
        var movement = {
            'e': "DRAGGED",
            'x': mouseX,
            'y': mouseY,
            'id': id
        }
        socket.emit("andiamoMouseEvent", movement);

        addPointToRibbon(mouseX, mouseY);
    }
}

/*

mouseReleased() - P5.js

Captura el mouseReleased dentro del canvas de P5.js

*/

function mouseReleased() {
    if (currGesture) {
        addPointToRibbon(mouseX, mouseY);
        currGesture.setLooping(looping);
        currGesture.setEndTime(millis());
        if (currGesture.visible) {
            layers[currLayer].push(currGesture);
        }
        var movement = {
            'e': "RELEASED",
            'x': mouseX,
            'y': mouseY,
            'id': id
        }
        socket.emit("andiamoMouseEvent", movement);
        lastGesture = currGesture;
        currGesture = null;
    }
}


/*

socket.on -> "andiamoMouseEvent"

*/

socket.on('andiamoMouseEvent', function(data){

    // Debug log
    console.log("data.id: "+data.id + " data.e: " + data.e + " data.x: " + data.x + " data.y: " + data.y);

    /*
    PRESS
    */

    if (data.e === "PRESS") {
        var t0 = startGestureTime = millis();

        var connected = false;
        if (lastGesture && grouping && t0 - lastGesture.t1 < 1000 * MAX_GROUP_TIME) {
            t0 = lastGesture.t0;
            connected = true;
        }

        currGesture = new StrokeGesture(t0, dissapearing, fixed, lastGesture);

        if (connected) {
            lastGesture.next = currGesture;
        }

        addPointToRibbon(data.x,data.y);
    }

    /*
    DRAGGED
    */

    if (data.e === "DRAGGED") {
        addPointToRibbon(data.x, data.y);
    }

    /*
    RELEASED
    */

    if (data.e === "RELEASED"){
        if (currGesture) {
            addPointToRibbon(data.x, data.y);
            currGesture.setLooping(looping);
            currGesture.setEndTime(millis());
            if (currGesture.visible) {
                layers[currLayer].push(currGesture);
            }
            lastGesture = currGesture;
            currGesture = null;
        }
    }


});
