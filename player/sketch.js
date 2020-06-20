
/*
  The block class tracks an individual square
  x and y are the position (starting at zero)
  value is the correct number for that square
  entered is the number the user entered
  status is for highlighting.
    0 is white
    1 is green
    2 is red
*/
class Block {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.entered = "";
    this.status = 0;
  }
}

/*
  The group class tracks a collection of blocks
  operation is a string containing the operation to perform
    +, -, x, ÷, or "" (empty)
  value is the end result of the operation
  blocks is an array of block objects that have to operation performed
    in order to get the value as a result
*/
class Group {
  constructor(value, operation, ...blocks) {
    this.value = value;
    this.operation = operation;
    this.blocks = blocks;
  }

}

/*
  The ken class defines our game object
  It takes an array of group objects as an arguement when it's created
  currentPosition track the block you're working in (yellow)
  scaleFactor is just so it doesn't take up the whole canvas
  size is the square root of the number of blocks
  grid is a 2D array that stores pointers to each block
    this lets you consider the game board as a cartesian grid instead
    of the operation groups
*/
class Ken {
  constructor(groups) {
    this.groups = groups;
    this.currentPosition = {
      x: 0,
      y: 0
    }
    this.scaleFactor = 0.9;
    
    /*Loop through and assign a "groupNumber" to each group object and each block
      The group number is the index value of the group in the groups array
    */
    for (let i in this.groups) {
      this.groups[i].groupNumber = parseInt(i);
      for (let j in this.groups[i].blocks) {
        this.groups[i].blocks[j].groupNumber = parseInt(i);
      }
    }
    this.getSize();
    this.getGrid();
  }

  //This is the main game function
  display() {
    //Get the scaleFactor
    let s = this.scaleFactor;
    //Calculate the width and height of each block
    let w = (width * s) / this.size;
    let h = (height * s) / this.size;
    //Check if the grid is filled
    let isFilled = this.isFull();

    //Loop through the groups array and display each block
    for (let i in this.groups) {
      let group = this.groups[i];
      for (let j in group.blocks) {
        let block = group.blocks[j];
        push();
        rectMode(CENTER);
        stroke(150);
        //Set the position of each block
        translate(w / 2 + (width - w * this.size) / 2 + block.x * w, h / 2 + (height - h * this.size) / 2 + block.y * h);
        
        //Set the fill color for each block
        if (this.currentPosition.x == block.x && this.currentPosition.y == block.y) {
          fill(255, 255, 200);
        } else if (isFilled && block.status == 1) {
          fill(200, 255, 200);
        } else if (block.status == 2) {
          fill(255, 200, 200);
        } else {
          fill(255);
        }
        rect(0, 0, w, h);
        
        //Display the user entered number
        textAlign(CENTER, CENTER);
        textSize(height / 11.11111);
        fill(0);
        text(block.entered, 0, 0);
        let groupNum = this.grid[block.y][block.x].groupNumber
        
        //Display the thicker lines around each group
        strokeWeight(5);
        stroke(0);
        //Check the top of each block
        if (block.y == 0 || groupNum != this.grid[block.y - 1][block.x].groupNumber) {
          line(0 - w / 2, 0 - h / 2, 0 + w / 2, 0 - h / 2);
        }
        //Check the bottom of each block
        if (block.y == this.size - 1 || groupNum != this.grid[block.y + 1][block.x].groupNumber) {
          line(0 - w / 2, 0 + h / 2, 0 + w / 2, 0 + h / 2);
        }
        //Check the left of each block
        if (block.x == 0 || groupNum != this.grid[block.y][block.x - 1].groupNumber) {
          line(0 - w / 2, 0 - h / 2, 0 - w / 2, 0 + h / 2);
        }
        //Check the right of each block
        if (block.x == this.size - 1 || groupNum != this.grid[block.y][block.x + 1].groupNumber) {
          line(0 + w / 2, 0 - h / 2, 0 + w / 2, 0 + h / 2);
        }
        pop();
      }
    }

    /*
      Display the group operation and target value
      Loops through the grid and displays the info in the
        top-most then left-most block of each group
      Tracks entered groups in the displayedOperations object
        to prevent duplicate displays
    */
    let displayedOperations = {}
    for (let y in this.grid) {
      let row = this.grid[y];
      for (let x in row) {
        let block = row[x];
        if (displayedOperations[block.groupNumber] == null) {
          push();
          translate(w / 2 + (width - w * this.size) / 2 + x * w, h / 2 + (height - h * this.size) / 2 + y * h);
          fill(0);
          noStroke();
          textAlign(LEFT, CENTER);
          textSize(height / 20);
          let dispText = this.groups[block.groupNumber].value + this.groups[block.groupNumber].operation;
          text(dispText, 0 - w * 0.41, 0 - h * 0.3);
          displayedOperations[block.groupNumber] = dispText;
          pop();
        }
      }
    }
  }

  //Get the size of the grid (square root of the number of blocks)
  getSize() {
    let count = 0;
    for (let i in this.groups) {
      let group = this.groups[i];
      for (let j in group.blocks) {
        let block = group.blocks[j];
        count++;
      }
    }
    count = sqrt(count);
    this.size = count;
    return count;
  }
  
  //Get a 2D array of the grid based on the groups array
  getGrid() {
    let grid = [];
    for (let i = 0; i < this.size; i++) {
      grid.push([]);
      for (let j = 0; j < this.size; j++) {
        grid[i].push(null);
      }
    }

    for (let i in this.groups) {
      let group = this.groups[i];
      for (let j in group.blocks) {
        let block = group.blocks[j];
        grid[block.y][block.x] = block;
      }
    }

    this.grid = grid;
  }
  
  //Get a single block from the grid
  //Has parameters for x and y
  //If nothing is entered it will get the block
  //At the current position
  getBlock(x = this.currentPosition.x, y = this.currentPosition.y) {
    for (let i in this.groups) {
      let group = this.groups[i];
      for (let j in group.blocks) {
        let block = group.blocks[j];
        if (block.x == x && block.y == y)
          return block;
      }
    }
  }
  
  //Checks to see if the user has filled the grid
  isFull() {
    for (let y in this.grid) {
      let row = this.grid[y];
      for (let x in row) {
        let cell = row[x];
        if (cell.entered == "")
          return false;
      }
    }
    return true;
  }

  //Resets the status of every block to 0
  clearStatus() {
    for (let y in this.grid) {
      let row = this.grid[y];
      for (let x = 0; x < row.length; x++) {
        let cell = row[x];
        cell.status = 0;
      }
    }
  }

  //Check to see if a number is repeated within a row
  //Sets those blocks' status to 2
  checkRows() {
    for (let y in this.grid) {
      let row = this.grid[y];
      for (let x = 0; x < row.length; x++) {
        let cell = row[x];
        if (cell.entered != "") {
          for (let i = x + 1; i < row.length; i++) {
            if (cell.entered == row[i].entered) {
              cell.status = 2;
              row[i].status = 2;
            }
          }
        }
      }
    }
  }

  //Check to see if a number is repeated within a column
  //Sets those blocks' status to 2
  checkColumns() {
    for (let x = 0; x < this.grid[0].length; x++) {
      for (let y = 0; y < this.grid.length; y++) {
        let cell = this.grid[y][x];
        if (cell.entered != "") {
          for (let i = y + 1; i < this.grid.length; i++) {
            if (cell.entered == this.grid[i][x].entered) {
              cell.status = 2;
              this.grid[i][x].status = 2;
            }
          }
        }
      }
    }
  }

  //Check to see if completed groups solve the operation
  //Sets the status of the blocks in the groups that don't to 2
  checkGroup() {
    for (let i in this.groups) {
      let group = this.groups[i];
      let entered = [];
      for (let j in group.blocks) {
        let block = group.blocks[j];
        if (block.entered != "") {
          entered.push(block.entered);
        }
      }
      //In order to handle order of operations issues with division
      //and subtraction, check every permutation of the entered values
      //We don't need to do this for addition and multiplication,
      //but it's easier to code them all together
      if (entered.length == group.blocks.length) {
        let perms = permutator(entered);
        let groupCorrect = false;
        for (let j in perms) {
          let result = perms[j][0];
          for (let k = 1; k < perms[j].length; k++) {
            if (group.operation == "") {} else if (group.operation == "+") {
              result += perms[j][k];
            } else if (group.operation == "-") {
              result -= perms[j][k];
            } else if (group.operation == "x") {
              result *= perms[j][k];
            } else if (group.operation == "÷") {
              result /= perms[j][k];
            }
          }
          if (result == group.value) {
            groupCorrect = true;
          }
        }
        if (!groupCorrect) {
          for (let j in group.blocks) {
            let block = group.blocks[j];
            block.status = 2;
          }
        }
      }
    }
  }

  //Compare all the entered values to the correct values.
  //Returns false if there are mistakes, true if it's perfect
  checkCorrect() {
    for (let y in this.grid) {
      let row = this.grid[y];
      for (let x = 0; x < row.length; x++) {
        let cell = row[x];
        if (cell.value == cell.entered) {
          cell.status = 1;
        } else {
          return false;
        }
      }
    }
    return true;
  }

  //Calls all the check functions
  checkGrid() {
    if (!this.checkCorrect()) {
      this.clearStatus();
      this.checkRows();
      this.checkColumns();
      this.checkGroup();
    }
  }
}

//Create our game object variable
var ken;

function setup() {
  createCanvas(400, 400);
  
  //Create each of the groups with all of their blocks
  let groups = [];
  groups.push(new Group(3, "",
    new Block(0, 0, 3)
  ));
  groups.push(new Group(2, "÷",
    new Block(1, 0, 2),
    new Block(2, 0, 4)
  ));
  groups.push(new Group(3, "+",
    new Block(3, 0, 1),
    new Block(3, 1, 2)
  ));
  groups.push(new Group(3, "",
    new Block(2, 1, 3)
  ));
  groups.push(new Group(3, "-",
    new Block(1, 1, 1),
    new Block(1, 2, 4)
  ));
  groups.push(new Group(2, "-",
    new Block(0, 1, 4),
    new Block(0, 2, 2)
  ));
  groups.push(new Group(2, "-",
    new Block(0, 3, 1),
    new Block(1, 3, 3)
  ));
  groups.push(new Group(6, "x",
    new Block(2, 2, 1),
    new Block(2, 3, 2),
    new Block(3, 2, 3)
  ));
  groups.push(new Group(4, "",
    new Block(3, 3, 4)
  ));

  //Create our game object from the groups array and store it in our variable
  ken = new Ken(groups);
}

function draw() {
  background(220);
  //Display the game object
  ken.display();
}

/*
  Handle typed inputs
  Arrow keys move the current position (it loops around the edges
  Number keys enter a value on the current block
    Number keys only work up to the size of the grid (4x4 doesn't allow "5")
  Delete clears the current block
  'c' clears the entire grid
*/
function keyPressed() {
  if (keyCode == 38) {
    ken.currentPosition.y--;
    if (ken.currentPosition.y < 0) {
      ken.currentPosition.y += ken.size;
    }
  } else if (keyCode == 39) {
    ken.currentPosition.x++;
    if (ken.currentPosition.x >= ken.size) {
      ken.currentPosition.x -= ken.size;
    }
  } else if (keyCode == 40) {
    ken.currentPosition.y++;
    if (ken.currentPosition.y >= ken.size) {
      ken.currentPosition.y -= ken.size;
    }
  } else if (keyCode == 37) {
    ken.currentPosition.x--;
    if (ken.currentPosition.x < 0) {
      ken.currentPosition.x += ken.size;
    }
  } else if (keyCode >= 49 && keyCode < 49 + ken.size) {
    ken.getBlock().entered = parseInt(key)
  } else if (keyCode == 8) {
    ken.getBlock().entered = "";
  } else if (keyCode == 67) {
    for (let y in ken.grid) {
      let row = ken.grid[y];
      for (let x = 0; x < row.length; x++) {
        let cell = row[x];
        cell.entered = "";
      }
    }
  }
  ken.checkGrid();
}

//Detect mouse clicks and move the currentPosition accordingly
function mousePressed() {
  let s = ken.scaleFactor;
  let w = (width * s) / ken.size;
  let h = (height * s) / ken.size;

  let x = floor((mouseX - (width - w * ken.size) / 2) / w);
  let y = floor((mouseY - (height - h * ken.size) / 2) / h);

  console.log(x, y);

  if(x >= 0 && x < ken.size && y >= 0 && y < ken.size) {
    ken.currentPosition.x = x;
    ken.currentPosition.y = y;
  }
}

//Takes an array and returns an array of arrays containing every permutation of the numbers
//Got it here: https://stackoverflow.com/questions/9960908/permutations-in-javascript
function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    var cur, memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr);
}