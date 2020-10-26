
function deleteHandler(data) {
    var layer = data.layer;
    var id = data.id;
    if(otherGestures[layer]) var gestures = otherGestures[layer].get(id);
    for (var idx in gestures) {
        var g = gestures[idx];
        // if (g.layer == layer) {
        g.looping = false;
        g.fadeOutFact = DELETE_FACTOR;
        // }
    }
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

// function mouseMoveHandler(e) {

//     // Chequeamos cuando fue el lastEmit para no emitir mensajes de mas
//     if ($.now() - lastEmit > 20) {
//         var movement = {
//             'x': e.pageX,
//             'y': e.pageY,
//             'id': id
//         }
//         // socket.emit("mousemove", movement);
//         lastEmit = $.now();
//     }

// }

/*

Capturamos los eventos del mouse

*/

// doc.on('mousemove', mouseMoveHandler);


function keyPressed() {
    if (keyCode == 27) {
        var elem = document.getElementById("andiamo");
        if (!elem) return
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
}

/*

keyPressed() - P5.js

Habilita fullscreen.

*/

function keyPressed() {
    if (keyCode == 27) {
        var elem = document.getElementById("andiamo");
        if (!elem) return
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
}


/*

mousePressed() - P5.js

Captura el mousePressed dentro del canvas de P5.js.

*/

function mousePressed() {
    if (modals_open) return;

    var t0 = millis();

    // Creamos el currGesture (este es el que se dibuja desde p5.js)
    currGesture = new StrokeGesture(dissapearing, fixed, lastGesture, currLayer);
    currGesture.setStartTime(t0);

    // Creamos el nuevo ribbon
    ribbon = new Ribbon();
    ribbon.init(RIBBON_WIDTH);

    // Agregamos el punto al ribbon
    ribbon.addPoint(currGesture, t0, currColor, currAlpha, mouseX, mouseY);

    // Objeto que se emite
    var movement = {
        'e': "PRESS",
        'x': mouseX,
        'y': mouseY,
        't': t0,
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
    if (modals_open) return;

    var t0 = millis();

    // Creamos el currGesture (este es el que se dibuja desde p5.js)
    currGesture = new StrokeGesture(dissapearing, fixed, lastGesture, currLayer);
    currGesture.setStartTime(t0);

    // Creamos el nuevo ribbon
    ribbon = new Ribbon();
    ribbon.init(RIBBON_WIDTH);

    // Agregamos el punto al ribbon
    ribbon.addPoint(currGesture, t0, currColor, currAlpha, touchX, touchY);

    // Objeto que se emite
    var movement = {
        'e': "PRESS",
        'x': touchX,
        'y': touchY,
        't': t0,
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
    if (modals_open) return;

    if (currGesture) {
        var t = millis();
        var t0 = currGesture.getStartTime();

        var movement = {
            'e': "DRAGGED",
            'x': mouseX,
            'y': mouseY,
            't': t - t0,
            'color': currColor,
            'stroke_weight':RIBBON_WIDTH,
            'layer': currLayer,
            'id': id
        }
        socket.emit("externalMouseEvent", movement);

        ribbon.addPoint(currGesture, t, currColor, currAlpha, mouseX, mouseY);
    }

    return false;
}


/*

touchMoved() - P5.js

Captura el touch.

*/

function touchMoved() {
    if (modals_open) return;

    if (currGesture) {
        var t = millis();
        var t0 = currGesture.getStartTime();

        var movement = {
            'e': "DRAGGED",
            'x': touchX,
            'y': touchY,
            't': t - t0,
            'color': currColor,
            'stroke_weight':RIBBON_WIDTH,
            'layer': currLayer,
            'id': id
        }
        socket.emit("externalMouseEvent", movement);

        ribbon.addPoint(currGesture, t, currColor, currAlpha, touchX, touchY);
    }
}


/*

mouseReleased() - P5.js

Captura el mouseReleased dentro del canvas de P5.js

*/

function mouseReleased() {
    if (modals_open) return;

    if (currGesture) {

        // Agregamos el último punto
        var t1 = millis();
        var t0 = currGesture.getStartTime();
        ribbon.addPoint(currGesture, t1, currColor, currAlpha, mouseX, mouseY);
        currGesture.setLooping(looping);
        currGesture.setEndTime(t1);

        // Pusheamos el gesture a la capa
        if (currGesture.visible) {
            layers[currLayer].push(currGesture);
        }

        var movement = {
            'e': "RELEASED",
            'x': mouseX,
            'y': mouseY,
            't': t1 - t0,
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
    if (modals_open) return;

    if (currGesture) {

        // Agregamos el último punto
        var t1 = millis();
        var t0 = currGesture.getStartTime();
        ribbon.addPoint(currGesture, t1, currColor, currAlpha, touchX, touchY);
        currGesture.setLooping(looping);
        currGesture.setEndTime(t1);

        // Pusheamos el gesture a la capa
        if (currGesture.visible) {
            layers[currLayer].push(currGesture);
        }

        var movement = {
            'e': "RELEASED",
            'x': touchX,
            'y': touchY,
            't': t1 - t0,
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

function externalMouseEvent(data){
    /*
    MOUSE PRESS
    */

    if (data.e === "PRESS") {

        // Variables
        var t0 = millis();
        var lastGesture = null;
        var grouping = true;
        var layer = data.layer;

        // Agregamos este gesture a la lista de gestures
        var newGesture = new StrokeGesture(dissapearing, data.fixed, lastGesture, layer);
        newGesture.setStartTime(t0);
        otherGestures[layer].put(data.id, newGesture);

        // Agregamos un ribbon
        var newRibbon = new Ribbon();
        // Inicializamos el ribbon
        newRibbon.init(data.stroke_weight);
        otherRibbons.put(data.id, newRibbon);

        // Le agregamos este punto
        var other = otherGestures[layer].get(data.id);
        newRibbon.addPoint(other[other.length-1], t0, data.color, currAlpha, data.x, data.y);
    }

    /*
    MOUSE DRAGGED
    */

    if (data.e === "DRAGGED") {
        var layer = data.layer;
        var other = otherGestures[layer].get(data.id);
        var otherGesture = other[other.length-1];
        var otherRibbon = otherRibbons.get(data.id);

        // Agregamos el punto
        var t0 = otherGesture.getStartTime();
        var t = t0 + data.t;
        print("Adding point " + t0 + + " " + data.t);
        otherRibbon.addPoint(otherGesture, t, data.color, currAlpha, data.x, data.y);
    }

    /*
    MOUSE RELEASED
    */

    if (data.e === "RELEASED") {
        var layer = data.layer;
        var other = otherGestures[layer].get(data.id);
        var otherGesture = other[other.length-1];
        var otherRibbon = otherRibbons.get(data.id);

        // Seteamos el ultimo punto
        var t0 = otherGesture.getStartTime();
        var t1 = t0 + data.t;
        // t1 = mills();
        print("Ending gesture " + t0 + + " " + t1);

        otherRibbon.addPoint(otherGesture, t1, data.color, currAlpha, data.x, data.y);
        // Seteamos el looping
        otherGesture.setLooping(data.looping);
        otherGesture.setEndTime(t1);
    }
}
