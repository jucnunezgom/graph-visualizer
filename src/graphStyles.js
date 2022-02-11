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

export default [
  ...nodeStyles,
  ...edgeStyles,
  ...selectedNodeStyles,
  ...selectedEdgeStyles,
];
