$(document).ready(function() {

    // Socket.io
    var socket = io();

    // DOM
    var doc = $(document);
    var win = $(window);
    var canvas = $("#trazos_canvas");
    var connections = $('#connections');
    var ctx = canvas[0].getContext('2d');
    var id = Math.round($.now() * Math.random()); // Provisional

    // Estados
    var drawing = false;
    var clients = {};
    var pointers = {};
    var prev = {};
    var lastEmit = $.now();
    var current_color = "#ffffff";
    var current_stroke_weight = "1";

    // Paleta de colores

    $(".color").each(function(index){
        $(this).css("background-color",$(this).data('color'));
    });

    $(".color").click(function(){
        current_color = $(this).data('color');
    })

    // Paleta de strokes

    $(".stroke").each(function(index){
        $(this).css("height",$(this).data('stroke-weight'));
    });

    $(".stroke").click(function(){
        current_stroke_weight = $(this).data('stroke-weight');
    });

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

        // Si esta dibujando y existe
        if(data.drawing && clients[data.id]){
          drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y, data.color,data.stroke_weight);
        }

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
                'drawing': drawing,
                'color': current_color,
                'stroke_weight': current_stroke_weight,
                'id': id
            }
            socket.emit("mousemove", movement);
            lastEmit = $.now();
        }

        if (drawing) {
            drawLine(prev.x, prev.y, e.pageX, e.pageY, current_color,current_stroke_weight);
            prev.x = e.pageX;
            prev.y = e.pageY;
        }

    }

    /*
    mousedownHandler()

    Cuando el mouse local se presiona sobre el canvas.

    */

    function mousedownHandler(e) {
        e.preventDefault();
        drawing = true;
        prev.x = e.pageX;
        prev.y = e.pageY;
    }

    /*

    Capturamos los eventos del mouse

    */

    canvas.on('mousedown', mousedownHandler);
    doc.on('mousemove', mouseMoveHandler);
    doc.bind('mouseup mouseleave',function(){
        drawing = false;
    });

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


    /*

    CANVAS FUNCTIONS

    */

    function drawLine(fromx, fromy, tox, toy, color,stroke_weight) {
        ctx.beginPath(); // create a new empty path (no subpaths!)
        ctx.strokeStyle = color;
        ctx.lineWidth = stroke_weight;
        ctx.lineCap = 'round';
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
    }

});// End ready
