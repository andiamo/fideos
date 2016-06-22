var logo;

//esto es para probar nada mas
var angle = 90;
var speed = 0.02;

function setup() {

    //Para que se ajuste bien al tamaño de la pantalla y el logo
    var canvasHeight = $("#modalIndex .logo").height() + 0.2 * 0.8 * windowHeight;
    var canvas = createCanvas(0.8*windowWidth, canvasHeight);
    canvas.parent('canvas');

    //De esta manera orbita alrededor del logo
    orbit = $("#modalIndex .logo").width() * 0.75;

    //esto es para probar nada mas
    stroke(255);
    noFill();
    textAlign(CENTER);
}

function draw() {
    // Acá se puede poner la lógica para que se dibuje la nube
    // hice una simple prueba
    clear();
    translate(width/2,height/2);
    text("prueba", sin(angle) * orbit * 1.5, cos(angle) * orbit);
    text("prueba2", sin(-angle) * orbit * 1.5, cos(-angle) * orbit);
    angle+=speed;

    if ( angle >= 360 ) {
        angle = 0;
    }
}
