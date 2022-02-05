let distanceMatrix,
  timeMatrix,
  graphElements,
  cities = [],
  cy,
  path,
  totalWeight,
  totalExecutionTime,
  dijkstraStartNode,
  dijkstraFinishNode,
  numberOfClickedNodes = 0,
  previousStartInputValue = "",
  previousFinishInputValue = "";

const inputStates = {
  isStartOkay: false,
  startValue: null,
  isFinishOkay: false,
  finishValue: null,
};

let displayOptions = {
  unit: "distance",
  algorithm: "cyto-dijkstra",
};

const cyDom = document.querySelector("#cy");
const resetButton = document.querySelector("#reset-button");
const directionsButton = document.querySelector("#directions-button");
const startInput = document.querySelector("#start-input");
const finishInput = document.querySelector("#finish-input");
const reverseButton = document.querySelector("#reverse-button");

const distanceButton = document.querySelector("#distance-button");
const timeButton = document.querySelector("#time-button");
const cytoDijkstraButton = document.querySelector("#cyto-dijkstra-button");
const cytoAstarButton = document.querySelector("#cyto-astar-button");
const ourDijkstraButton = document.querySelector("#our-dijkstra-button");

const analysisSummaryText = document.querySelector("#analysis-summary-text");
const analysisPlaceholderText = document.querySelector(
  "#analysis-placeholder-text"
);
const distanceTimeInfoContainer = document.querySelector(
  "#distance-time-info-container"
);
const executionTimeInfoContainer = document.querySelector(
  "#execution-time-info-container"
);

function applySelectedStylesToButton(button) {
  button.classList.add("bg-white", "text-black", "hover:bg-gray-200");
  button.classList.remove("hover:border-gray-300", "hover:text-gray-300");
  button.querySelector("#bordered-circle").classList.add("hidden");
  button.querySelector("#check-icon").classList.remove("hidden");
}

function removeSelectedStylesFromButton(button) {
  button.classList.add(
    "text-white",
    "hover:border-gray-300",
    "hover:text-gray-300",
    "border"
  );
  button.classList.remove("bg-white", "hover:bg-gray-200", "text-black");
  button.querySelector("#bordered-circle").classList.remove("hidden");
  button.querySelector("#check-icon").classList.add("hidden");
}

function handleDisplayButtonsClick(e) {
  switch (e.target.id) {
    case "distance-button":
      displayOptions.unit = "distance";
      directionsButton.dispatchEvent(new Event("click"));
      applySelectedStylesToButton(distanceButton);
      removeSelectedStylesFromButton(timeButton);
      break;
    case "time-button":
      displayOptions.unit = "time";
      directionsButton.dispatchEvent(new Event("click"));
      applySelectedStylesToButton(timeButton);
      removeSelectedStylesFromButton(distanceButton);
      break;
    case "cyto-dijkstra-button":
      displayOptions.algorithm = "cyto-dijkstra";
      directionsButton.dispatchEvent(new Event("click"));
      applySelectedStylesToButton(cytoDijkstraButton);
      removeSelectedStylesFromButton(cytoAstarButton);
      removeSelectedStylesFromButton(ourDijkstraButton);
      break;
    case "cyto-astar-button":
      displayOptions.algorithm = "cyto-astar";
      directionsButton.dispatchEvent(new Event("click"));
      applySelectedStylesToButton(cytoAstarButton);
      removeSelectedStylesFromButton(cytoDijkstraButton);
      removeSelectedStylesFromButton(ourDijkstraButton);
      break;
    case "our-dijkstra-button":
      displayOptions.algorithm = "our-dijkstra";
      directionsButton.dispatchEvent(new Event("click"));
      applySelectedStylesToButton(ourDijkstraButton);
      removeSelectedStylesFromButton(cytoDijkstraButton);
      removeSelectedStylesFromButton(cytoAstarButton);
      break;
    default:
      break;
  }
}

distanceButton.addEventListener("click", handleDisplayButtonsClick);
timeButton.addEventListener("click", handleDisplayButtonsClick);
cytoDijkstraButton.addEventListener("click", handleDisplayButtonsClick);
cytoAstarButton.addEventListener("click", handleDisplayButtonsClick);
ourDijkstraButton.addEventListener("click", handleDisplayButtonsClick);

window.addEventListener("resize", (e) => {
  if (!cy) return;
  cy.resize();
  cy.fit(30);
});

window.addEventListener("keydown", (e) => {
  if (e.altKey && e.key === "l") {
    // startInput.value = previousFinishInputValue
    if (!cy) return;
    cy.resize();
    cy.fit(30);
  }

  if (e.ctrlKey && e.altKey && e.key === "r") {
    resetButton.dispatchEvent(new Event("click"));
  } else if (e.altKey && e.key === "r") {
    reverseButton.dispatchEvent(new Event("click"));
  }

  if (e.ctrlKey && e.altKey && e.key === "d") {
    directionsButton.dispatchEvent(new Event("click"));
  }

  if (e.altKey && e.key === "1") {
    distanceButton.dispatchEvent(new Event("click"));
  } else if (e.altKey && e.key === "2") {
    timeButton.dispatchEvent(new Event("click"));
  } else if (e.altKey && e.key === "3") {
    cytoDijkstraButton.dispatchEvent(new Event("click"));
  } else if (e.altKey && e.key === "4") {
    cytoAstarButton.dispatchEvent(new Event("click"));
  } else if (e.altKey && e.key === "5") {
    ourDijkstraButton.dispatchEvent(new Event("click"));
  }

  if (e.key === "/" && document.activeElement !== startInput) {
    e.preventDefault();
    startInput.focus();
    startInput.select();
  }

  if (
    e.key === "Tab" &&
    document.activeElement === startInput &&
    !inputStates.isStartOkay
  ) {
    const autocomplete = cities.filter((citie) =>
      citie.startsWith(formatString(startInput.value))
    );
    if (autocomplete.length > 1 || !autocomplete.length) return;
    startInput.value = autocomplete[0];
    startInput.dispatchEvent(new Event("input"));
  } else if (
    e.key === "Tab" &&
    document.activeElement === finishInput &&
    !inputStates.isFinishOkay
  ) {
    const autocomplete = cities.filter((citie) =>
      citie.startsWith(formatString(finishInput.value))
    );
    if (autocomplete.length > 1 || !autocomplete.length) return;
    finishInput.value = autocomplete[0];
    finishInput.dispatchEvent(new Event("input"));
  }
});

startInput.addEventListener("input", (e) => {
  inputStates.startValue = formatString(startInput.value);

  if (
    startInput.value &&
    cities &&
    !cities.includes(formatString(startInput.value))
  ) {
    inputStates.isStartOkay = false;
    startInput.classList.remove("border-teal-300");
    startInput.classList.remove("text-teal-300");
    startInput.classList.add("border-red-400");
    startInput.classList.add("text-red-400");
    if (
      !inputStates.isFinishOkay ||
      (!inputStates.isStartOkay &&
        inputStates.startValue === inputStates.finishValue)
    ) {
      directionsButton.disabled = true;
      reverseButton.disabled = true;
    }
  } else if (
    startInput.value &&
    cities &&
    cities.includes(formatString(startInput.value))
  ) {
    inputStates.isStartOkay = true;
    startInput.classList.remove("border-red-400");
    startInput.classList.remove("text-red-400");
    startInput.classList.add("border-teal-300");
    startInput.classList.add("text-teal-300");
    if (
      inputStates.isFinishOkay &&
      inputStates.isStartOkay &&
      inputStates.startValue !== inputStates.finishValue
    ) {
      directionsButton.disabled = false;
      reverseButton.disabled = false;
    }
  } else {
    inputStates.isStartOkay = false;
    startInput.classList.remove("border-red-400");
    startInput.classList.remove("text-red-400");
    startInput.classList.remove("border-teal-300");
    startInput.classList.remove("text-teal-300");
    if (
      !inputStates.isFinishOkay ||
      !inputStates.isStartOkay ||
      inputStates.startValue === inputStates.finishValue
    ) {
      directionsButton.disabled = true;
      reverseButton.disabled = true;
    }
  }
});

finishInput.addEventListener("input", (e) => {
  inputStates.finishValue = formatString(finishInput.value);
  if (
    finishInput.value &&
    cities &&
    !cities.includes(formatString(finishInput.value))
  ) {
    inputStates.isFinishOkay = false;
    finishInput.classList.remove("border-teal-300");
    finishInput.classList.remove("text-teal-300");
    finishInput.classList.add("border-red-400");
    finishInput.classList.add("text-red-400");
    if (
      !inputStates.isFinishOkay ||
      (!inputStates.isStartOkay &&
        inputStates.startValue === inputStates.finishValue)
    ) {
      directionsButton.disabled = true;
      reverseButton.disabled = true;
    }
  } else if (
    finishInput.value &&
    cities &&
    cities.includes(formatString(finishInput.value))
  ) {
    inputStates.isFinishOkay = true;
    finishInput.classList.remove("border-red-400");
    finishInput.classList.remove("text-red-400");
    finishInput.classList.add("border-teal-300");
    finishInput.classList.add("text-teal-300");
    if (
      inputStates.isFinishOkay &&
      inputStates.isStartOkay &&
      inputStates.startValue !== inputStates.finishValue
    ) {
      directionsButton.disabled = false;
      reverseButton.disabled = false;
    }
  } else {
    inputStates.isFinishOkay = false;
    finishInput.classList.remove("border-red-400");
    finishInput.classList.remove("text-red-400");
    finishInput.classList.remove("border-teal-300");
    finishInput.classList.remove("text-teal-300");
    if (
      !inputStates.isFinishOkay ||
      !inputStates.isStartOkay ||
      inputStates.startValue === inputStates.finishValue
    ) {
      directionsButton.disabled = true;
      reverseButton.disabled = true;
    }
  }
});

resetButton.addEventListener("click", (e) => {
  if (displayOptions.unit !== "distance") {
    applySelectedStylesToButton(distanceButton);
    removeSelectedStylesFromButton(timeButton);
  }
  if (displayOptions.algorithm !== "cyto-dijkstra") {
    applySelectedStylesToButton(cytoDijkstraButton);
    removeSelectedStylesFromButton(cytoAstarButton);
    removeSelectedStylesFromButton(ourDijkstraButton);
  }

  displayOptions = {
    unit: "distance",
    algorithm: "cyto-dijkstra",
  };

  numberOfClickedNodes = 0;

  analysisPlaceholderText.classList.remove("hidden");
  distanceTimeInfoContainer.classList.add("hidden");
  executionTimeInfoContainer.classList.add("hidden");
  analysisSummaryText.classList.add("hidden");

  startInput.value = "";
  finishInput.value = "";
  startInput.dispatchEvent(new Event("input"));
  finishInput.dispatchEvent(new Event("input"));
  startInput.focus();
  cy.destroy();
  cy = null;
  buildGraph();
});

directionsButton.addEventListener("click", (e) => {
  if (
    !inputStates.isFinishOkay ||
    !inputStates.isStartOkay ||
    inputStates.startValue === inputStates.finishValue
  )
    return;
  dijkstraStartNode = formatString(startInput.value);
  dijkstraFinishNode = formatString(finishInput.value);
  if (!dijkstraStartNode || !dijkstraFinishNode) return;
  if (path) {
    path.forEach((node, idx) => {
      if (node._private.data.id === formatString(startInput.value)) {
        node.removeClass("node-selected-finish");
        node.addClass("node-selected-start");
      }
      if (node._private.data.id === formatString(finishInput.value)) {
        node.removeClass("node-selected-start");
        node.addClass("node-selected-finish");
      }
      if (
        node._private.data.id !== formatString(startInput.value) &&
        node._private.data.id !== formatString(finishInput.value)
      ) {
        node.removeClass(
          "node-selected-start node-selected-finish node-selected edge-selected-unique edge-selected-start edge-selected-finish edge-selected"
        );
      }
    });
  }
  animatePath(dijkstraStartNode, dijkstraFinishNode);
  analysisPlaceholderText.classList.add("hidden");
  distanceTimeInfoContainer.classList.remove("hidden");
  executionTimeInfoContainer.classList.remove("hidden");
  analysisSummaryText.classList.remove("hidden");
  analysisSummaryText.querySelector("h2").textContent =
    displayOptions.unit === "distance" ? "SHORTEST PATH" : "FASTEST PATH";
  analysisSummaryText.querySelector("h3").textContent = `${
    path[0]._private.data.label
  } —— ${path[path.length - 1]._private.data.label}`;
  analysisSummaryText.querySelector("h4").textContent =
    displayOptions.algorithm === "cyto-dijkstra"
      ? "CYTOSCAPE'S DIJKSTRA"
      : displayOptions.algorithm === "cyto-astar"
      ? "CYTOSCAPE'S ASTAR"
      : "OUR OWN DIJKSTRA";

  if (displayOptions.unit === "time") {
    distanceTimeInfoContainer.querySelector("h3").textContent = "TRAVEL TIME";
    distanceTimeInfoContainer.querySelector("h2").textContent =
      timeConvert(totalWeight);
    executionTimeInfoContainer.querySelector(
      "h2"
    ).textContent = `${totalExecutionTime.toFixed(2)}ms`;
  } else {
    distanceTimeInfoContainer.querySelector("h3").textContent =
      "TRAVEL DISTANCE";
    distanceTimeInfoContainer.querySelector(
      "h2"
    ).textContent = `${new Intl.NumberFormat().format(totalWeight)}km`;
    executionTimeInfoContainer.querySelector(
      "h2"
    ).textContent = `${totalExecutionTime.toFixed(2)}ms`;
  }
});

reverseButton.addEventListener("click", (e) => {
  if (
    !inputStates.isFinishOkay ||
    !inputStates.isStartOkay ||
    inputStates.startValue === inputStates.finishValue
  )
    return;
  const temp = startInput.value;
  startInput.value = finishInput.value;
  startInput.dispatchEvent(new Event("input"));
  finishInput.value = temp;
  finishInput.dispatchEvent(new Event("input"));
  directionsButton.focus();
});

function animatePath(startNode, finishNode) {
  if (displayOptions.algorithm === "cyto-dijkstra") {
    const startTime = performance.now();
    // Initiate dijkstra's algorithm by giving it the starting node
    const dijkstra = cy.elements().dijkstra(
      `#${startNode}`,
      function (edge) {
        return edge.data(`${displayOptions.unit}`);
      },
      true
    );
    // Finish the dijkstra search by giving it the ending node
    path = dijkstra.pathTo(cy.$(`#${finishNode}`));
    const endTime = performance.now();
    totalExecutionTime = endTime - startTime;
    totalWeight = dijkstra.distanceTo(cy.$(`#${finishNode}`));
  } else if (displayOptions.algorithm === "cyto-astar") {
    const startTime = performance.now();
    const aStar = cy.elements().aStar({
      root: `#${startNode}`,
      goal: `#${finishNode}`,
      weight: function (edge) {
        return edge.data(`${displayOptions.unit}`);
      },
      directed: true,
    });
    const endTime = performance.now();
    totalExecutionTime = endTime - startTime;

    path = aStar.path;
    totalWeight = aStar.distance;
  }

  let i = 0,
    tick = 500;

  function trace() {
    if (i < path.length) {
      if (path[i]._private.group === "nodes") {
        if (i === 0) {
          path[i].addClass("node-selected-start");
        } else if (i === path.length - 1) {
          path[i].addClass("node-selected-finish");
        } else {
          path[i].addClass("node-selected");
        }
      }
      if (path[i]._private.group === "edges") {
        if (path.length === 3) {
          path[i].addClass("edge-selected-unique");
        } else if (i === 1) {
          path[i].addClass("edge-selected-start");
        } else if (i === path.length - 2) {
          path[i].addClass("edge-selected-finish");
        } else {
          path[i].addClass("edge-selected");
        }
      }
      i++;
      setTimeout(trace, tick);
    }
  }
  trace();
}

const COLORS = {
  black: "#000",
  white: "#fff",
  red: "#f00",
  aqua: "aqua",
  aquadark: "#00cccc",
  aquadarker: "#006666",
  aqualight: "#87fff5",
  gray: "#636363",
  yellow: "#fff8a6",
  yellodark: "#5e5701",
  pink: "#ff8aad",
  purple: "#9147ff",
};

const nodeStyles = [
  {
    selector: "node",
    style: {
      "background-color": COLORS.white,
      label: function (node) {
        if (node.data("label").length <= 7) return node.data("label");
        return `${node.data("label").slice(0, 7)}.`;
      },
      color: COLORS.black,
      "text-halign": "center",
      "text-valign": "center",
      width: 100,
      height: 100,
      "font-size": 20,
      "font-weight": "bold",
      "border-width": 10,
      "border-color": COLORS.white,
    },
  },
];
const edgeStyles = [
  {
    selector: "edge",
    style: {
      "transition-property": "line-color",
      "transition-duration": "0.2s",
      width: 1,
      "curve-style": "straight",
      "line-style": "solid",
      "font-size": 12,
      "target-arrow-shape": "triangle",
      "target-arrow-color": COLORS.gray,
      "line-color": COLORS.gray,
      color: COLORS.aqua,
    },
  },
];

const selectedNodeStyles = [
  {
    selector: ".node-selected",
    style: {
      "background-color": COLORS.black,
      "border-width": 10,
      "border-color": COLORS.yellow,
      color: COLORS.yellow,
    },
  },
  {
    selector: ".node-selected-start",
    style: {
      "transition-property": "background-color border-color",
      "transition-duration": "0.2s",
      "transition-timing-function": "ease-in-sine",
      "background-color": COLORS.black,
      "border-width": 10,
      "border-color": COLORS.aqualight,
      color: COLORS.aqualight,
    },
  },
  {
    selector: ".node-selected-finish",
    style: {
      "transition-property": "background-color border-color",
      "transition-duration": "0.2s",
      "transition-timing-function": "ease-in-sine",
      "background-color": COLORS.black,
      "border-width": 10,
      "border-color": COLORS.pink,
      color: COLORS.pink,
    },
  },
  {
    selector: ".node-selected-options",
    style: {
      "background-color": COLORS.black,
      "border-width": 5,
      "border-color": COLORS.white,
      color: COLORS.white,
    },
  },
];

const selectedEdgeStyles = [
  {
    selector: ".edge-selected",
    style: {
      width: 10,
      "line-color": COLORS.yellow,
      "target-arrow-color": COLORS.yellow,
      "z-index": 100,
      label: function (node) {
        return displayOptions.unit === "distance"
          ? `${new Intl.NumberFormat().format(node.data("distance"))}km`
          : `${node.data("time-label")}`;
      },
      "text-background-color": COLORS.yellow,
      "text-background-opacity": 1,
      "text-background-shape": "round-rectangle",
      "text-background-padding": "10px",
      color: COLORS.yellodark,
      "font-size": "25px",
      "font-weight": "bold",
    },
  },
  {
    selector: ".edge-selected-unique",
    style: {
      width: 10,
      "target-arrow-color": COLORS.pink,
      "z-index": 100,
      label: function (node) {
        return displayOptions.unit === "distance"
          ? `${new Intl.NumberFormat().format(node.data("distance"))}km`
          : `${node.data("time-label")}`;
      },
      "text-background-color": COLORS.yellow,
      "text-background-opacity": 1,
      "text-background-shape": "round-rectangle",
      "text-background-padding": "10px",
      color: COLORS.yellodark,
      "font-size": "25px",
      "font-weight": "bold",
      "line-fill": "linear-gradient",
      "line-gradient-stop-colors": `${COLORS.aqualight} ${COLORS.yellow} ${COLORS.pink}`,
    },
  },
  {
    selector: ".edge-selected-start",
    style: {
      width: 10,
      "target-arrow-color": COLORS.yellow,
      "z-index": 100,
      label: function (node) {
        return displayOptions.unit === "distance"
          ? `${new Intl.NumberFormat().format(node.data("distance"))}km`
          : `${node.data("time-label")}`;
      },
      "text-background-color": COLORS.yellow,
      "text-background-opacity": 1,
      "text-background-shape": "round-rectangle",
      "text-background-padding": "10px",
      color: COLORS.yellodark,
      "font-size": "25px",
      "font-weight": "bold",
      "line-fill": "linear-gradient",
      "line-gradient-stop-colors": `${COLORS.aqualight} ${COLORS.yellow} ${COLORS.yellow}`,
    },
  },
  {
    selector: ".edge-selected-finish",
    style: {
      width: 10,
      "target-arrow-color": COLORS.pink,
      "z-index": 100,
      label: function (node) {
        return displayOptions.unit === "distance"
          ? `${new Intl.NumberFormat().format(node.data("distance"))}km`
          : `${node.data("time-label")}`;
      },
      "text-background-color": COLORS.yellow,
      "text-background-opacity": 1,
      "text-background-shape": "round-rectangle",
      "text-background-padding": "10px",
      color: COLORS.yellodark,
      "font-size": "25px",
      "font-weight": "bold",
      "line-fill": "linear-gradient",
      "line-gradient-stop-colors": `${COLORS.yellow} ${COLORS.yellow} ${COLORS.pink}`,
    },
  },
  {
    selector: ".edge-direct-path",
    style: {
      width: 5,
      color: COLORS.black,
      "target-arrow-color": COLORS.white,
      "z-index": 100,
      label: function (node) {
        return displayOptions.unit === "distance"
          ? `${new Intl.NumberFormat().format(node.data("distance"))}km`
          : `${node.data("time-label")}`;
      },
      "text-background-color": COLORS.white,
      "text-background-opacity": 1,
      "text-background-shape": "round-rectangle",
      "text-background-padding": "5px",
      "font-size": "20px",
      "font-weight": "normal",
      "line-fill": "linear-gradient",
      "line-gradient-stop-colors": `${COLORS.white}`,
    },
  },
];

function formatString(string) {
  return string
    .trim()
    .replace(/\s+/g, "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
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

function buildNodesAndEdges(routes, durations) {
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

function parseTime(timeInHHMM) {
  const timeArray = timeInHHMM.split(":");
  const totalMinutes = +timeArray[0] * 60 + +timeArray[1];
  return totalMinutes;
}

function parseTimeLabel(timeInHHMM) {
  const timeArray = timeInHHMM.split(":");
  const hoursString = +timeArray[0] === 0 ? "" : `${+timeArray[0]}h`;
  const minutesString = +timeArray[1] === 0 ? "" : `${+timeArray[1]}m`;
  const timeLabel = `${hoursString} ${minutesString}`;
  return timeLabel;
}

function timeConvert(inputMinutes) {
  const hours = inputMinutes / 60;
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  const rminutes = Math.round(minutes);
  const result = `${rhours}h ${rminutes}m`;
  return result;
}

async function setAdjMatrix() {
  try {
    distanceMatrix = await getAdjMatrixFromCSV("./co-distance.csv");
    timeMatrix = await getAdjMatrixFromCSV("./co-time.csv");
    graphElements = buildNodesAndEdges(distanceMatrix, timeMatrix);
    buildGraph();
    graphElements.find((el) => el);
  } catch (error) {
    throw new Error(error.message);
  }
}

setAdjMatrix();
