/* Way.js (c) PHYSLE 2021 */

function Cell (x, y, bias) {
  this.x = x;
  this.y = y;
  this.bias = bias;
  this.parent = null;
  this.g = 0;
  this.h = 0;
  this.wayCost = function() {
    return this.g + this.h - this.bias + 1;
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
        if (way) {
          ways.push(way);
        }
      }
    }

    return ways;
  }

  this.findWay = function(start, end, diagonal = false, heuristic = undefined) {
    var open = [];
    var closed = [];

    if (!heuristic) {
      heuristic = function(self, goal) {
        return Math.abs(self.x - goal.x) + Math.abs(self.y - goal.y);
      }
    }

    this.eachCell(function(c) {
      c.parent = null;
      c.g = 0;
      c.h = heuristic(c, end);
    });

    open.push(start);
    var runs = 0;
    while (open.length > 0) {
      // we're keeping open sorted by wayCost so the best option should be at [0]
      var current = open[0];

      if (current == end) {
        console.debug('Found in ' + runs + ' ' + open.length + ' open ' + closed.length + ' closed')
        var c = current;
        var way = [];
        while(c) {
          way.unshift(c);
          c = c.parent;
        }
        this.locked = false;
        return way;
      }
      var ways = this.waysFromCell(current, diagonal);

      for (var i = 0; i < ways.length; i++) {
        if (ways[i].bias < 1) {
          continue;
        }
        var w = ways[i];
        // if this way is not on the closed list
        if (closed.indexOf(w) == -1) {
          // add w to the open list if it is not already there
          if (open.indexOf(w) == -1) {
            w.parent = current;
            w.g = current.g + 1;
            open.push(w);
          }
          // if it is on the open list check to see if this way is better
          else if (!w.parent || current.wayCost(start, end) < w.parent.wayCost(start, end)) {
            // this way is better than the previous one
            w.parent = current;
            w.g = current.g + 1;
          }

        }
      }

      // sort open by wayCost
      open.sort(function(a,b) {
        return a.wayCost() - b.wayCost();
      });

      // remove currnet from open
      var index = open.indexOf(current);

      open.splice(index, 1);
      // add current to the open list if it is not already there
      if (closed.indexOf(current) == -1) {
        closed.push(current);
      }

      if (runs > this.width * this.height) {
        this.locked = false;
        console.debug('Too Long!')
        return null;
      }
      runs++;
    }
    console.debug('Blocked')
    return null;

  }
}


/* references
https://pavcreations.com/tilemap-based-a-star-algorithm-implementation-in-unity-game/
http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html
https://medium.com/@nicholas.w.swift/easy-a-star-pathfinding-7e6689c7f7b2
*/
