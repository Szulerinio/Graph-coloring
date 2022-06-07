# Grap-coloring

University project for combinatorial optimization class.

The goal of the project is to explore solutions to the Graph Coloring Problem.

It implements Greedy coloring algorithm and tabu search metaheuristic.
It also has a tool that visualizes the colored graph.



## Installation

Use npm

```
npm install
```

Start

```
npm run start
```

Start with rerun on save

```
npm run start-watch
```

## Usage

display table in console

```javascript
main.js;

//logs table of greedy colored graph generated to have 40 vertices and 50% edge saturation
console.table(greedyColoring(generateGraph(40, 50)));

//logs table of greedy colored graph read from file
console.table(greedyColoring(parseData(readFile("myciel4.txt"))));

//writes generated graph data to a file called "out.txt"
writeFile("out.txt", stringifyData(generateGraph(40, 50)));
```

#### New graph is generated on save (if appropriate function used)

draw in browser
http://localhost:3000

```javascript
drawing.js;

//edit settings object

vertexSize: 24; //size of nodes

start: startGraph | startSudoku; // startGraph will place nodes in a wheel shape
// startSudoku will place nodes in sudoku-like shape (max, and prefered 81 nodes)
type: "sudoku" | "myciel4" | "random"; // draws given graph

colors: 0; // shouldn't be changed. At the end holds value of how many colors were used

pickedVertex: -1; // shouldn't be changed. Holds index of currently clicked node
```
