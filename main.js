const fs = require("fs");
console.log(
  "==============================================reloaded!=============================================="
);

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
  const cleanData = data.replace(/\r\n/g, " ").trim().split(" ");
  let toReturn = [...Array(cleanData[0] - 0)].map(() => []); //make an array of given size, and fill it with empty arrays

  for (let i = 1; i < cleanData.length; i += 2) {
    toReturn[cleanData[i] - 1].push(cleanData[i + 1] - 1);
    toReturn[cleanData[i + 1] - 1].push(cleanData[i] - 1);
  }
  return toReturn;
};

const stringifyData = (data) => {
  let toReturn = "" + data.length;
  toReturn += "\r\n";
  for (let i = 0; i < data.length; i++) {
    let filteredSubArray = data[i].filter((element) => element > i);
    for (let j = 0; j < filteredSubArray.length; j++) {
      toReturn += `${i + 1} ${filteredSubArray[j] + 1}`;
      toReturn += "\r\n";
    }
  }
  return toReturn;
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

  const toReturn = [...Array(size)].map(() => []); //make an array of given size, and fill it with empty arrays
  for (let i = 0; i < toReturn.length - 1; i++) {
    toReturn[i].push(i + 1);
    toReturn[i + 1].push(i);
  }
  let verticyCount = toReturn.length - 1;
  const maxVerticyCount = Math.ceil(((size * size - 1) / 2 / 100) * saturation);
  while (verticyCount < maxVerticyCount) {
    const tempX = randomInteger(0, size - 1);
    const tempY = randomInteger(0, size - 1);
    if (tempX != tempY && !toReturn[tempX].includes(tempY)) {
      toReturn[tempX].push(tempY);
      toReturn[tempY].push(tempX);
      verticyCount++;
    }
  }

  toReturn.forEach((element) => {
    element.sort((a, b) => a - b);
  });
  return toReturn;
};

// console.table(generateGraph(40, 50));

const greedyColoring = (graphData) => {
  let toReturn = JSON.parse(JSON.stringify(graphData));
  for (let i = 0; i < toReturn.length; i++) {
    toReturn[i].unshift(0);
  }
  for (let i = 0; i < toReturn.length; i++) {
    let lowestFreeColor = 1;
    for (let j = 1; j < toReturn[i].length; j++) {
      const inspectedIndex = toReturn[i][j];
      if (lowestFreeColor == toReturn[inspectedIndex][0]) {
        j = 0;
        lowestFreeColor++;
      }
    }
    toReturn[i][0] = lowestFreeColor;
  }

  return toReturn;
};
// console.table(greedyColoring(generateGraph(40, 50)));
console.table(greedyColoring(parseData(readFile("myciel4.txt"))));
