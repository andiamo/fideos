var logo;

var noiseScale = 0.01;

var orbit;
var w, h;

var palabras = ['dibujo', 'en vivo', 'colectivo', 'en línea', 'para tod@s', 'en diálogo', 'en tiempo real', 'animado'];
var sizes =    [      24,        18,          24,         18,           24,           18,               24,        18];
var angles =   [       0,         0,           0,          0,            0,            0,                0,         0];
var speeds =   [       0,         0,           0,          0,            0,            0,                0,         0];
var nscale =   [       0,         0,           0,          0,            0,            0,                0,         0];

// var angle = 90;
// var speed = 0.01;

function setup() {

    //Para que se ajuste bien al tamaño de la pantalla y el logo
    var canvasHeight = $("#modalIndex .logo").height() + 0.2 * 0.8 * windowHeight;
    var canvas = createCanvas(0.8*windowWidth, canvasHeight);
    canvas.parent('canvas');
    w = width;
    h = height;


    $("#modalIndex, #sidebar").css("height", windowHeight);

    //De esta manera orbita alrededor del logo
    orbit = $("#modalIndex .logo").width() * 0.75;

    //esto es para probar nada mas
    // stroke(255);
    // noFill();
    noStroke();
    fill(0, 102, 0);

    for (var i = 0; i < palabras.length; i++) {
        sizes[i] = int(random(18, 24))
        angles[i] = random(TWO_PI);
        speeds[i] = (random() > 0.5 ? +1 : -1) * random(0.003, 0.006);
        nscale[i] = random(0.001, 0.01);
    }

    textAlign(CENTER);
    textFont("Lucida Sans Typewriter");
}

function draw() {
    clear();
    translate(w/2, h/2);

    for (var i = 0; i < palabras.length; i++) {
        var pala = palabras[i];
        var angle = angles[i];
        var size = sizes[i];
        var speed = speeds[i];
        textSize(size);

        var x = sin(angle) * orbit * 1.5;
        var y = cos(angle) * orbit;

        var r = map(noise(x * nscale[i], y * nscale[i]), 0, 1, orbit * 0.85, orbit * 1.15);

        x = sin(angle) * r * 1.5;
        y = cos(angle) * r;

        text(pala, x, y);
        angle += speed;
        if (abs(angle) >= TWO_PI) {
            angle = 0;
        }
        angles[i] = angle;
    }
}

function windowResized() {
    var canvasHeight = $("#modalIndex .logo").height() + 0.2 * 0.8 * windowHeight;
    resizeCanvas(0.8*windowWidth, canvasHeight);
    w = width;
    h = height;

    //De esta manera orbita alrededor del logo
    orbit = $("#modalIndex .logo").width() * 0.75;

    $("#modalIndex, #sidebar").css("height", windowHeight);
}
