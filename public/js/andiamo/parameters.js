var RIBBON_WIDTH = 0.8; // Average ribbon width
var SMOOTH_COEFF = 0.7; // Smoothing coefficient used to ease the jumps in the tracking data.
var RIBBON_DETAIL = 5;
var MIN_POS_CHANGE = 2;
var NORM_FACTOR = 5;  // This factor allows to normalize ribbon width with respect to the speed of the 
                      // drawing, so that all ribbons have approximately same width.
var MIN_CTRL_CHANGE = 5;
var TEXCOORDU_INC = 0.1;

var LOOPING_AT_INIT = true;       // Looping on/off when the program starts
var DISSAPEARING_AT_INIT = false; // Dissapearing stroke (while drawing) on/off when the program starts
var FIXED_STROKE_AT_INIT = false; // The strokes don't fade out if true.

var INVISIBLE_ALPHA = 1;    // Alpha at which a stroke is considered invisible
var MAX_GROUP_TIME = 5;     // Maximum between two consecutive strokes to be considered within the same loop
var LOOP_MULTIPLIER = 1;    // How many times slower the loop is with respect to the original stroke
var DELETE_FACTOR = 0.9;


var STROKE_COLORS = [
  [255, 255, 255], // white
  [200, 40, 40],   // red
  [40, 200, 90],   // green
  [97, 101, 196],  // blue
  [224, 165, 75],  // orange
  [154, 75, 224],  // violet
  [240, 233, 92],  // yellow
  [92, 199, 244],  // light blue
  [65, 221, 237],  // aqua
  [0, 0, 0]        // black  
];

var COLOR_KEYS = [
  'q',
  'w',
  'e',
  'r',    
  't',
  'y',
  'u',
  'i',
  'o',
  'p'  
];