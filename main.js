const fs = require("fs");

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const readFile = (name) => {
  return fs.readFileSync(name, "utf8");
};
const writeFile = (name, data) => {
  fs.writeFileSync(name, data);
};

const parseData = (data) => {
  //generates table
  const dataArray = data
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .trim()
    .split(" ");

  let graphTable = [...Array(parseInt(dataArray[0]))].map(() => []); //make an array of given size, and fill it with empty arrays

  for (let i = 1; i < dataArray.length; i += 2) {
    graphTable[dataArray[i] - 1].push(dataArray[i + 1] - 1);
    graphTable[dataArray[i + 1] - 1].push(dataArray[i] - 1);
  }
  return graphTable;
};

const stringifyData = (data) => {
  let dataString = "" + data.length;
  dataString += "\r\n";
  for (let i = 0; i < data.length; i++) {
    let filteredSubArray = data[i].filter((element) => element > i);
    for (let j = 0; j < filteredSubArray.length; j++) {
      dataString += `${i + 1} ${filteredSubArray[j] + 1}`;
      dataString += "\r\n";
    }
  }
  return dataString;
};

// writeFile("out.txt", stringifyData(parseData(readFile("myciel4.txt"))));

const generateGraph = (size, saturation) => {
  if (size < 1 || saturation > 100) {
    console.log(`wprowadzono niepoprawne dane`);
    return;
  }
  if (saturation < Math.ceil(2 / size)) {
    console.log(
      `By zapewnić spójność grafu o rozmiarze ${size} wymagana jest saturacja na poziomie ${Math.ceil(
        2 / size
      )}%`
    );
    return;
  }

  const graphTable = [...Array(size)].map(() => []); //make an array of given size, and fill it with empty arrays
  for (let i = 0; i < graphTable.length - 1; i++) {
    graphTable[i].push(i + 1);
    graphTable[i + 1].push(i);
  }
  let edgeCount = graphTable.length - 1;
  const maxEdgeCount = Math.ceil(((size * size - 1) / 2 / 100) * saturation);
  while (edgeCount < maxEdgeCount) {
    const vertexX = randomInteger(0, size - 1);
    const vertexY = randomInteger(0, size - 1);
    if (vertexX !== vertexY && !graphTable[vertexX].includes(vertexY)) {
      graphTable[vertexX].push(vertexY);
      graphTable[vertexY].push(vertexX);
      edgeCount++;
    }
  }

  graphTable.forEach((element) => {
    element.sort((a, b) => a - b);
  });
  return graphTable;
};

// console.table(generateGraph(40, 50));

const greedyColoring = (graphData) => {
  const coloredGraph = JSON.parse(JSON.stringify(graphData));
  for (let i = 0; i < coloredGraph.length; i++) {
    coloredGraph[i].unshift(0);
  }
  for (let i = 0; i < coloredGraph.length; i++) {
    let lowestFreeColor = 1;
    for (let j = 1; j < coloredGraph[i].length; j++) {
      const inspectedIndex = coloredGraph[i][j];
      if (lowestFreeColor === coloredGraph[inspectedIndex][0]) {
        j = 0;
        lowestFreeColor++;
      }
    }
    coloredGraph[i][0] = lowestFreeColor;
  }

  return coloredGraph;
};

// console.table(greedyColoring(generateGraph(40, 50)));
// console.table(greedyColoring(parseData(readFile("myciel4.txt"))));

// wykonanie w terminalu
const tempGraph = greedyColoring(parseData(readFile("le450_5a.txt")));
let maxcolor = 0;
for (let i = 0; i < tempGraph.length; i++) {
  if (maxcolor < tempGraph[i][0]) {
    maxcolor = tempGraph[i][0];
  }
}
console.log(
    "==============================================reloaded!=============================================="
);
console.table(tempGraph);
console.log(maxcolor);

//wykonanie w terminalu

exports.myciel4 = JSON.stringify(
  greedyColoring(parseData(readFile("myciel4.txt")))
);
exports.queen6 = JSON.stringify(
  greedyColoring(parseData(readFile("queen6.txt")))
);
exports.gc500 = JSON.stringify(
  greedyColoring(parseData(readFile("gc500.txt")))
);
exports.gc1000 = JSON.stringify(
  greedyColoring(parseData(readFile("gc_1000.txt")))
);
exports.miles250 = JSON.stringify(
  greedyColoring(parseData(readFile("miles250.txt")))
);
exports.le450 = JSON.stringify(
  greedyColoring(parseData(readFile("le450_5a.txt")))
);

exports.sudoku = JSON.stringify(
  greedyColoring(parseData(readFile("sudoku.txt")))
);
exports.random = JSON.stringify(greedyColoring(generateGraph(30, 50)));

// generation of sudoku graph
/*
let a = Array(81);
a = [...a].map(() => []);

for (let i = 0; i < a.length; i++) {
  for (let j = 0; j < 9; j++) {
    if (i != (i % 9) + j * 9) a[i].push((i % 9) + j * 9);
    if (i != Math.floor(i / 9) * 9 + j) a[i].push(Math.floor(i / 9) * 9 + j);
  }
  let y = Math.floor(i / 27);
  let x = Math.floor(i / 3) % 3;
  if (i != 27 * y + 3 * x) a[i].push(27 * y + 3 * x);
  if (i != 27 * y + 3 * x + 1) a[i].push(27 * y + 3 * x + 1);
  if (i != 27 * y + 3 * x + 2) a[i].push(27 * y + 3 * x + 2);
  if (i != 27 * y + 3 * x + 9) a[i].push(27 * y + 3 * x + 9);
  if (i != 27 * y + 3 * x + 10) a[i].push(27 * y + 3 * x + 10);
  if (i != 27 * y + 3 * x + 11) a[i].push(27 * y + 3 * x + 11);
  if (i != 27 * y + 3 * x + 18) a[i].push(27 * y + 3 * x + 18);
  if (i != 27 * y + 3 * x + 19) a[i].push(27 * y + 3 * x + 19);
  if (i != 27 * y + 3 * x + 20) a[i].push(27 * y + 3 * x + 20);
  a[i] = a[i].filter((x) => x != i);
  a[i].sort((a, b) => a - b);
  a[i] = [...new Set(a[i])];
}
writeFile("sudoku.txt", stringifyData(a));
console.table(a);

console.table(greedyColoring(parseData(readFile("sudoku.txt"))));
*/
