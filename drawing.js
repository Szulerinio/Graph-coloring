console.log("a");
fetch("graph.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.json();
  })
  .then((json) => console.log(JSON.parse(json)))
  .catch((err) => console.error(`Fetch problem: ${err.message}`));
