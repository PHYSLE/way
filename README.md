# Way
Wayfinding with A* in JS

```
var grid = new Grid(5, 5);

for(var x=0; x < grid.width; x++) {
  for(var y=0; y < grid.height; y++) {
    var bias = (y == 3 && x < 4 ? 0 : 1);
    var cell = new Cell(x, y, bias);

    grid.setCell(cell);
  }
}

var start = grid.getCell(0, 0);
var goal = grid.getCell(0, 4);
var way = grid.findWay(start, goal);

console.log(JSON.stringify(way));

```

## Reference

### Cell

#### Constructor

**new Cell (x, y, bias)**

x, y are the coordinates on the Grid

bias is a number which determines the "walkability" of the cell
* 0 = not walkable
* 1 = walkable with no weight
* 2 or more = the wayfinding algorithm will favor this cell by the amount above 1

#### Object members

**cell.x**
The x position of the cell

**cell.y**
The y position of the cell

**cell.bias**
The bias for the cell

**cell.parent**
The cell's parent cell or null

**cell.wayCost()**
Returns the cost of this cell after calling grid.findWay


### Grid

#### Constructor

**new Grid (width, height)**

width and height sets the size of the grid

#### Object members

**grid.width**
The width of the grid

**grid.height**
The height of the grid

**grid.count**
The number of cells currently set in the grid

**grid.cells**
A two dimensional array which stores the cells

**grid.getCell(x, y)**
Returns the cell at the x, y coordinates or undefined if there is no cell found

**grid.setCell(cell)**
Adds or overwrites the cell at the cell.x, cell.y coordinates on the grid

**grid.removeCell(x, y)**
Removes the cell at the x, y coordinates or undefined if there is no cell found

**grid.eachCell(fn)**
Will call the function fn(cell) on each cell in the grid

**grid.waysFromCell(cell, diagonal)**
Returns an array of a cell's neighboring cells which have a bias greater than zero [^1]

**grid.findWay(start, end, diagonal = false, heuristic = undefined)**
Returns the path from the start cell to the end cell [^1]


[^1]: diagonal is a bool which if set to true will return cells in the 4 diagonal directions as well as the 4 cardinal directions
