var ribbonDetail = 0;
var nVertPerStretch = 0;
var nControl = 0;
var lspline = null;
var rspline = null;

var oldX = 0, oldY = 0, oldZ = 0;
var newX = 0, newY = 0, newZ = 0;
var oldVel = 0;
var newVel = 0;
var twist = 0;
var ribbonsWidth = 0;

var pX0 = 0, pY0 = 0;
var pX = 0, pY = 0;

function initRibbons() {
  ribbonDetail = RIBBON_DETAIL;
  nVertPerStretch = 0;
  for (var ui = 1; ui <= 10; ui ++) {
    if (ui % ribbonDetail == 0) {
      nVertPerStretch += 4;
    }
  }    
  lspline = new BSpline(true);
  rspline = new BSpline(true);
  println(lspline);
  ribbonsWidth = 0.7 * RIBBON_WIDTH + 1.3 * RIBBON_WIDTH * Math.random();
}

function addPointToRibbon(x, y) {
  pX = x;
  pY = y;

  if (currGesture.isStarting()) {
    // (x, y) is the first position, so initializing the previous position to this one.
    pX0 = pX;
    pY0 = pY;
    nControl = 0;
    return;
  } 

  // Discarding steps that are too small.
  if (Math.abs(pX - pX0) < MIN_POS_CHANGE && Math.abs(pY - pY0) < MIN_POS_CHANGE) return;
  pX0 = pX;
  pY0 = pY;

  if (nControl == 4) {
    lspline.shiftBSplineCPoints();
    rspline.shiftBSplineCPoints();
  } else {
    // Initializing the first 4 control points
    var p1 = createVector(pX, pY, 0);
    var p0 = createVector(pX0, pY0, 0);
    var p10 = p5.Vector.sub(p0, p1);
    var p_1 = p5.Vector.add(p0, p10); 
    var p_2 = p5.Vector.add(p_1, p10);

    lspline.setCPoint(0, p_2);
    lspline.setCPoint(1, p_1);
    lspline.setCPoint(2, p0);
    lspline.setCPoint(3, p1);

    rspline.setCPoint(0, p_2);
    rspline.setCPoint(1, p_1);
    rspline.setCPoint(2, p0);
    rspline.setCPoint(3, p1);

    newX = pX;
    newY = pY;
    newZ = 0;

    nControl = 4;
  }

//  twist[i] = TWO_PI * cos(TWO_PI * millis() / (1000.0 * twistPeriod[i]) + twistPhase[i]); 
  oldX = newX;
  oldY = newY;
  oldZ = newZ;
  newX = SMOOTH_COEFF * oldX + (1 - SMOOTH_COEFF) * pX;
  newY = SMOOTH_COEFF * oldY + (1 - SMOOTH_COEFF) * pY;
  newZ = 0;

  var dX = newX - oldX;
  var dY = newY - oldY;
  var dZ = newZ - oldZ;

  var nX = +dY;
  var nY = -dX;
  var nZ = 0;    

  var dir = createVector(dX, dY, dZ);
  var nor = createVector(nX, nY, nZ);
  oldVel = newVel;
  var l = dir.mag();  
  newVel = ribbonsWidth / map(l, 0, 100, 1, NORM_FACTOR + 0.1);
  
//  println(tablet.getPressure());
//  newVel = 1 + tablet.getPressure() * NORM_FACTOR;

//  dir.normalize();
//    PMatrix3D rmat = new PMatrix3D();
//    rmat.rotate(twist[i], dir.x, dir.y, dir.z);
//    PVector rnor = rmat.mult(nor, null);

  addControlPoint(lspline, newX, newY, newZ, nor, +newVel);
  addControlPoint(rspline, newX, newY, newZ, nor, -newVel);

  drawRibbonStretch(lspline, rspline);
}

function addControlPoint(spline, newX, newY, newZ, nor, vel) {
  var addCP = true;
  var cp1 = createVector(newX - vel * nor.x, newY - vel * nor.y, newZ - vel * nor.z);
  if (1 < nControl) {
    var cp0 = createVector(0, 0);
    spline.getCPoint(nControl - 2, cp0);
    addCP = MIN_CTRL_CHANGE < cp1.dist(cp0);
  }
  if (addCP) {
    spline.setCPoint(nControl - 1, cp1);
    return true;
  }
  return false;
}

var uTexCoord = 0;
var Sid1Point0 = null;
var Sid1Point1 = null;
var Sid2Point0 = null;
var Sid2Point1 = null;
function drawRibbonStretch(spline1, spline2) {  
  var ti;
  var t;
  var x, y, z;

  if (!Sid1Point0) Sid1Point0 = createVector(0, 0);
  if (!Sid1Point1) Sid1Point1 = createVector(0, 0);
  if (!Sid2Point0) Sid2Point0 = createVector(0, 0);
  if (!Sid2Point1) Sid2Point1 = createVector(0, 0);  

  // The initial geometry is generated.
  spline1.feval(0, Sid1Point1);
  spline2.feval(0, Sid2Point1);

  for (ti = 1; ti <= 10; ti++) {    
    if (ti % ribbonDetail == 0) {
      t = 0.1 * ti;

      // The geometry of the previous iteration is saved.
      Sid1Point0.set(Sid1Point1);
      Sid2Point0.set(Sid2Point1);

      // The new geometry is generated.
      spline1.feval(t, Sid1Point1);
      spline2.feval(t, Sid2Point1);
      
      var quad = new StrokeQuad(millis());
      var r = currColor[0];
      var g = currColor[1];
      var b = currColor[2];
      var a = currAlpha;
      quad.setVertex(0, Sid1Point0.x, Sid1Point0.y, 0, uTexCoord, r, g, b, a);
      quad.setVertex(1, Sid2Point0.x, Sid2Point0.y, 1, uTexCoord, r, g, b, a);
      updateTexCoordU();
      quad.setVertex(2, Sid2Point1.x, Sid2Point1.y, 1, uTexCoord, r, g, b, a);
      quad.setVertex(3, Sid1Point1.x, Sid1Point1.y, 0, uTexCoord, r, g, b, a);
      updateTexCoordU();
      currGesture.addQuad(quad);
    }    
  }
}

function updateTexCoordU() { 
  uTexCoord += TEXCOORDU_INC;
  if (1 < uTexCoord) {
    uTexCoord = 0;
  } 
}