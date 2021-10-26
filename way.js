function Cell (x, y, bias, parent = null) {
  this.x = x;
  this.y = y;
  //this.f = 0;
  //this.g = 0;
  this.bias = bias;
  this.parent = parent;
  this.wayCost = function(start, end) {
    //distance from start
    var g = Math.abs(this.x - start.x) + Math.abs(this.y - start.y);
    //distance from end
    var h = Math.abs(this.x - end.x) + Math.abs(this.y - end.y);
    // @todo - add bias
    return g + h - this.bias;
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

  this.waysFromCell = function(c) {
    var a = [];
    if (c.x - 1 >= 0) {
      var left = this.getCell(c.x - 1, c.y);
      if (left && left.bias > 0) {
        a.push(left);
      }
    }

    if (c.x + 1 < this.width) {
      var right = this.getCell(c.x + 1, c.y);
      if (right && right.bias > 0) {
        a.push(right);
      }
    }
    if (c.y - 1 >= 0) {
      var up = this.getCell(c.x, c.y - 1);
      if (up && up.bias > 0) {
        a.push(up);
      }
    }
    if (c.y + 1 < this.height) {
      var down = this.getCell(c.x, c.y + 1);
      if (down && down.bias > 0) {
        a.push(down);
      }
    }
    return a;
  }
  this.findBestInArray = function(cells, start, end) {
    // This operation can occur in O(1) time if open is a min-heap or a priority queue
    var best = null;
    for (var i = 0; i < cells.length; i++) {
      if (!best || cells[i].wayCost(start, end) < best.wayCost(start, end)) {
        best = cells[i];
      }
    }
    return best;
  }
  this.findCellInArray = function(cells, x, y) {
    for(var i=0; i<cells.length; i++) {
      if (cells[i].y == y && cells[i].x == x) {
        return true;
      }
    }
    return false;
  }
  this.removeCellInArray = function(cells, x, y) {
    for(var i=0; i<cells.length; i++) {
      if (cells[i].y == y && cells[i].x == x) {
        cells.splice(i,1);
        return true;
      }
    }
    return false;
  }
  this.findWay = function(start, end) {
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
      var current = this.findBestInArray(open, start, end);

      if (current == end) {
        console.log('Found in ' + runs)
        var c = current;
        var way = [];
        while(c) {
          way.unshift({x:c.x, y:c.y});
          c = c.parent;
        }
        this.locked = false;
        return way;
      }
      var ways = this.waysFromCell(current);

      for (var i = 0; i < ways.length; i++) {
        var w = ways[i];
        if (!this.findCellInArray(closed, w.x, w.y)) {
          if (!w.parent || current.wayCost(start, end) < w.parent.wayCost(start, end)) {
            // This way is better than the previous one
            w.parent = current;
          }
          if (!this.findCellInArray(open, w.x, w.y)) {
            open.push(w);
          }
        }
      }
      this.removeCellInArray(open, current.x, current.y);
      if (!this.findCellInArray(closed, current.x, current.y)) {
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


  /*
  //https://pavcreations.com/tilemap-based-a-star-algorithm-implementation-in-unity-game/
  //http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html

  OPEN_LIST
  CLOSED_LIST
  ADD start_cell to OPEN_LIST

  LOOP
      current_cell = cell in OPEN_LIST with the lowest F_COST
      REMOVE current_cell from OPEN_LIST
      ADD current_cell to CLOSED_LIST

  IF current_cell is finish_cell
      RETURN

  FOR EACH adjacent_cell to current_cell
      IF adjacent_cell is unwalkable OR adjacent_cell is in CLOSED_LIST
          SKIP to the next adjacent_cell

      IF new_path to adjacent_cell is shorter OR adjacent_cell is not in OPEN_LIST
          SET F_COST of adjacent_cell
          SET parent of adjacent_cell to current_cell
          IF adjacent_cell is not in OPEN_LIST
              ADD adjacent_cell to OPEN_LIST
              */
}
