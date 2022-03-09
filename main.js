const fs = require("fs");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(
  "==============================================reloaded!=============================================="
);

const data = fs.readFileSync("myciel4.txt", "utf8");

fs.writeFileSync("out.txt", data);

const dane = [];
