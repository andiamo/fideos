var MAX_BEZIER_ORDER = 10; // Maximum curve order.

var BSplineMatrix = [
  [-1.0/6.0,  1.0/2.0, -1.0/2.0, 1.0/6.0],
  [ 1.0/2.0,     -1.0,  1.0/2.0,     0.0],
  [-1.0/2.0,      0.0,  1.0/2.0,     0.0],
  [ 1.0/6.0,  2.0/3.0,  1.0/6.0,     0.0]
];

// The element(i, n) of this array contains the binomial coefficient
// C(i, n) = n!/(i!(n-i)!)
var BinomialCoefTable = [
  [1, 1, 1, 1,  1,  1,  1,  1,   1,   1],
  [1, 2, 3, 4,  5,  6,  7,  8,   9,  10],
  [0, 1, 3, 6, 10, 15, 21, 28,  36,  45],
  [0, 0, 1, 4, 10, 20, 35, 56,  84, 120],
  [0, 0, 0, 1,  5, 15, 35, 70, 126, 210],
  [0, 0, 0, 0,  1,  6, 21, 56, 126, 252],
  [0, 0, 0, 0,  0,  1,  7, 28,  84, 210],
  [0, 0, 0, 0,  0,  0,  1,  8,  36, 120],
  [0, 0, 0, 0,  0,  0,  0,  1,   9,  45],
  [0, 0, 0, 0,  0,  0,  0,  0,   1,  10],
  [0, 0, 0, 0,  0,  0,  0,  0,   0,   1]
];

// The element of this(i, j) of this table contains(i/10)^(3-j).
var TVectorTable = [  
//   t^3,  t^2, t^1, t^0
  [    0,    0,   0,   1], // t = 0.0
  [0.001, 0.01, 0.1,   1], // t = 0.1
  [0.008, 0.04, 0.2,   1], // t = 0.2
  [0.027, 0.09, 0.3,   1], // t = 0.3
  [0.064, 0.16, 0.4,   1], // t = 0.4
  [0.125, 0.25, 0.5,   1], // t = 0.5
  [0.216, 0.36, 0.6,   1], // t = 0.6
  [0.343, 0.49, 0.7,   1], // t = 0.7
  [0.512, 0.64, 0.8,   1], // u = 0.8
  [0.729, 0.81, 0.9,   1], // t = 0.9
  [    1,    1,   1,   1]  // t = 1.0
];

// The element of this(i, j) of this table contains(3-j)*(i/10)^(2-j) if
// j < 3, 0 otherwise.
var DTVectorTable = [
// 3t^2,  2t^1, t^0
  [   0,     0,   1, 0], // t = 0.0
  [0.03,   0.2,   1, 0], // t = 0.1
  [0.12,   0.4,   1, 0], // t = 0.2
  [0.27,   0.6,   1, 0], // t = 0.3
  [0.48,   0.8,   1, 0], // t = 0.4
  [0.75,   1.0,   1, 0], // t = 0.5
  [1.08,   1.2,   1, 0], // t = 0.6
  [1.47,   1.4,   1, 0], // t = 0.7
  [1.92,   1.6,   1, 0], // t = 0.8
  [2.43,   1.8,   1, 0], // t = 0.9
  [   3,     2,   1, 0]  // t = 1.0
];

function Spline() {
}

// The factorial of n.
Spline.prototype.factorial = function(n) {
  return n <= 0 ? 1 : n * factorial(n - 1); 
}

// Gives n!/(i!(n-i)!).
Spline.prototype.binomialCoef = function(i, n) {
  if ((i <= MAX_BEZIER_ORDER) && (n <= MAX_BEZIER_ORDER)) return BinomialCoefTable[i][n - 1];
  else return int(factorial(n) / (factorial(i) * factorial(n - i)));
}

// Evaluates the Berstein polinomial(i, n) at u.
Spline.prototype.bersteinPol = function(i, n, u) {
  return binomialCoef(i, n) * Math.pow(u, i) * Math.pow(1 - u, n - i);
}

  // The derivative of the Berstein polinomial.
Spline.prototype.dbersteinPol = function(i, n, u) {
  var s1, s2; 
  if (i == 0) s1 = 0; 
  else s1 = i * Math.pow(u, i-1) * Math.pow(1 - u, n - i);
  if (n == i) s2 = 0; 
  else s2 = -(n - i) * Math.pow(u, i) * Math.pow(1 - u, n - i - 1);
  return binomialCoef(i, n) *(s1 + s2);
}

// function BSpline() {
//   Spline.call(this);
//   this.initParameters(true); 
// }

function BSpline(t) {
  Spline.call(this);
  this.initParameters(t); 
}

// Inherit Spline
BSpline.prototype = new Spline();
// Correct the constructor pointer because it points to Spline
BSpline.prototype.constructor = BSpline;

  // Sets lookup table use.
BSpline.prototype.initParameters = function(t) { 
  // Control points.
  this.bsplineCPoints = [[0.0, 0.0, 0.0],
                         [0.0, 0.0, 0.0],
                         [0.0, 0.0, 0.0],
                         [0.0, 0.0, 0.0]];

  // Parameters.
  this.lookup = t;

  // Auxiliary arrays used in the calculations.
  this.M3 = [[0.0, 0.0, 0.0],
             [0.0, 0.0, 0.0],
             [0.0, 0.0, 0.0],
             [0.0, 0.0, 0.0]];

  this.TVector = [0.0, 0.0, 0.0, 0.0]; 
  this.DTVector = [0.0, 0.0, 0.0, 0.0]; 

  // Point and tangent vectors.
  this.pt = [0.0, 0.0, 0.0]; 
  this.tg = [0.0, 0.0, 0.0];
}

// Sets n-th control point.
BSpline.prototype.setCPoint = function(n, P) {
  this.bsplineCPoints[n][0] = P.x;
  this.bsplineCPoints[n][1] = P.y;
  this.bsplineCPoints[n][2] = P.z;        
  this.updateMatrix3();
}

// Gets n-th control point.
BSpline.prototype.getCPoint = function(n, P) {
  P.x = this.bsplineCPoints[n][0];
  P.y = this.bsplineCPoints[n][1];
  P.z = this.bsplineCPoints[n][2];
}

// Replaces the current B-spline control points(0, 1, 2) with(1, 2, 3). This
// is used when a new spline is to be joined to the recently drawn.
BSpline.prototype.shiftBSplineCPoints = function() {
  for (var i = 0; i < 3; i++) {
    this.bsplineCPoints[0][i] = this.bsplineCPoints[1][i];
    this.bsplineCPoints[1][i] = this.bsplineCPoints[2][i];
    this.bsplineCPoints[2][i] = this.bsplineCPoints[3][i];
  }
  this.updateMatrix3();
}

BSpline.prototype.copyCPoints = function(i0, i1) {
  for (var i = 0; i < 3; i++) {
    this.bsplineCPoints[i1][i] = this.bsplineCPoints[i0][i];
  }
}

// Updates the temporal matrix used in order 3 calculations.
BSpline.prototype.updateMatrix3 = function() {
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 3; j++) {
      var sum = 0;
      for (var k = 0; k < 4; k++) sum += BSplineMatrix[i][k] * this.bsplineCPoints[k][j];
      this.M3[i][j] = sum;
    }
  }
}    

BSpline.prototype.feval = function(t, p) { 
  this.evalPoint(t); 
  p.set(this.pt); 
}

BSpline.prototype.deval = function(t, d) { 
  this.evalTangent(t); 
  d.set(tg); 
}

BSpline.prototype.fevalX = function(t) { 
  this.evalPoint(t); 
  return this.pt[0]; 
}

BSpline.prototype.fevalY = function(t) { 
  this.evalPoint(t); 
  return this.pt[1]; 
}

BSpline.prototype.fevalZ = function(t) { 
  evalPoint(t); 
  return this.pt[2]; 
}

BSpline.prototype.devalX = function(t) { 
  this.evalTangent(t); 
  return tg[0]; 
}

BSpline.prototype.devalY = function(t) { 
  this.evalTangent(t); 
  return tg[1]; 
}

BSpline.prototype.devalZ = function(t) { 
  this.evalTangent(t); 
  return tg[2]; 
}

// Point evaluation.
BSpline.prototype.evalPoint = function(t) {
  if (this.lookup) {
    this.bsplinePointI(Math.floor(10 * t));
  } else {
    this.bsplinePoint(t);
  }
}    

  // Tangent evaluation.
BSpline.prototype.evalTangent = function(t) {
  if (this.lookup) {
    this.bsplineTangentI(Math.floor(10 * t));
  } else {
    this.bsplineTangent(t);
  }
}

// Calculates the point on the cubic spline corresponding to the parameter value t in [0, 1].
BSpline.prototype.bsplinePoint = function(t) {
  // Q(u) = UVector * BSplineMatrix * BSplineCPoints
  for (var i = 0; i < 4; i++) {
    this.TVector[i] = pow(t, 3 - i);
  }

  for (var j = 0; j < 3; j++) {
    var s = 0;
    for (var k = 0; k < 4; k++) {
      s += this.TVector[k] * this.M3[k][j];
    }
    this.pt[j] = s;
  }
}

// Calculates the tangent vector of the spline at t.
BSpline.prototype.bsplineTangent = function(t) {
  // Q(u) = DTVector * BSplineMatrix * BSplineCPoints
  for (var i = 0; i < 4; i++) {
    if (i < 3) {
      this.DTVector[i] = (3 - i) * Math.pow(t, 2 - i);
    } else {
      this.DTVector[i] = 0;
    }
  }

  for (var j = 0; j < 3; j++) {
    var s = 0;
    for (var k = 0; k < 4; k++) {
      s += this.DTVector[k] * this.M3[k][j];
    }
    this.tg[j] = s;
  }
}

// Gives the point on the cubic spline corresponding to t/10(using the lookup table).
BSpline.prototype.bsplinePointI = function(t) {
  // Q(u) = TVectorTable[u] * BSplineMatrix * BSplineCPoints
  for (var j = 0; j < 3; j++) {
    var s = 0;
    for (var k = 0; k < 4; k++) {
      s += TVectorTable[t][k] * this.M3[k][j];
    }
    this.pt[j] = s;
  }
}

// Calulates the tangent vector of the spline at t/10.
BSpline.prototype.bsplineTangentI = function(t) {
  // Q(u) = DTVectorTable[u] * BSplineMatrix * BSplineCPoints
  for (var j = 0; j < 3; j++) {
    var s = 0;
    for (var k = 0; k < 4; k++) {
      s += DTVectorTable[t][k] * this.M3[k][j];
    }
    this.tg[j] = s;
  }
}    

