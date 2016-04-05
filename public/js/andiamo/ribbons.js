function Ribbon() {
  this.ribbonDetail = 0;
  this.nVertPerStretch = 0;
  this.nControl = 0;
  this.lspline = null;
  this.rspline = null;

  this.oldX = 0,
  this.oldY = 0,
  this.oldZ = 0;

  this.newX = 0;
  this.newY = 0;
  this.newZ = 0;

  this.oldVel = 0;
  this.newVel = 0;
  this.twist = 0;
  this.ribbonsWidth = 0;

  this.pX0 = 0;
  this.pY0 = 0;

  this.pX = 0;
  this.pY = 0;

  this.uTexCoord = 0;
  this.Sid1Point0 = null;
  this.Sid1Point1 = null;
  this.Sid2Point0 = null;
  this.Sid2Point1 = null;
}

Ribbon.prototype.init = function(p_ribbon_width) {
  this.ribbonDetail = RIBBON_DETAIL;
  this.nVertPerStretch = 0;
  for (var ui = 1; ui <= 10; ui ++) {
    if (ui % this.ribbonDetail == 0) {
      this.nVertPerStretch += 4;
    }
  }
  console.log("Iniciado con: "+ p_ribbon_width);
  this.lspline = new BSpline(true);
  this.rspline = new BSpline(true);
  // println(this.lspline);
  this.ribbonsWidth = 0.7 * p_ribbon_width + 1.3 * p_ribbon_width * Math.random();
}

Ribbon.prototype.addPoint = function(gesture, col, alp, x, y) {
  this.pX = x;
  this.pY = y;

  if (gesture.isStarting()) {
    // (x, y) is the first position, so initializing the previous position to this one.
    this.pX0 = this.pX;
    this.pY0 = this.pY;
    this.nControl = 0;
    return;
  }

  // Discarding steps that are too small.
  if (Math.abs(this.pX - this.pX0) < MIN_POS_CHANGE &&
      Math.abs(this.pY - this.pY0) < MIN_POS_CHANGE) return;
  this.pX0 = this.pX;
  this.pY0 = this.pY;

  if (this.nControl == 4) {
    this.lspline.shiftBSplineCPoints();
    this.rspline.shiftBSplineCPoints();
  } else {
    // Initializing the first 4 control points
    var p1 = createVector(this.pX, this.pY, 0);
    var p0 = createVector(this.pX0, this.pY0, 0);
    var p10 = p5.Vector.sub(p0, p1);
    var p_1 = p5.Vector.add(p0, p10);
    var p_2 = p5.Vector.add(p_1, p10);

    this.lspline.setCPoint(0, p_2);
    this.lspline.setCPoint(1, p_1);
    this.lspline.setCPoint(2, p0);
    this.lspline.setCPoint(3, p1);

    this.rspline.setCPoint(0, p_2);
    this.rspline.setCPoint(1, p_1);
    this.rspline.setCPoint(2, p0);
    this.rspline.setCPoint(3, p1);

    this.newX = this.pX;
    this.newY = this.pY;
    this.newZ = 0;

    this.nControl = 4;
  }

//  twist[i] = TWO_PI * cos(TWO_PI * millis() / (1000.0 * twistPeriod[i]) + twistPhase[i]);
  this.oldX = this.newX;
  this.oldY = this.newY;
  this.oldZ = this.newZ;
  this.newX = SMOOTH_COEFF * this.oldX + (1 - SMOOTH_COEFF) * this.pX;
  this.newY = SMOOTH_COEFF * this.oldY + (1 - SMOOTH_COEFF) * this.pY;
  this.newZ = 0;

  var dX = this.newX - this.oldX;
  var dY = this.newY - this.oldY;
  var dZ = this.newZ - this.oldZ;

  var nX = +dY;
  var nY = -dX;
  var nZ = 0;

  var dir = createVector(dX, dY, dZ);
  var nor = createVector(nX, nY, nZ);
  this.oldVel = this.newVel;
  var l = dir.mag();
  this.newVel = this.ribbonsWidth / map(l, 0, 100, 1, NORM_FACTOR + 0.1);

//  println(tablet.getPressure());
//  newVel = 1 + tablet.getPressure() * NORM_FACTOR;

//  dir.normalize();
//    PMatrix3D rmat = new PMatrix3D();
//    rmat.rotate(twist[i], dir.x, dir.y, dir.z);
//    PVector rnor = rmat.mult(nor, null);

  this.addControlPoint(this.lspline, this.newX, this.newY, this.newZ, nor, +this.newVel);
  this.addControlPoint(this.rspline, this.newX, this.newY, this.newZ, nor, -this.newVel);

  this.drawRibbonStretch(gesture, col, alp, this.lspline, this.rspline);
}

Ribbon.prototype.addControlPoint = function(spline, newX, newY, newZ, nor, vel) {
  var addCP = true;
  var cp1 = createVector(newX - vel * nor.x, newY - vel * nor.y, newZ - vel * nor.z);
  if (1 < this.nControl) {
    var cp0 = createVector(0, 0);
    spline.getCPoint(this.nControl - 2, cp0);
    addCP = MIN_CTRL_CHANGE < cp1.dist(cp0);
  }
  if (addCP) {
    spline.setCPoint(this.nControl - 1, cp1);
    return true;
  }
  return false;
}

Ribbon.prototype.drawRibbonStretch = function(gesture, col, alp, spline1, spline2) {
  var ti;
  var t;
  var x, y, z;

  if (!this.Sid1Point0) this.Sid1Point0 = createVector(0, 0);
  if (!this.Sid1Point1) this.Sid1Point1 = createVector(0, 0);
  if (!this.Sid2Point0) this.Sid2Point0 = createVector(0, 0);
  if (!this.Sid2Point1) this.Sid2Point1 = createVector(0, 0);

  // The initial geometry is generated.
  spline1.feval(0, this.Sid1Point1);
  spline2.feval(0, this.Sid2Point1);

  for (ti = 1; ti <= 10; ti++) {
    if (ti % this.ribbonDetail == 0) {
      t = 0.1 * ti;

      // The geometry of the previous iteration is saved.
      this.Sid1Point0.set(this.Sid1Point1);
      this.Sid2Point0.set(this.Sid2Point1);

      // The new geometry is generated.
      spline1.feval(t, this.Sid1Point1);
      spline2.feval(t, this.Sid2Point1);

      var quad = new StrokeQuad(millis());
      var r = col[0];
      var g = col[1];
      var b = col[2];
      var a = alp;
      quad.setVertex(0, this.Sid1Point0.x, this.Sid1Point0.y, 0, this.uTexCoord, r, g, b, a);
      quad.setVertex(1, this.Sid2Point0.x, this.Sid2Point0.y, 1, this.uTexCoord, r, g, b, a);
      this.updateTexCoordU();
      quad.setVertex(2, this.Sid2Point1.x, this.Sid2Point1.y, 1, this.uTexCoord, r, g, b, a);
      quad.setVertex(3, this.Sid1Point1.x, this.Sid1Point1.y, 0, this.uTexCoord, r, g, b, a);
      this.updateTexCoordU();
      gesture.addQuad(quad);
    }
  }
}

Ribbon.prototype.updateTexCoordU = function() {
  this.uTexCoord += TEXCOORDU_INC;
  if (1 < this.uTexCoord) {
    this.uTexCoord = 0;
  }
}
