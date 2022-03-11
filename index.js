const express = require("express");
const graph = require("./main.js");
const path = require("path");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/drawing.js", (req, res) => {
  res.sendFile(path.join(__dirname, "/drawing.js"));
});

app.get("/graph.json", (req, res) => {
  res.json(graph.random);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
