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
  const dataArray = data.replace(/\r\n/g, " ").replace(/\n/g, " ").trim().split(" ");

  let graphTable = [...Array(parseInt(dataArray[0]))].map(() => []); //make an array of given size, and fill it with empty arrays

  for (let i = 1; i < dataArray.length; i += 2) {
    if (parseInt(dataArray[i]) > parseInt(dataArray[i + 1])) {
      continue;
    }
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
    for (const element of filteredSubArray) {
      dataString += `${i + 1} ${element + 1}`;
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
      `By zapewnić spójność grafu o rozmiarze ${size} wymagana jest saturacja na poziomie ${Math.ceil(2 / size)}%`
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

const greedyColoring = (graphData) => {
  const coloredGraph = JSON.parse(JSON.stringify(graphData));
  for (const element of coloredGraph) {
    element.unshift(0);
  }
  for (const element of coloredGraph) {
    let lowestFreeColor = 1;
    for (let j = 1; j < element.length; j++) {
      const inspectedIndex = element[j];
      if (lowestFreeColor === coloredGraph[inspectedIndex][0]) {
        j = 0;
        lowestFreeColor++;
      }
    }
    element[0] = lowestFreeColor;
  }

  // console.table(coloredGraph);
  return coloredGraph;
};

const maxColoring = (graphData) => {
  const coloredGraph = JSON.parse(JSON.stringify(graphData));
  for (const element of coloredGraph) {
    element.unshift(0);
  }
  for (let i = 0; i < coloredGraph.length; i++) {
    coloredGraph[i][0] = i + 1;
  }
  // console.table(coloredGraph);
  return coloredGraph;
};

const runTabu = (graph, colors) => {
  let wynik = [];
  let a = 5;
  let max = 0;
  for(let i = 0; i < graph.length; i++) {
    if(graph[i][0] > max) max = graph[i][0];
  } //greedy
  console.time("a");
  let colorStep = Math.floor(max / 20);
  let i = max;
  while(true) {
    let numberOfColors = 0;
    console.log("koloruję na ", i, "kolorów");
    wynik = tabuColoring(graph, i);
    if (wynik === -1) {
      colorStep = Math.floor(colorStep / 2)
      if (colorStep === 1) {
        i++;
      } else {
        i += colorStep + 1;
      }
    } else {
      if (colorStep === 1) {
        i--;
      } else {
        i = i - colorStep;
      }
      //console.table(wynik);
    }
  }
  console.timeEnd("a");
  return wynik;
};
let time = 60000;
const tabuColoring = (graph, colors) => {
  // console.table(graph); // jest mutowany
  const collidingColor = initializeTabuColoring(graph, colors);
  // console.table(graph); // jest mutowany

  let flag = true;
  let vertexWithCollision;
  let count = 0;

  let tabuList = [];
  const t0 = performance.now();
  while (true) {
    count++;

    const t1 = performance.now();
    if(t1 - t0 >= time) {
      time += 30000;
      return -1;
    }
    // console.log("flag", flag);
    if (flag) {
      vertexWithCollision = getFirstWithCollision(graph);
      if (vertexWithCollision === -1) {
        console.log("Graph is colored");
        return graph;
      }
      // console.log("vertexWithCollision", vertexWithCollision);

      let collisionArray = getCollisionsOfVertexForAllColors(vertexWithCollision, graph, colors);
      //zamiana mu kolor
      let collisionCount = colorVertexToBestColor(vertexWithCollision, graph, collisionArray, tabuList);
      tabuList.push([vertexWithCollision, graph[vertexWithCollision][0]]);
      if (tabuList.length > graph.length*3) tabuList.shift();
      // console.log("tabuList");
      // console.table(tabuList);
      // console.log("collisionArray", collisionArray);
      // console.table(graph);

      if (collisionCount === 0) {
        continue;
      } else {
        flag = false;
      }
    } else {
      let nextWithCollision = getFirstCollidingNeighbour(vertexWithCollision, graph);
      // console.log("vertexWithCollision", vertexWithCollision);
      // console.log("nextWithCollision", nextWithCollision);
      vertexWithCollision = nextWithCollision;
      if (nextWithCollision === -1) {
        console.log("Graph is colored");
        return graph;
      }

      let collisionArray = getCollisionsOfVertexForAllColors(nextWithCollision, graph, colors);
      //zamiana mu kolor
      let collisionCount = colorVertexToBestColor(nextWithCollision, graph, collisionArray, tabuList);
      tabuList.push([nextWithCollision, graph[nextWithCollision][0]]);
      if (tabuList.length > graph.length*3) tabuList.shift();
      // console.log("tabuList");
      // console.table(tabuList);
      // console.log("collisionArray", collisionArray);
      // console.table(graph);
      if (collisionCount === 0) {
        flag = true;
      } else {
        flag = false;
      }
    }
  }
  return graph;
};

const colorVertexToBestColor = (index, graph, collisionArray, tabuList) => {
  let choosenColorIndex = -1;
  let choosenColorValue = Infinity;
  for (let i = 1; i < collisionArray.length; i++) {
    if (collisionArray[i] < choosenColorValue && !isArrayInArray([index, i], tabuList)) {
      choosenColorIndex = i;
      choosenColorValue = collisionArray[i];
    }
  }
  if (choosenColorIndex !== -1) {
    graph[index][0] = choosenColorIndex;
  }
  return choosenColorValue;
};

const isArrayInArray = (element, array) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i][0] === element[0] && array[i][1] === element[1]) {
      return true;
    }
  }
  return false;
};

const getCollisionsOfVertexForAllColors = (index, graph, colors) => {
  const collisionArray = [];
  for (let i = 1; i <= colors; i++) {
    graph[index][0] = i;
    collisionArray[i] = getNumberOfCollisionsOfVertex(index, graph);
  }
  return collisionArray;
};

const getNumberOfCollisionsOfVertex = (index, graph) => {
  let counter = 0;
  for (let i = 1; i < graph[index].length; i++) {
    if (graph[index][0] == graph[graph[index][i]][0]) {
      counter++;
    }
  }
  return counter;
};
const getFirstCollidingNeighbour = (index, graph) => {
  for (let i = 1; i < graph[index].length; i++) {
    if (graph[index][0] == graph[graph[index][i]][0]) {
      return graph[index][i];
    }
  }
  return -1;
};

const getCollisionsArray = (graph, colors) => {
  const collisionArray = [];
  for (let currentColor = 1; currentColor <= colors; currentColor++) {
    let counter = 0;
    for (let i = 0; i < graph.length; i++) {
      if (graph[i][0] === currentColor) {
        for (let j = 1; j < graph[i].length; j++) {
          if (graph[graph[i][j]][0] === currentColor) {
            counter++;
          }
        }
      }
    } // policz ilość kolizji dla danego koloru
    collisionArray[currentColor] = counter;
  } // iteruje przez kolory i zapisuje ilość kolizji do zmiennej colisionArray

  return collisionArray;
};

const getFirstWithCollision = (graph) => {
  for (let i = 0; i < graph.length; i++) {
    for (let j = 1; j < graph[i].length; j++) {
      if (graph[i][0] === graph[graph[i][j]][0]) {
        return i;
      }
    }
  }
  return -1;
};

const initializeTabuColoring = (graph, numberOfColorsToAchieve) => {
  const affectedVertices = chooseVerticesToColor(graph, numberOfColorsToAchieve);
  const collisionArray = countCollisionsWithEachColors(graph, affectedVertices, numberOfColorsToAchieve);
  return changeColorToColorWithLowestNumberOfCollsions(graph, affectedVertices, collisionArray);
};

const chooseVerticesToColor = (graph, numberOfColorsToAchieve) => {
  let affectedVertices = [];
  for (let i = 0; i < graph.length; i++) {
    if (graph[i][0] > numberOfColorsToAchieve) {
      affectedVertices.push(i);
    }
  }
  return affectedVertices;
};

const countCollisionsWithEachColors = (graph, affectedVertices, numberOfColorsToAchieve) => {
  const collisionArray = new Array(numberOfColorsToAchieve + 1);
  for (let currentColor = 1; currentColor <= numberOfColorsToAchieve; currentColor++) {
    changeColorToNext(graph, affectedVertices, currentColor);

    collisionArray[currentColor] = countCollisions(graph, currentColor);
  }
  return collisionArray;
};

const changeColorToNext = (graph, affectedVertices, currentColor) => {
  for (const element of affectedVertices) {
    graph[element][0] = currentColor;
  } //zmień kolor wierzchołków na kolejny
};

const countCollisions = (graph, currentColor) => {
  let counter = 0;
  for (const element of graph) {
    if (element[0] === currentColor) {
      for (let j = 1; j < element.length; j++) {
        if (graph[element[j]][0] === currentColor) {
          counter++;
        }
      }
    }
  }
  return counter;
};
const changeColorToColorWithLowestNumberOfCollsions = (graph, affectedVertices, collisionArray) => {
  let choosenColorIndex = 1;
  let choosenColorValue = collisionArray[1];
  for (let i = 2; i < collisionArray.length; i++) {
    if (collisionArray[i] < choosenColorValue) {
      choosenColorIndex = i;
      choosenColorValue = collisionArray[i];
    }
  }
  for (const element of affectedVertices) {
    graph[element][0] = choosenColorIndex;
  }
  return choosenColorIndex;
};

// console.table(greedyColoring(generateGraph(40, 50)));
// console.table(greedyColoring(parseData(readFile("myciel4.txt"))));

// wykonanie w terminalu
// const tabuGraph = tabuColoring(maxColoring(parseData(readFile("tomasz.txt"))), 4);

// const tempGraph = greedyColoring(parseData(readFile("myciel4.txt")));
// let maxcolor = 0;
// for (let i = 0; i < tempGraph.length; i++) {
//   if (maxcolor < tempGraph[i][0]) {
//     maxcolor = tempGraph[i][0];
//   }
// }
console.log("==============================================reloaded!==============================================");
// console.table(tempGraph);

// console.log(maxcolor);

//wykonanie w terminalu

// exports.myciel4 = JSON.stringify(greedyColoring(parseData(readFile("myciel4.txt"))));
// exports.queen6 = () => JSON.stringify(greedyColoring(parseData(readFile("queen6.txt"))));
// exports.gc500 = () => JSON.stringify(greedyColoring(parseData(readFile("gc500.txt"))));
// exports.gc1000 = () => JSON.stringify(greedyColoring(parseData(readFile("gc_1000.txt"))));
// exports.miles250 = () => JSON.stringify(greedyColoring(parseData(readFile("miles250.txt"))));
// exports.le450 = () => JSON.stringify(greedyColoring(parseData(readFile("le450_5a.txt"))));
// exports.tomasz = () => JSON.stringify(tabuColoring(maxColoring(parseData(readFile("tomasz.txt"))), 4));
// exports.sudoku = () => JSON.stringify(greedyColoring(parseData(readFile("sudoku.txt"))));

exports.myciel4 = () => JSON.stringify(tabuColoring(maxColoring(parseData(readFile("myciel4.txt"))), 6));
exports.queen6 = () => JSON.stringify(greedyColoring(parseData(readFile("queen6.txt"))));
exports.gc500 = () => JSON.stringify(runTabu(greedyColoring(parseData(readFile("gc500.txt"))), 50));
exports.gc1000 = () => JSON.stringify(greedyColoring(parseData(readFile("gc_1000.txt"))));
exports.miles250 = () => JSON.stringify(greedyColoring(parseData(readFile("miles250.txt"))));
exports.le450 = () => JSON.stringify(greedyColoring(parseData(readFile("le450_5a.txt"))));
exports.tomasz = () => JSON.stringify(tabuColoring(maxColoring(parseData(readFile("tomasz.txt"))), 4));
exports.sudoku = () => JSON.stringify(greedyColoring(parseData(readFile("sudoku.txt"))));
exports.random = () => JSON.stringify(greedyColoring(generateGraph(7, 50)));

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
