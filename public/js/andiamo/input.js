var startGestureTime = 0;

function mousePressed() {
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
  
  addPointToRibbon(mouseX, mouseY);
}

function mouseDragged() {
  if (currGesture) {
    addPointToRibbon(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (currGesture) {
    addPointToRibbon(mouseX, mouseY);
    currGesture.setLooping(looping);
    currGesture.setEndTime(millis());
    if (currGesture.visible) {
      layers[currLayer].push(currGesture);
    }
    lastGesture = currGesture;    
    currGesture = null;
  }
}

function keyPressed() {
  println(keyCode);
  if (keyCode == 38) { // UP
    LOOP_MULTIPLIER += 1; 
    println("Loop multiplier: " + LOOP_MULTIPLIER);
  } else if (keyCode == 40) { // DOWN
    LOOP_MULTIPLIER -= 1;
    if (LOOP_MULTIPLIER < 1) LOOP_MULTIPLIER = 1;
    println("Loop multiplier: " + LOOP_MULTIPLIER);      
  } else if (keyCode == 37) { // LEFT
    println("Decrease alpha factor of all gestures");
    for (var i = 0; i < layers[currLayer].length; i++) {
      var gesture = layers[currLayer][i];
      var ascale = gesture.getAlphaScale();
      ascale = constrain(ascale - 0.05, 0, 1);
        stroke.setAlphaScale(ascale);   
    }
  } else if (keyCode == 39) { // RIGHT
    println("Increase alpha factor of all gestures");
    for (var i = 0; i < layers[currLayer].length; i++) {
      var gesture = layers[currLayer][i];
      var ascale = gesture.getAlphaScale();
      ascale = constrain(ascale + 0.05, 0, 1);
      gesture.setAlphaScale(ascale);   
    }      
  } else if (key == ' ') { // SPACE
    looping = !looping;
    println("Looping: " + looping);
  } else if (keyCode == 13) { // ENTER
    grouping = !grouping;
    println("Grouping: " + grouping);
  } else if (keyCode == 8) { // BACKSPACE
    for (var i = 0; i < layers[currLayer].length; i++) {
      var gesture = layers[currLayer][i];
      gesture.looping = false;
      gesture.fadeOutFact = DELETE_FACTOR;
    }
    if (currGesture != null) {
      currGesture.looping = false;
      currGesture.fadeOutFact = DELETE_FACTOR;
    }
    println("Delete layer");
  } else if (keyCode == 16) { // SHIFT
    fixed = !fixed;
    println("Fixed: " + fixed);
  } else if (keyCode == 17) { // CONTROL
    dissapearing = !dissapearing;
    println("Dissapearing lines: " + dissapearing);
  } else if (key == '1') {
    currLayer = 0;
    println("Selected stroke layer: " + 1);
  } else if (key == '2') {
    currLayer = 1;
    println("Selected stroke layer: " + 2);
  } else if (key == '3') {
    currLayer = 2;
    println("Selected stroke layer: " + 3);
  } else if (key == '4') {
    currLayer = 3;
    println("Selected stroke layer: " + 4);
  } else {
    for (var i = 0; i < COLOR_KEYS.length; i++) {
      if (key.toLowerCase() ==  COLOR_KEYS[i]) {
        currColor = STROKE_COLORS[i];
        return;
      }
    } 
  }
  
}
