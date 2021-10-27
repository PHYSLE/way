function Cell (x, y, bias, parent = null) {
  this.x = x;
  this.y = y;
  this.bias = bias;
  this.parent = parent;

  this.wayCost = function(start, end) {
    // distance from start
    var g = 1;
    var c = this;
    while(c) {
      c=c.parent;
      g++
    }

    // distance from end
    var h = Math.abs(this.x - end.x) + Math.abs(this.y - end.y);
    // bias
    return g + h - this.bias + 1;
  }
}

function Grid (width, height) {
  this.locked = false;
  this.width = width;
  this.height = height;
  this.count = 0;
  this.cells = new Array(height);
  for (var i = 0; i < this.cells.length; i++) {
    this.cells[i] = new Array(width);
  }

  this.getCell = function(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return undefined;
    }
    return this.cells[y][x];
  };

  this.setCell = function(cell) {
    if (cell.x < 0 || cell.y < 0 || cell.x >= this.width || cell.y >= this.height) {
      throw 'Vector out of bounds';
    }
    // if there was no cell defined here increment count
    if (!this.cells[cell.y][cell.x]) {
      this.count++;
    }
    this.cells[cell.y][cell.x] = cell;
  }

  this.removeCell = function(x, y) {
    // if there was a cell defined here decrement count
    if (this.cells[y][x]) {
      this.count--;
    }
    this.cells[y][x] = undefined;
  }

  this.eachCell = function(fn) {
    for(var y=0; y < this.height; y++) {
      for(var x=0; x < this.width; x++) {
        if (this.cells[y][x]) {
          fn(this.cells[y][x]);
        }
      }
    }
  }

  this.waysFromCell = function(cell, diagonal) {
    var ways = [];

    for (var degree = 0; degree <360; degree += diagonal ? 45 : 90 ) {
      var v = {
        x: Math.round(1 * Math.cos(degree * Math.PI / 180) + cell.x),
        y: Math.round(1 * Math.sin(degree * Math.PI / 180) + cell.y)
      }
      if (v.x >= 0 && v.y >= 0 && v.x < this.width && v.y < this.height) {
        var way = this.getCell(v.x, v.y);
        if (way && way.bias > 0) {
          ways.push(way);
        }
      }
    }

    return ways;
  }

  this.findBest = function(array, start, end) {
    // This operation can occur in O(1) time if open is a min-heap or a priority queue
    var best = null;
    for (var i = 0; i < array.length; i++) {
      if (!best || array[i].wayCost(start, end) < best.wayCost(start, end)) {
        best = array[i];
      }
    }
    return best;
  }


  this.findWay = function(start, end, diagonal) {
    if (this.locked) {
      return null;
    }

    this.locked = true;
    var open = [];
    var closed = [];

    this.eachCell(function(c) {
      c.parent = null;
    });

    open.push(start);
    var runs = 0;
    while (open.length > 0) {
      var current = this.findBest(open, start, end);

      if (current == end) {
        console.log('Found in ' + runs + ' ' + open.length + ' open ' + closed.length + ' closed')
        var c = current;
        var way = [];
        while(c) {
          //way.unshift({x:c.x, y:c.y});
          way.unshift(c);
          c = c.parent;
        }
        this.locked = false;
        return way;
      }
      var ways = this.waysFromCell(current, diagonal);

      for (var i = 0; i < ways.length; i++) {
        var w = ways[i];
        // if this way is not on the closed list
        if (closed.indexOf(w) == -1) {
          // add w to the open list if it is not already there
          if (open.indexOf(w) == -1) {
            w.parent = current;
            open.push(w);
          }
          // if it is on the open list check to see if this way is better
          else if (!w.parent || current.wayCost(start, end) < w.parent.wayCost(start, end)) {
            // this way is better than the previous one
            w.parent = current;
          }

        }
      }
      // remove currnet from open
      var index = open.indexOf(current);

      open.splice(index, 1);
      // add current to the open list if it is not already there
      if (closed.indexOf(current) == -1) {
        console.log('push to closed')
        closed.push(current);
      }

      if (runs > this.width * this.height) {
        this.locked = false;
        console.log('Too Long!')
        return null;
      }
      runs++;
    }
    console.log('Blocked')
    this.locked = false;
    return null;

  }
}


/* references
https://pavcreations.com/tilemap-based-a-star-algorithm-implementation-in-unity-game/
http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
https://medium.com/@nicholas.w.swift/easy-a-star-pathfinding-7e6689c7f7b2
*/
