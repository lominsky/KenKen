function setup() {
  let cWidth = document.getElementById("preview").getBoundingClientRect().width * .9;
  createCanvas(cWidth, cWidth);
  let c = document.getElementById("defaultCanvas0");
  let p = document.getElementById("preview");
  p.append(c);
}

class Block {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.status = 0;
  }
}

class Group {
  constructor(value, operation) {
    this.value = value;
    this.operation = operation;
    this.blocks = [];
  }
}

class Ken {
  constructor(groups) {
    this.groups = groups;
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
    this.size = this.getSize();
    this.grid = this.getGrid();
  }

  //This is the main game function
  display() {
    //Calculate the width and height of each block
    let w = (width * this.scaleFactor) / this.size;
    let h = w;

    //Display Extras
    for(let y in this.grid) {
    	for(let x in this.grid[y]) {
			push()
			rectMode(CENTER);
	    	translate(w / 2 + (width - w * this.size) / 2 + x * w, h / 2 + (height - h * this.size) / 2 + y * h);
	    	fill(240);
	    	strokeWeight(1);
	    	stroke(200);
	    	rect(0, 0, w, h);
	    	pop();
    	}
    }

    //Loop through the groups array and display each block
    for (let y in this.grid) {
      let row = this.grid[y];
      for (let x in row) {
        let block = row[x];

		if(block == null) {
        	continue;
        }

        push();
        rectMode(CENTER);
        stroke(150);
        //Set the position of each block
        translate(w / 2 + (width - w * this.size) / 2 + x * w, h / 2 + (height - h * this.size) / 2 + y * h);
        


        // console.log(block);
        if(block.status == 0) {
	        fill(255);
        } else if (block.status == 1) {
        	fill(255, 200, 200);
        } else if (block.status == 2) {
        	fill(200, 200, 255);
        } else if (block.status == 3) {
        	fill(200, 200, 255);
        }
        rect(0, 0, w, h);
        
        //Display the correct number
        textAlign(CENTER, CENTER);
        textSize(w * 0.5);
        fill(0);
        if(!Number.isInteger(block.value)) {
        	block.value = ""
        }
        text(block.value, 0, 0);
        let groupNum = this.grid[y][x].groupNumber
        
        //Display the thicker lines around each group
        strokeWeight(5);
        stroke(0);
        // Check the top of each block
        if (block.y == 0 || this.grid[block.y - 1][block.x] == null || groupNum != this.grid[block.y - 1][block.x].groupNumber) {
          line(0 - w / 2, 0 - h / 2, 0 + w / 2, 0 - h / 2);
        }
        //Check the bottom of each block
        if (block.y == this.size - 1 || this.grid[block.y + 1][block.x] == null || groupNum != this.grid[block.y + 1][block.x].groupNumber) {
          line(0 - w / 2, 0 + h / 2, 0 + w / 2, 0 + h / 2);
        }
        //Check the left of each block
        if (block.x == 0 || this.grid[block.y][block.x - 1] == null  || groupNum != this.grid[block.y][block.x - 1].groupNumber) {
          line(0 - w / 2, 0 - h / 2, 0 - w / 2, 0 + h / 2);
        }
        //Check the right of each block
        if (block.x == this.size - 1 || this.grid[block.y][block.x + 1] == null  || groupNum != this.grid[block.y][block.x + 1].groupNumber) {
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
        if(block == null) {
        	continue;
        }
        if (displayedOperations[block.groupNumber] == null) {
          push();
          translate(w / 2 + (width - w * this.size) / 2 + x * w, h / 2 + (height - h * this.size) / 2 + y * h);
          fill(0);
          noStroke();
          textAlign(LEFT, CENTER);
          textSize(w * 0.15);
          if(!Number.isInteger(this.groups[block.groupNumber].value)) {
	      	this.groups[block.groupNumber].value = ""
	      }
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
    let max = 0;
    for (let i in this.groups) {
      let group = this.groups[i];
      for (let j in group.blocks) {
        count++;
        let block = group.blocks[j];
        if(block.x > max) {
        	max = block.x;
        }
        if(block.y > max) {
        	max = block.y;
        }
      }
    }
    max++;
    return max;

    for(let i = 4; i < 10; i++) {
    	if(count <= i*i) {
    		if(max > i) {
    			return max;
    		}
    		return i;
    	}
    }
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
        if(!(Number.isInteger(parseInt(block.x)) && Number.isInteger(parseInt(block.y)))) {
        	continue;
        }
        grid[block.y][block.x] = block;
      }
    }

    return grid;
  }

  isValid() {
  	let valid = true;
  	this.clearStatus();
  	if(!this.checkFilled()) valid = false;
  	if(!this.checkRows()) valid = false;
  	if(!this.checkColumns()) valid = false;
  	if(!this.checkGroups()) valid = false;
  	return valid;
  }

	checkFilled() {
		if(this.size < 1) {
			return false;
		}
		let isGood = true;
		for (let y in this.grid) {
			let row = this.grid[y];
			for (let x in row) {
				if(row[x] == null) {
					isGood = false;
				} else if(!Number.isInteger(row[x].value) || row[x].value > this.size) {
					row[x].status = 1;
					isGood = false;
				}
			}
		}
		return isGood;
	}

	clearStatus() {
		for (let y in this.grid) {
			let row = this.grid[y];
			for (let x = 0; x < row.length; x++) {
				let cell = row[x];
				if(cell == null) {
					continue;
				}
				cell.status = 0;
			}
		}
	}

	checkRows() {
		let isGood = true;
	    for (let y in this.grid) {
	    	let row = this.grid[y];
	    	for (let x = 0; x < row.length; x++) {
		        let cell = row[x];
		        if(cell == null || !Number.isInteger(cell.value)) continue;
				for (let i = x + 1; i < row.length; i++) {
					if(row[i] == null) continue;
					if (cell.value == row[i].value) {
					  cell.status = 2;
					  row[i].status = 2;
					  isGood = false;
					}
		        }
	    	}
	    }
	    return isGood;
	}

	checkColumns() {
		let isGood = true;
	    for (let x in this.grid[0]) {
	    	for (let y = 0; y < this.grid.length; y++) {
		        let cell = this.grid[y][x];
		        if(cell == null || !Number.isInteger(cell.value)) continue;
				for (let i = y + 1; i < this.grid.length; i++) {
					if(this.grid[i][x] == null) continue;
					if (cell.value == this.grid[i][x].value) {
					  cell.status = 2;
					  this.grid[i][x].status = 2;
					  isGood = false;
					}
		        }
	    	}
	    }
	    return isGood;
	}

	checkGroups() {
		let isGood = true;
		for (let i in this.groups) {
			// console.log("********** Group " + i + " **************");
			let group = this.groups[i];


			if(group.blocks.length < 1) {
				// console.log("No blocks in group.");
				continue;
			}

			if(!this.checkContiguous(group)) {
				// console.log("Not Contiguous");
				for(let j in group.blocks) {
					group.blocks[j].status = 3;
				}
				isGood = false;
				continue;
			}

			//Make sure the current group is totally filled out
			let vals = [];
			for (let j in group.blocks) {
				let block = group.blocks[j];
				if(block != null && Number.isInteger(block.value)) {
					vals.push(block.value);
				}
			}
			if(vals.length != group.blocks.length) {
				// console.log("Not every block has a value.");
				continue;
			}

			//Get the operation and result and check that they're valid
			let op = group.operation;
			let res = group.value;
			// console.log("Operation:", op, "Result: ", res);
			if((op == "" && vals.length > 1) || !Number.isInteger(res)) {
				for(let j in group.blocks) {
					group.blocks[j].status = 3;
				}
				isGood = false;
				// console.log("Either: too many blocks for operation or result is not a number.");
				continue;
			}

			if(op == "") {
				// console.log("No operation");
				if(vals[0] != res) {
					// console.log("...and the value doesn't match the result");
					group.blocks[0].status = 3;
				}
				continue;
			}

			let perms = permutator(vals);
			// console.log("Value Permutations:", perms);
			let groupCorrect = false;
			for (let j in perms) {
				let result = perms[j][0];
				for (let k = 1; k < perms[j].length; k++) {
					if (group.operation == "+") {
						result += perms[j][k];
					} else if (group.operation == "-") {
						result -= perms[j][k];
					} else if (group.operation == "x") {
						result *= perms[j][k];
					} else if (group.operation == "÷") {
						result /= perms[j][k];
					}
				}
				if (result == res) {
					groupCorrect = true;
				}
			}
			if (!groupCorrect) {
				for (let j in group.blocks) {
					let block = group.blocks[j];
					block.status = 3;
				}
				isGood = false;
			}
		}

		return isGood;
	}

	checkContiguous(group) {
		let cont = [group.blocks[0]];

		for(let i = 1; i < group.blocks.length; i++) {
			for(let j = i; j < group.blocks.length; j++) {
				let g = group.blocks[j];
				for(let c = 0; c < cont.length; c++) {
					if(!cont.includes(g)) {
						if(this.isContiguous(g, cont[c])) {
							cont.push(g)
						}
					}
				}
			}
		}
		// console.log(cont.length == group.blocks.length);
		return cont.length == group.blocks.length;
	}

	isContiguous(b1, b2) {
		let x1 = b1.x;
		let y1 = b1.y;
		let x2 = b2.x;
		let y2 = b2.y;

		if(x1 == x2 && Math.abs(y1 - y2) == 1)
			return true;
		if(y1 == y2 && Math.abs(x1 - x2) == 1)
			return true;
		return false;
	}
}

function startUp() {
	let h = window.innerHeight - 10;
	h = h + "px"
	let e = document.getElementById("entry");
	e.style.height = h;
	let p = document.getElementById("preview");
	p.style.height = h;
	render();
}

function createGroup() {
	let e = document.getElementById("entry");

	let groupPanel = document.createElement("div");
	let groupNumber = document.getElementsByClassName("groupPanel").length + 1;
	let group = new Group();
	groupPanel.className = "groupPanel";
	// groupPanel.setAttribute("groupNumber", groupNumber);
	groupPanel.innerHTML = "<h3 class=\"groupNumber\">Group " + groupNumber + "</h3>"
	e.append(groupPanel);

	let operationText = document.createElement("p");
	operationText.style.display = "inline";
	operationText.innerHTML = "Operation: ";
	groupPanel.append(operationText);

	let operation = document.createElement("select");
	let option0 = document.createElement("option");
	option0.innerHTML = "";
	let option1 = document.createElement("option");
	option1.innerHTML = "+";
	let option2 = document.createElement("option");
	option2.innerHTML = "-";
	let option3 = document.createElement("option");
	option3.innerHTML = "x";
	let option4 = document.createElement("option");
	option4.innerHTML = "÷";
	operation.append(option0);
	operation.append(option1);
	operation.append(option2);
	operation.append(option3);
	operation.append(option4);
	groupPanel.append(operation);

	let resultText = document.createElement("p");
	resultText.style.display = "inline";
	resultText.style.paddingLeft = "10px";
	resultText.innerHTML = "Operation Result: ";
	groupPanel.append(resultText);

	let resultInput = document.createElement("input");
	resultInput.className = "resultInput"
	resultInput.setAttribute("type", "number");
	groupPanel.append(resultInput);

	groupPanel.append(document.createElement("br"));

	let addBlock = document.createElement("button");
	addBlock.innerHTML = "Add Block";
	addBlock.addEventListener("click", addB)
	groupPanel.append(addBlock);

	let removeGroup = document.createElement("button");
	removeGroup.innerHTML = "Remove Group";
	removeGroup.addEventListener("click", removeG)
	groupPanel.append(removeGroup);

	let table = document.createElement("table");
	table.style.width = "98%"
	groupPanel.append(table);
	let headers = document.createElement("tr");
	table.append(headers);
	let col1 = document.createElement("th");
	col1.innerHTML = "Row";
	col1.style.width = "25%";
	let col2 = document.createElement("th");
	col2.innerHTML = "Column";
	col2.style.width = "25%";
	let col3 = document.createElement("th");
	col3.innerHTML = "Value";
	col3.style.width = "25%";
	let col4 = document.createElement("th");
	col4.innerHTML = "Remove";
	col4.style.width = "25%";
	headers.append(col1, col2, col3, col4);
}

function removeG(e) {
	e.target.parentElement.remove();
	let groups = document.getElementsByClassName("groupPanel");
	for(let i = 0; i < groups.length; i++) {
		groups[i].getElementsByClassName("groupNumber")[0].innerHTML = "Group " + (i + 1);
	}
}

function removeB(e) {
	e.target.parentElement.parentElement.remove();
}

function addB(e) {
	let t = e.target.parentElement.getElementsByTagName("table")[0];
	tr = document.createElement("tr");
	tr.innerHTML = "<td><input type=\"number\"></td><td><input type=\"number\"></td><td><input type=\"number\"></td><td><button>Remove</button></td>"
	t.append(tr);
	let b = tr.getElementsByTagName("button")[0].addEventListener("click", removeB);
	let ins = tr.getElementsByTagName("input");
	for(let i = 0; i < ins.length; i++) {
		ins[i].style.width = "60%";
	}
}

function render() {
  	background(255);

	let groups = [];
	let gps = document.getElementsByClassName("groupPanel");
	for(let i = 0; i < gps.length; i++) {
		let gp = gps[i];
		let op = gp.getElementsByTagName("select")[0].value;
		let res = parseInt(gp.getElementsByClassName("resultInput")[0].value);
		let group = new Group(res, op);
		let bs = gp.getElementsByTagName("tr");
		for(let j = 1; j < bs.length; j++) {
			let b = bs[j];
			let ins = b.getElementsByTagName("input");

			let r = parseInt(ins[0].value) - 1;
			if(r < 0 || r >= 9) {
				r = "";
				ins[0].value = "";
			}
			let c = parseInt(ins[1].value) - 1;
			if(c < 0 || c >= 9) {
				c = "";
				ins[1].value = "";
			}
			let v = parseInt(ins[2].value)
			if(v < 1 || v > 9) {
				v = "";
				ins[2].value = "";
			}
			let block = new Block(c, r, v)
			group.blocks.push(block);
		}
		groups.push(group);
	}

	let ken = new Ken(groups);

	let saveButton = document.getElementById("saveButton");
	var new_element = saveButton.cloneNode(true);
	saveButton.parentNode.replaceChild(new_element, saveButton);
	saveButton = new_element;

	if(ken.isValid()) {
		saveButton.removeAttribute("disabled");
		saveButton.addEventListener("click", function() {
			let tempJSON = JSON.stringify(ken);
			console.log(tempJSON);
			let savedKen = JSON.parse(tempJSON);
			console.log(savedKen);
		})
	} else {
		saveButton.setAttribute("disabled", "true");
	}
	ken.display();
	// console.log(valid);
}


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