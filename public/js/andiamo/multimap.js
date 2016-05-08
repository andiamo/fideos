/**
 * Simple hash map class.
 * From http://dailyjs.com/2012/09/24/linkedhashmap/
 */ 
var MultiMap = function() {
  this._size = 0;
  this._map = {};
};

MultiMap.prototype = {

  /**
   * Puts the key/value pair into the map, overwriting
   * any existing entry.
   */
   put: function(key, value) {
    if (!this.containsKey(key)) {
      this._map[key] = []
      this._size++;
    }
    this._map[key].push(value);
  },
  
  /**
   * Removes the entry associated with the key
   * and returns the removed value.
   */
   remove: function(key) {
    if (this.containsKey(key)) {
      this._size--;
      var value = this._map[key];
      delete this._map[key];
      return value;
    } else {
      return null;
    }
  },
  
  /**
   * Checks if this map contains the given key.
   */
   containsKey: function(key) {
    return this._map.hasOwnProperty(key);
  },
  
  /**
   * Checks if this map contains the given value.
   * Note that values are not required to be unique.
   */
   containsValue: function(value) {
    for (var key in this._map) {
      if (this._map.hasOwnProperty(key)) {
        for (var idx in this._map[key]) {
          if (this._map[key][idx] === value) {
            return true;
          }
        }
      }
    }

    return false;
  },
  
  /**
   * Returns the value associated with the given key.
   */
   get: function(key) {
    return this.containsKey(key) ? this._map[key] : null;
  },
  
  /**
   * Clears all entries from the map.
   */
   clear: function() {
    this._size = 0;
    this._map = {};
  },
  
  /**
   * Returns an array of all keys in the map.
   */
   keys: function() {
    var keys = [];
    for (var key in this._map) {
      if (this._map.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  },
  
  /**
   * Returns an array of all values in the map.
   */
   values: function() {
    var values = [];
    for (var key in this._map) {
      if (this._map.hasOwnProperty(key)) {
        for (var idx in this._map[key]) {
          values.push(this._map[key][idx]);
        }
      }
    }
    return values;
  },
  
  /**
   * Returns the size of the map, which is
   * the number of keys.
   */
   size: function() {
    return this._size;
  }
};