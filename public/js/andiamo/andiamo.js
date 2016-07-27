var canvas;

var layers = [];
var currGesture = null;
var lastGesture = null;
var ribbons = null;
var looping = false;
var fixed = false;
var dissapearing = false;
var grouping = false;
var currColor = [175, 0, 255]; //[255, 255, 255];
var currAlpha = 255;
var alphaScale = [];

// Hashmaps para los trazos externos
var otherGestures = [];
var otherRibbons = null;

var ctx;

function setup() {
  var w = 0, h = 0;
  if(typeof(window.innerWidth) == 'number') {
    // Non-IE
    w = window.innerWidth;
    h = window.innerHeight;
  } else if(document.documentElement &&
  	        (document.documentElement.clientWidth ||
  	         document.documentElement.clientHeight)) {
    // IE 6+ in 'standards compliant mode'
    w = document.documentElement.clientWidth;
    h = document.documentElement.clientHeight;
  } else if(document.body && (document.body.clientWidth ||
  	                          document.body.clientHeight)) {
    // IE 4 compatible
    w = document.body.clientWidth;
    h = document.body.clientHeight;
  }
  canvas = createCanvas(w-5, h-5);
  canvas.parent('andiamo');
  startup();
  ctx = this.drawingContext;
}

function draw() {
  background(0);

  var t = millis();
  for (var i = layers.length - 1; 0 <= i; i--) {
    
    // Dibujar los trazos externos
    var other = otherGestures[i];
    for (var j = 0; j < other.values().length; j++) {
      other.values()[j].update(t);
      other.values()[j].draw();
    }


    for (var j = 0; j < layers[i].length; j++) {
      var gesture = layers[i][j]
      gesture.update(t);
      gesture.draw();
    }
    if (currGesture && currLayer == i) {
      currGesture.update(t);
      currGesture.draw();
    }    
  }


  cleanup();
}

function startup() {
  looping = LOOPING_AT_INIT;
  fixed = FIXED_STROKE_AT_INIT;
  dissapearing = DISSAPEARING_AT_INIT;
  grouping = false;
  
  layers = [null, null, null, null];
  otherGestures = [null, null, null, null];
  otherRibbons = new HashMap();
  for (var i = 0; i < 4; i++) {
    layers[i] = [];
    otherGestures[i] = new MultiMap();
  }
  alphaScale = [1, 1, 1, 1]

  currLayer = 0;
}

function cleanup() {
  for (var i = 0; i < layers.length; i++) {
    for (var j = layers[i].length - 1; j >= 0; j--) {
      var gesture = layers[i][j];
      if (!gesture.isVisible() && !gesture.isLooping()) {
        delete layers[i][j];
        layers[i].splice(j, 1);
      }
    }
  }
}
