import cytoscape from "cytoscape";
import Papa from "papaparse";

window.distanceMatrix;
window.timeMatrix;
window.graphElements;
window.cities = [];
window.cy;
window.path;
window.totalWeight;
window.totalExecutionTime;
window.dijkstraStartNode;
window.dijkstraFinishNode;
window.numberOfClickedNodes = 0;
window.previousStartInputValue = "";
window.previousFinishInputValue = "";

const distanceCsv = new URL("./../assets/co-distance.csv", import.meta.url)
  .href;
const timeCsv = new URL("./../assets/co-time.csv", import.meta.url).href;

async function getAdjMatrixFromCSV(localPath) {
  const response = await fetch(localPath);
  const reader = response.body.getReader();
  const result = await reader.read(); // raw array
  const decoder = new TextDecoder("utf-8");
  const csv = decoder.decode(result.value); // the csv text
  const results = Papa.parse(csv, { header: false }); // object with { data, errors, meta }
  const rows = results.data;

  return rows;
}

function getNodesAndEdgesFromAdjMatrix(routes, durations) {
  if (!routes) return null;
  const elements = [];
  for (let i = 1; i < routes.length; i++) {
    cities.push(formatString(routes[0][i]));
    elements.push({
      group: "nodes",
      data: {
        id: formatString(routes[0][i]),
        label: routes[0][i],
      },
    });
  }

  for (let i = 1; i < routes.length; i++) {
    for (let j = 1; j < routes.length; j++) {
      if (i === j) continue;
      elements.push({
        group: "edges",
        data: {
          id: formatString(`${routes[i][0]}-${routes[0][j]}`),
          source: formatString(routes[i][0]),
          target: formatString(routes[0][j]),
          distance: parseInt(routes[i][j]),
          time: parseTime(durations[i][j]),
          "time-label": parseTimeLabel(durations[i][j]),
          label: `${routes[i][0]}-${routes[0][j]}`,
        },
      });
    }
  }

  return elements;
}

function buildGraph() {
  // Create cytoscape's graph object and render it
  cy = cytoscape({
    container: document.getElementById("cy"),
    elements: graphElements,
    style: [
      ...nodeStyles,
      ...edgeStyles,
      ...selectedNodeStyles,
      ...selectedEdgeStyles,
    ],
    layout: {
      name: "concentric",
      minNodeSpacing: 80,
    },
  });
  cy.on("click", "node", function (e) {
    if (e.originalEvent.altKey) {
      if (numberOfClickedNodes === 0 || numberOfClickedNodes === 2) {
        e.target.removeClass("node-selected-start");
        e.target.removeClass("node-selected-finish");
        e.target.addClass("node-selected-start");
        startInput.value = e.target.id();
        startInput.dispatchEvent(new Event("input"));
        numberOfClickedNodes = numberOfClickedNodes === 0 ? 1 : 1;
      } else if (numberOfClickedNodes === 1) {
        e.target.removeClass("node-selected-start");
        e.target.removeClass("node-selected-finish");
        e.target.addClass("node-selected-finish");
        finishInput.value = e.target.id();
        finishInput.dispatchEvent(new Event("input"));
        directionsButton.dispatchEvent(new Event("click"));
        numberOfClickedNodes++;
      }
    }
  });

  cy.on("mouseover", "node", function (e) {
    if (e.originalEvent.shiftKey) {
      e.target.addClass("node-selected-options");
      cy.edges("[source='" + e.target.id() + "']").addClass("edge-direct-path");
    }
  });
  cy.on("mouseout", "node", function (e) {
    e.target.removeClass("node-selected-options");
    cy.edges("[source='" + e.target.id() + "']").removeClass(
      "edge-direct-path"
    );
  });
}

async function parseCsvFilesAndGenerateGraph() {
  console.log(window.distanceMatrix, distanceMatrix);
  try {
    distanceMatrix = await getAdjMatrixFromCSV(distanceCsv);
    timeMatrix = await getAdjMatrixFromCSV(timeCsv);
    graphElements = getNodesAndEdgesFromAdjMatrix(distanceMatrix, timeMatrix);
    buildGraph();
  } catch (error) {
    throw new Error(error.message);
  }
}

export default parseCsvFilesAndGenerateGraph;
