const fs = require("fs");
console.log(
  "==============================================reloaded!=============================================="
);

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

writeFile("out.txt", stringifyData(parseData(readFile("myciel4.txt"))));
