var canvas;

var layers = [];
var currGesture = null;
var lastGesture = null;
var looping = false;
var fixed = false;
var dissapearing = false;
var grouping = false;
var currColor = [255, 255, 255];
var currAlpha = 150;

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
}

function draw() {
  background(0);

  var t = millis();
  for (var i = 0; i < layers.length; i++) {
    for (var j = 0; j < layers[i].length; j++) {
      var gesture = layers[i][j]
      gesture.update(t);
      gesture.draw();
    }
  }
  if (currGesture) {
    currGesture.update(t);
    currGesture.draw();
  }
  cleanup();

}

function startup() {
  initRibbons();

  looping = LOOPING_AT_INIT;
  println("Looping: " +  looping);

  fixed = FIXED_STROKE_AT_INIT;
  println("Fixed: " +  fixed);

  dissapearing = DISSAPEARING_AT_INIT;
  println("Dissapearing: " +  looping);

  grouping = false;
  println("Gouping: " +  grouping);

  layers = [null, null, null, null];
  for (var i = 0; i < 4; i++) {
    layers[i] = [];
  }

  currLayer = 0;
  lastGesture = null;
  currGesture = new StrokeGesture(0, dissapearing, fixed, lastGesture);
  println("Selected stroke layer: " + 1);
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
