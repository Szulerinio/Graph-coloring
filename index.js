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

app.get("/sudoku.json", (req, res) => {
  res.json(graph.sudoku);
});

app.get("/myciel4.json", (req, res) => {
  res.json(graph.myciel4);
});
app.get("/queen6.json", (req, res) => {
  res.json(graph.queen6);
});
app.get("/gc500.json", (req, res) => {
  res.json(graph.gc500);
});
app.get("/gc1000.json", (req, res) => {
  res.json(graph.gc1000);
});
app.get("/miles250.json", (req, res) => {
  res.json(graph.miles250);
});
app.get("/le450.json", (req, res) => {
  res.json(graph.le450);
});

app.get("/random.json", (req, res) => {
  res.json(graph.random);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
