function StrokeQuad(t) {
  this.t = t;
  this.x = [0, 0, 0, 0];
  this.y = [0, 0, 0, 0];
  this.u = [0, 0, 0, 0];
  this.v = [0, 0, 0, 0];
  this.r = [0, 0, 0, 0];
  this.g = [0, 0, 0, 0];
  this.b = [0, 0, 0, 0];
  this.a = [0, 0, 0, 0];
  this.a0 = [0, 0, 0, 0];
  this.visible = true;
}

StrokeQuad.prototype.setVertex = function(i, x, y, u, v, r, g, b, a) {
  this.x[i] = x;
  this.y[i] = y;

  this.u[i] = u;
  this.v[i] = v;

  this.r[i] = r;
  this.g[i] = g;
  this.b[i] = b;
  this.a[i] = a;

  this.a0[i] = a;
}

StrokeQuad.prototype.restoreAlpha = function () {
  for (var i = 0; i < 4; i++) {
    this.a[i] = this.a0[i];
  }
}

StrokeQuad.prototype.update = function(ff, all) {
  this.visible = false;
  for (var i = 0; i < 4; i++) {
    this.a[i] *= ff;
    if (INVISIBLE_ALPHA < this.a[i]) {
      this.visible = true;
    } else {
      this.a[i] = 0;
    }
  }
}

/*
// separate quads 
StrokeQuad.prototype.draw = function(ascale) {
  if (this.visible) {
    beginShape(QUADS);
    for (var i = 0; i < 4; i++) {
      noStroke();
      fill(this.r[i], this.g[i], this.b[i], this.a[i] * ascale);
      vertex(this.x[i], this.y[i]);
    }
    endShape(CLOSE);
  }
}
*/

// quad strip
StrokeQuad.prototype.draw = function(ascale) {
  if (this.visible) {
    for (var i = 2; i < 4; i++) {
      fill(this.r[i], this.g[i], this.b[i], this.a[i] * ascale);
      vertex(this.x[i], this.y[i]);
    }
  }
}

function StrokeGesture(t0, dissapearing, fixed, prev, layer) {
  this.prev = prev;
  this.next = null;
  this.quads = [];

  this.t0 = t0;
  this.t1 = t0;
  this.lastUpdate = t0;

  this.looping = false;
  this.fadeOutFact = 1;
  this.fadeOutFact0 = 1;
  this.alphaScale = 1;

  this.starting = true;
  this.visible = true;
  this.loopTime = -1;
  this.qcount = 0;

  this.dissapearing = dissapearing;
  this.fixed = fixed;

  this.layer = layer;
}

StrokeGesture.prototype.clear = function() {
  this.quads = [];
}

StrokeGesture.prototype.isStarting = function() {
  if (this.starting) {
    this.starting = false;
    return true;
  } else {
    return false;
  }
}

StrokeGesture.prototype.getAlphaScale = function() {
  return this.alphaScale;
}

StrokeGesture.prototype.setAlphaScale = function(s) {
  this.alphaScale = s;
}

StrokeGesture.prototype.isVisible = function() {
  return this.visible;
}

StrokeGesture.prototype.isLooping = function() {
  return this.looping;
}

StrokeGesture.prototype.setLooping = function(loop) {
  this.looping = loop;
}

StrokeGesture.prototype.setEndTime = function(t1) {
  this.t1 = t1;
  if (this.fixed) {
    this.fadeOutFact = 1;
  } else {
    var millisPerFrame =  1000.0 / frameRate();
    var dt = this.t1 - this.t0;
    var nframes = Math.floor(LOOP_MULTIPLIER * dt / millisPerFrame);
    this.fadeOutFact = Math.exp(Math.log(INVISIBLE_ALPHA / 255.0) / nframes);
    this.fadeOutFact0 = this.fadeOutFact;
  }
}

StrokeGesture.prototype.addQuad = function(quad) {
  this.quads.push(quad);
}

StrokeGesture.prototype.update = function(t) {
  this.visible = false;
  this.qcount = 0;
  for (var i = 0; i < this.quads.length; i++) {
    var quad = this.quads[i]
    if (this.loopTime == -1 || quad.t - this.t0 <= this.loopTime) {
      quad.update(this.fadeOutFact, this.qcount >= this.quads.length);
      this.qcount++;
      if (quad.visible) {
        this.visible = true;
      }
    }
  }

  if (this.looping) {
    if (-1 < this.loopTime) {
      this.loopTime += t - this.lastUpdate;
    }
    if (this.isDrawn()) {
      // start/restart loop.
      if (!this.dissapearing) this.fadeOutFact = 1;
      for (var i = 0; i < this.quads.length; i++) {
        var quad = this.quads[i]
        quad.restoreAlpha();
      }
      this.loopTime = 0;
    }
    if (this.t1 - this.t0 < this.loopTime) {
      this.fadeOutFact = this.fadeOutFact0;
    }
  }

  this.lastUpdate = t;
}

StrokeGesture.prototype.isDrawn = function() {
  return 0 < this.qcount && !this.visible && (!this.next || this.next.isDrawn());
}

/*
// Separate quads
StrokeGesture.prototype.draw = function() {
  if (this.visible) {
    // if (USE_TEXTURES) {
    //   pg.texture(textures.get(tex));
    // }
    for (var i = 0; i < this.quads.length; i++) {
      var quad = this.quads[i]
      if (this.loopTime == -1 || quad.t - this.t0 <= this.loopTime) {
        quad.draw(this.alphaScale);
      }
    }
  }
}
*/

/*
// quad strip
StrokeGesture.prototype.draw = function() {
  if (this.visible && 0 < this.quads.length) {
    beginShape(QUAD_STRIP);    
    noStroke();
    for (var i = 0; i < this.quads.length; i++) {
      var quad = this.quads[i]
      if (this.loopTime == -1 || quad.t - this.t0 <= this.loopTime) {
        quad.draw(this.alphaScale);
      }
    }
    endShape();
  }
}
*/

StrokeGesture.prototype.draw = function() {
  if (this.visible && 0 < this.quads.length) {
    var ascale = this.alphaScale;
    var i = 0;
    var inc = 1;
    ctx.beginPath();
    var quad0 = this.quads[0];
    var c0 = color(quad0.r[0], quad0.g[0], quad0.b[0], quad0.a[0] * ascale);
    ctx.fillStyle = c0.toString();
    ctx.moveTo(quad0.x[0], quad0.y[0]);
    while (true) {
      i += inc;
      var quad = this.quads[i];
      if (0 < inc) {
        var c2 = color(quad.r[2], quad.g[2], quad.b[2], quad.a[2] * ascale);
        ctx.fillStyle = c2.toString();
        ctx.lineTo(quad.x[2], quad.y[2]);
      }
      if ((i == this.quads.length - 1) ||
          !(this.loopTime == -1 || quad.t - this.t0 <= this.loopTime)) {
        inc = -1;
      }
      if (inc < 0) {
        var c3 = color(quad.r[3], quad.g[3], quad.b[3], quad.a[3] * ascale);
        ctx.fillStyle = c3.toString();
        ctx.lineTo(quad.x[3], quad.y[3]);
      }
      if (i == 0) {
        break;
      }
    } 
    ctx.closePath();
    ctx.fill();
  }
}
