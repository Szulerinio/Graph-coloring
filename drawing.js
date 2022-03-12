let graph;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const draw = (timeStamp) => {
  let colors = 0;
  for (let i = 0; i < graph.length; i++) {
    if (graph[i][0] > colors) colors = graph[i][0];
  }
  console.log(graph);
  for (let i = 0; i < graph.length; i++) {
    ctx.beginPath();
    ctx.arc(
      600 + 380 * Math.sin((Math.PI * 2 * i) / graph.length),
      400 + 380 * Math.cos((Math.PI * 2 * i) / graph.length),
      24,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = `rgb(${(255 / colors) * graph[i][0]},100,100)`;
    ctx.fill();
    ctx.closePath();
  }
  //   window.requestAnimationFrame(draw);
};

fetch("graph.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => (graph = JSON.parse(data)))
  .then(() => window.requestAnimationFrame(draw))
  .catch((err) => console.error(`Fetch problem: ${err.message}`));
