var room_id = window.location.pathname.split("/")[2];
// Socket.io
var socket = io({query: 'room_id='+room_id});
var id = Math.round($.now() * Math.random()); // Temporal ID Generator

var share_dialog_open = false;


// El DOM termina de cargar.
$(document).ready(function() {

    var doc = $(document);
    var win = $(window);
    var clients = {};
    var pointers = {};
    var prev = {};
    var lastEmit = $.now();

    // Seteo el color en base al data-color de cada uno
    $(".color_button").each(function(index){
        $(this).css('background-color', $(this).data('color'));
    });

    // Setea el color cuando clickea
    $(".color_button").click(function(){
        // Esta es una variable local que esta en andiamo.js
        currColor = STROKE_COLORS[$(this).index()];
        // Cambio el color de la UI
        $(".sidebar_button_color").css('background-color', $(this).data('color'));
    });

    // Menú desplegable de color
    $(".sidebar_button_color").hover(function(){
        $(".drop_color").stop().fadeIn(200);
    },function(){
        $(".drop_color").stop().fadeOut(200);
    });

    // Menú desplegable de color
    $(".sidebar_weight_button").hover(function(){
        $(".drop_weight").stop().fadeIn(200);
    },function(){
        $(".drop_weight").stop().fadeOut(200);
    });

    $(".weight_button_01").click(function(){
        RIBBON_WIDTH = RIBBON_WIDTHS[0];
        $(".weight_point").removeClass('weight_point_tam01 weight_point_tam02 weight_point_tam03 weight_point_tam04');
        $(".weight_point").addClass('weight_point_tam01');
    });

    $(".weight_button_02").click(function(){
        RIBBON_WIDTH = RIBBON_WIDTHS[1];
        $(".weight_point").removeClass('weight_point_tam01 weight_point_tam02 weight_point_tam03 weight_point_tam04');
        $(".weight_point").addClass('weight_point_tam02');
    });

    $(".weight_button_03").click(function(){
        RIBBON_WIDTH = RIBBON_WIDTHS[2];
        $(".weight_point").removeClass('weight_point_tam01 weight_point_tam02 weight_point_tam03 weight_point_tam04');
        $(".weight_point").addClass('weight_point_tam03');
    });

    $(".weight_button_04").click(function(){
        RIBBON_WIDTH = RIBBON_WIDTHS[3];
        $(".weight_point").removeClass('weight_point_tam01 weight_point_tam02 weight_point_tam03 weight_point_tam04');
        $(".weight_point").addClass('weight_point_tam04');
    });

    $(".delete_button").click(function() {
        // for (var i = 0; i < layers.length; i++) {
        var i = currLayer;    
        for (var j = layers[i].length - 1; j >= 0; j--) {
            layers[i][j].looping = false;
            layers[i][j].fadeOutFact = DELETE_FACTOR;
        }
        // }
        var del = {
          'layer': currLayer,
          'id': id
        }        
        socket.emit("deleteEvent", del);
    });

    // Botones divididos
    $(".sidebar_button .clickUp, .sidebar_button .clickRight").on("mouseover", function() {
        $(this).parent().addClass("up");
    })
    $(".sidebar_button .clickDown, .sidebar_button .clickLeft").on("mouseover", function() {
        $(this).parent().addClass("down");
    })
    $(".sidebar_button .clickUp, .sidebar_button .clickRight").on("mouseleave", function() {
        $(this).parent().removeClass("up");
    })
    $(".sidebar_button .clickDown, .sidebar_button .clickLeft").on("mouseleave", function() {
        $(this).parent().removeClass("down");
    })
    $(".sidebar_button .wrapperDual").on("click", function() {
        var state = Number( $(this).attr("data-state") );

        if ( $(this).hasClass("down") ) {
            if ( state > 1 ) {
                state--;
                $(this).attr("data-state", state);

                var $img =  $(this).children("img");
                var name = $(this).attr("id");
                $img.attr("src", "../img/" + name + "_" + state + ".svg");
            }
        }
        if ( $(this).hasClass("up") ) {
            var maxState = Number( $(this).attr("data-max-state") );
            if ( state < maxState ) {
                state++;
                $(this).attr("data-state", state);

                var $img =  $(this).children("img");
                var name = $(this).attr("id");
                $img.attr("src", "../img/" + name + "_" + state + ".svg");

            }
        }

        if ( name == "velocidad" ) {
            if (state == 1) {
                fixed = true;
            } else {
                fixed = false;
                LOOP_MULTIPLIER = map(state, 2, 10, 5,0) ;
                console.log("Velocidad: " + LOOP_MULTIPLIER);
            }
        }
        if ( name == "mirar" ) {
            var ascale = map(state, 1,7,0,1);
            console.log("Alpha: " + ascale);
            // currAlpha = 255 * ascale;

            alphaScale[currLayer] = ascale
            for (var i = 0; i < layers[currLayer].length; i++) {
                var gesture = layers[currLayer][i];
                // var ascale = gesture.getAlphaScale();
                // ascale = constrain(ascale - 0.05, 0, 1);
                gesture.setAlphaScale(ascale);
            }


        }
    });
    //Boton loop
    $(".sidebar_button #loop").click(function() {
        if ( !$(this).hasClass("inactive") ) {
            $(this).addClass("inactive");
            var $img =  $(this).children("img");
            $img.attr("src", "../img/girar_2.svg");

            looping = false;
        } else {
            $(this).removeClass("inactive");
            var $img =  $(this).children("img");
            $img.attr("src", "../img/girar_1.svg");

            looping = true;
        }
    });
    // Botones de capa
    $(".wrapperCapa img").on("mouseover", function() {
        if ( !$(this).hasClass("active") ) {
            $(this).attr("src", "../img/capa_hover.svg");
        }
    });
    $(".wrapperCapa img").on("mouseleave", function() {
        if ( !$(this).hasClass("active") ) {
            $(this).attr("src", "../img/capa.svg");
        }
    });
    $(".wrapperCapa img").on("click", function() {
        var numeroCapa = this.className.split(" ")[1].substring(4,5);

        $(".wrapperCapa img").each(function() {
            $(this).attr("src","../img/capa.svg");
            $(this).removeClass("active");
        });
        $(this).attr("src","../img/capa_active.svg");
        $(this).addClass("active");

        var currLayer0 = currLayer;
        currLayer = Number(numeroCapa) - 1;
        if (currLayer0 != currLayer) {
            ascale = alphaScale[currLayer];
            var state = int(map(ascale, 0, 1, 1,7));
            
            // $(".sidebar_button .wrapperVertical img").each(function() {
            //     $(this).attr("src", "../img/mirar_" + state + ".svg");
            // });

            $(".sidebar_button .wrapperVertical img").attr("src", "../img/mirar_" + state + ".svg");
            $(".sidebar_button .wrapperVertical").attr("data-state", state);
        }
    });
    // Boton delete
    $(".delete_button img").on("mousedown", function() {
        $(this).attr("src", "../img/tacho_click.svg");
    });
    $(".delete_button img").on("mouseup", function() {
        setTimeout( function() {
            $(".delete_button img").attr("src", "../img/tacho.svg");
        }, 600);
    });

    // Share button
    $(".share_button").click(function(){
        $(".share_button img").attr("src","../img/share_click.svg")
        setTimeout( function() {
            $(".share_button img").attr("src", "../img/share.svg");
        }, 400);

        $("#share_dialog").fadeIn();

        share_dialog_open = true;

        $(".shareDialogInput").focus();
        $(".shareDialogInput").select();

    })

    // Share social media
    $(".share_social_button").click(function(){        
        $(".share_social_button img").attr("src","../img/share_click.svg")
        setTimeout( function() {
            $(".share_social_button img").attr("src", "../img/share.svg");
        }, 400);


        saveFrames("out", "png", 3, 10, function(data) {
        
          var images = []
          for (var i = 0; i < data.length; i++) {
            images.push(data[i].imageData);
          }
       
          const urlSplit = window.location.href.split('/');
          const hostAndPort = urlSplit[0] + '//' + urlSplit[2] + '/';

          var r = canvas.width / canvas.height;
          var gifw = 500;
          var gifh = Math.round(gifw / r);


          gifshot.createGIF({'images': images, 
                             'gifWidth': gifw, 'gifHeight': gifh}, function(obj) {
            if(!obj.error) {
              var image = obj.image;
            
              println("success :)");
              $.ajax({
                    type: "POST",
                    url: hostAndPort + 'files',
                    data: image,
                    success: function(data) {
                        console.log('lala');
                        var imageUrl = hostAndPort + data.filename;
                        console.log(imageUrl);
                        $(".shareDialogInput").val(imageUrl);
                        $("#share_dialog").fadeIn();
                        share_dialog_open = true;
                        $(".shareDialogInput").focus();
                        $(".shareDialogInput").select();
                    },
                    error: function(obj){println("no luck...");println(obj);},
                    dataType: 'json'
              });
              /*
              $.ajax({
                type: 'POST',
                url: 'http://upload.giphy.com/v1/gifs',
                data: {
                  username: "trazostest",
                  api_key: "dc6zaTOxFJmzC",
//                 file: image,
                   source_image_url: "https://media.giphy.com/media/3oz8xQuNk06SCLq5t6/giphy.gif",
                  tags: "trazos,test"
                },
                success: function(obj){println("yea, uploaded gif!");println(obj);},
                error: function(obj){println("no luck...");println(obj);}
              });  
            */
            
            } else {
              println("error :(");
            }          

          });
        });
    })

    // Share dialog
    $(".close_button").click(function(){
        $("#share_dialog").fadeOut();

        share_dialog_open = false;
    })

    $(".shareLinkMailto").on('click', function (event) {
        event.preventDefault();
        var email = "";
        var subject = 'Invitación al tablero';
        var emailBody = 'Ingresa a este tablero: '+window.location.href;
        window.location = 'mailto:' + email + '?subject=' + subject + '&body=' +   emailBody;
    });
    /*

    connectionHandler()

    Muestra la cantidad de usuarios conectados en el DOM.

    */

    function connectionHandler(data) {
        //$("#connected_users").text("Users: "+data.connections);
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
    socket.on('deleteEvent', deleteHandler);

    function deleteHandler(data) {
        var layer = data.layer;
        var id = data.id;
        var gestures = otherGestures[layer].get(id);
        for (var idx in gestures) {
            var g = gestures[idx];
            // if (g.layer == layer) {
                g.looping = false;
                g.fadeOutFact = DELETE_FACTOR;
            // }
        }
    }

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


});// End ready


/*

mousePressed() - P5.js

Captura el mousePressed dentro del canvas de P5.js.

*/


function mousePressed() {
    if (share_dialog_open) return;

    var startGestureTime = 0;
    var t0 = startGestureTime = millis();

    // Creamos el currGesture (este es el que se dibuja desde p5.js)
    currGesture = new StrokeGesture(t0, dissapearing, fixed, lastGesture, currLayer);

    // Creamos el nuevo ribbon
    ribbon = new Ribbon();
    ribbon.init(RIBBON_WIDTH);

    // Agregamos el punto al ribbon
    ribbon.addPoint(currGesture, currColor, currAlpha, mouseX, mouseY);

    // Objeto que se emite
    var movement = {
        'e': "PRESS",
        'x': mouseX,
        'y': mouseY,
        'color': currColor,
        'stroke_weight':RIBBON_WIDTH,
        'layer': currLayer,
        'fixed':fixed,
        'id': id        
    }

    // Emitimos el evento a los demas clientes.
    socket.emit("externalMouseEvent", movement);

    return false;

}


/*

touchStarted() - P5.js

Captura el touch de mobile

*/


function touchStarted() {
    if (share_dialog_open) return;

    var startGestureTime = 0;
    var t0 = startGestureTime = millis();

    // Creamos el currGesture (este es el que se dibuja desde p5.js)
    currGesture = new StrokeGesture(t0, dissapearing, fixed, lastGesture, currLayer);

    // Creamos el nuevo ribbon
    ribbon = new Ribbon();
    ribbon.init(RIBBON_WIDTH);

    // Agregamos el punto al ribbon
    ribbon.addPoint(currGesture, currColor, currAlpha, touchX, touchY);

    // Objeto que se emite
    var movement = {
        'e': "PRESS",
        'x': touchX,
        'y': touchY,
        'color': currColor,
        'stroke_weight':RIBBON_WIDTH,
        'layer': currLayer,
        'fixed':fixed,
        'id': id
    }
    // Emitimos el evento a los demas clientes.
    socket.emit("externalMouseEvent", movement);

    return false;

}




/*

mouseDragged() - P5.js

Captura el mouseDragged dentro del canvas de P5.js

*/


function mouseDragged() {
    if (share_dialog_open) return;

    if (currGesture) {
        var movement = {
            'e': "DRAGGED",
            'x': mouseX,
            'y': mouseY,
            'color': currColor,
            'stroke_weight':RIBBON_WIDTH,
            'layer': currLayer,
            'id': id
        }
        socket.emit("externalMouseEvent", movement);

        ribbon.addPoint(currGesture, currColor, currAlpha, mouseX, mouseY);
    }

    return false;
}


/*

touchMoved() - P5.js

Captura el touch.

*/

function touchMoved() {
    if (share_dialog_open) return;

    if (currGesture) {
        var movement = {
            'e': "DRAGGED",
            'x': touchX,
            'y': touchY,
            'color': currColor,
            'stroke_weight':RIBBON_WIDTH,
            'layer': currLayer,
            'id': id
        }
        socket.emit("externalMouseEvent", movement);

        ribbon.addPoint(currGesture, currColor, currAlpha, touchX, touchY);
    }
}


/*

mouseReleased() - P5.js

Captura el mouseReleased dentro del canvas de P5.js

*/

function mouseReleased() {
    if (share_dialog_open) return;

    if (currGesture) {

        // Agregamos el último punto
        ribbon.addPoint(currGesture, currColor, currAlpha, mouseX, mouseY);
        currGesture.setLooping(looping);
        currGesture.setEndTime(millis());

        // Pusheamos el gesture a la capa
        if (currGesture.visible) {
            layers[currLayer].push(currGesture);
        }

        var movement = {
            'e': "RELEASED",
            'x': mouseX,
            'y': mouseY,
            'color': currColor,
            'stroke_weight':RIBBON_WIDTH,
            'layer': currLayer,
            'looping': looping,
            'id': id
        }
        socket.emit("externalMouseEvent", movement);

        lastGesture = currGesture;
        currGesture = null;
    }
}

/*

mouseReleased() - P5.js

Captura el touch.

*/

function touchEnded() {
    if (share_dialog_open) return;

    if (currGesture) {

        // Agregamos el último punto
        ribbon.addPoint(currGesture, currColor, currAlpha, touchX, touchY);
        currGesture.setLooping(looping);
        currGesture.setEndTime(millis());

        // Pusheamos el gesture a la capa
        if (currGesture.visible) {
            layers[currLayer].push(currGesture);
        }

        var movement = {
            'e': "RELEASED",
            'x': touchX,
            'y': touchY,
            'color': currColor,
            'stroke_weight':RIBBON_WIDTH,
            'layer': currLayer,
            'looping': looping,
            'id': id
        }
        socket.emit("externalMouseEvent", movement);

        lastGesture = currGesture;
        currGesture = null;
    }
}

/*

socket.on -> "externalMouseEvent"

*/

socket.on('externalMouseEvent', function(data){

    /*
    MOUSE PRESS
    */

    if (data.e === "PRESS") {

        // Variables
        var startGestureTime = 0;
        var t0 = startGestureTime = millis();
        var lastGesture = null;
        var grouping = true;
        var layer = data.layer;

        // Agregamos este gesture a la lista de gestures
        otherGestures[layer].put(data.id, new StrokeGesture(t0, dissapearing, data.fixed, lastGesture, layer));
        // Agregamos un ribbon
        otherRibbons.put(data.id, new Ribbon());
        // Inicializamos el ribbon
        otherRibbons.get(data.id).init(data.stroke_weight);
        // Le agregamos este punto
        var other = otherGestures[layer].get(data.id);
        otherRibbons.get(data.id).addPoint(other[other.length-1], data.color, currAlpha, data.x, data.y);

    }

    /*
    MOUSE DRAGGED
    */

    if (data.e === "DRAGGED") {
        var layer = data.layer;
        // Agregamos el punto
        var other = otherGestures[layer].get(data.id);
        otherRibbons.get(data.id).addPoint(other[other.length-1], data.color, currAlpha, data.x, data.y);
    }

    /*
    MOUSE RELEASED
    */

    if (data.e === "RELEASED"){
        var layer = data.layer;

        // Seteamos el ultimo punto
        var other = otherGestures[layer].get(data.id);
        otherRibbons.get(data.id).addPoint(other[other.length-1], data.color, currAlpha, data.x, data.y);
        // Seteamos el looping
        other[other.length-1].setLooping(data.looping);
        other[other.length-1].setEndTime(millis());
        // Lo agregamos a la capa local
        //layers[currLayer].push(otherGestures.get(data.id));
        // Borramos este gesture
        //otherGestures.remove(data.id);

    }


});
