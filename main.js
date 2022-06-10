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
  let result = [];
  let max = 0;
  for (let i = 0; i < graph.length; i++) {
    if (graph[i][0] > max) max = graph[i][0];
  }
  let colorStep = Math.floor(max / 20);
  if (colorStep <= 0) colorStep = 1;
  let i = max;
  const t2 = performance.now();

  while (i >= colors) {
    console.log("koloruję na ", i, "kolorów");
    const t0 = performance.now();

    tabuColoring(graph, i);

    const t1 = performance.now();
    console.log("czas od początku", t1 - t2);
    console.log(t1 - t0);

    i--;
    //   if (t1 - t0 > 15000 && t1 - t0 < 60000 && colorStep > 3) {
    //     colorStep = Math.floor(colorStep / 2);
    //     i -= colorStep;
    //   } else if (t1 - t0 > 60000) {
    //     colorStep = Math.ceil(colorStep / 4);
    //     if (colorStep === 0) colorStep = 1;
    //     i = i - colorStep;
    //   } else {
    //     i -= colorStep;
    //   }
  }
  return graph;
  // const t3 = performance.now()
  // console.log("koniec",t3-t2);
  // return result;
};
const tabuColoring = (graph, colors) => {
  initializeTabuColoring(graph, colors);

  let ifCollisionAfterChangingColor = true;
  let vertexWithCollision;

  let tabuList = [];
  let tabuLength = Math.pow(graph.length, 0.73);
  // let tabuLength = 60;
  let previousVertex = 0;
  while (true) {
    if (ifCollisionAfterChangingColor) {
      vertexWithCollision = getFirstWithCollision(graph, previousVertex);
      if (vertexWithCollision === -1) {
        console.log("Graph is colored");
        return graph;
      }
      let collisionArray = getCollisionsOfVertexForAllColors(vertexWithCollision, graph, colors);
      let collisionCount = colorVertexToBestColor(vertexWithCollision, graph, collisionArray, tabuList);
      tabuList.push([vertexWithCollision, graph[vertexWithCollision][0]]);
      if (tabuList.length > tabuLength) tabuList.shift();
      if (collisionCount === 0) {
        previousVertex = vertexWithCollision;
      } else {
        previousVertex = 0;
        ifCollisionAfterChangingColor = false;
      }
    } else {
      let nextWithCollision = getFirstCollidingNeighbour(vertexWithCollision, graph);
      if (nextWithCollision === -1) {
        // console.log("Graph is colored");
        // console.log("chj");
        continue;
        return graph;
      }
      vertexWithCollision = nextWithCollision;

      let collisionArray = getCollisionsOfVertexForAllColors(nextWithCollision, graph, colors);
      //zamiana mu kolor
      let collisionCount = colorVertexToBestColor(nextWithCollision, graph, collisionArray, tabuList);
      tabuList.push([nextWithCollision, graph[nextWithCollision][0]]);
      if (tabuList.length > tabuLength) tabuList.shift();
      ifCollisionAfterChangingColor = collisionCount === 0;
    }
  }
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
    if (graph[index][0] === graph[graph[index][i]][0]) {
      counter++;
    }
  }
  return counter;
};
const getFirstCollidingNeighbour = (index, graph) => {
  for (let i = 1; i < graph[index].length; i++) {
    if (graph[index][0] === graph[graph[index][i]][0]) {
      return graph[index][i];
    }
  }
  return -1;
};

const getFirstWithCollision = (graph, previousVertex) => {
  for (let i = previousVertex; i < graph.length; i++) {
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
  const affectedVertices = [];
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

    collisionArray[currentColor] = countCollisions(graph, affectedVertices, currentColor);
  }
  return collisionArray;
};

const changeColorToNext = (graph, affectedVertices, currentColor) => {
  for (const element of affectedVertices) {
    graph[element][0] = currentColor;
  } //zmień kolor wierzchołków na kolejny
};

const countCollisions = (graph, affectedVertices, currentColor) => {
  let counter = 0;
  for (let i = 0; i < affectedVertices.length; i++) {
    for (let j = 1; j < graph[affectedVertices[i]].length; j++) {
      if (graph[graph[affectedVertices[i]][j]][0] === currentColor) {
        counter++;
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
// writeFile("testgraph", stringifyData(generateGraph(15, 60)));

console.log("==============================================reloaded!==============================================");
//wykonanie w terminalu
exports.myciel4 = () => JSON.stringify(checkGraph(runTabu(greedyColoring(parseData(readFile("myciel4.txt"))), 5)));
exports.queen6 = () => JSON.stringify(checkGraph(runTabu(greedyColoring(parseData(readFile("queen6.txt"))), 7)));
exports.gc500 = () => JSON.stringify(checkGraph(runTabu(greedyColoring(parseData(readFile("gc500.txt"))), 60)));
exports.gc1000 = () => JSON.stringify(checkGraph(runTabu(greedyColoring(parseData(readFile("gc_1000.txt"))), 120)));
exports.miles250 = () => JSON.stringify(checkGraph(runTabu(greedyColoring(parseData(readFile("miles250.txt"))), 8)));
exports.le450 = () => JSON.stringify(checkGraph(runTabu(greedyColoring(parseData(readFile("le450_5a.txt"))), 7)));
exports.tomasz = () => JSON.stringify(checkGraph(runTabu(greedyColoring(parseData(readFile("tomasz.txt"))), 3)));
exports.sudoku = () => JSON.stringify(checkGraph(runTabu(greedyColoring(parseData(readFile("sudoku.txt"))), 3)));
exports.random = () => JSON.stringify(checkGraph(runTabu(greedyColoring(generateGraph(7, 50))), 3));
exports.testgraph = () => JSON.stringify(checkGraph(runTabu(greedyColoring(parseData(readFile("testgraph"))), 6)));
// exports.testgraph = () => JSON.stringify(greedyColoring(parseData(readFile("testgraph"))));

const checkGraph = (graph) => {
  for (let i = 0; i < graph.length; i++) {
    for (let j = 1; j < graph[i].length; j++) {
      if (graph[i][0] === graph[graph[i][j]][0]) {
        console.error("chujnia");
        return false;
      }
    }
  }
  return graph;
};
