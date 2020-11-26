import * as d3Chromatic from 'd3-scale-chromatic';
import * as d3 from 'd3-scale';

const hexToRgb = (hex) => {
  if (hex) {
    return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`)
      .substring(1).match(/.{2}/g)
      .map((x) => parseInt(x, 16));
  }
  return null;
};

const renderCellSetColors = (cellSets, cellSetProperties) => {
  const colors = {};

  cellSets.forEach((key) => {
    if (!(key in cellSetProperties)) {
      return {};
    }

    const { color: stringColor, cellIds } = cellSetProperties[key];
    const color = hexToRgb(stringColor);

    if (color && cellIds) {
      cellIds.forEach((cellId) => {
        colors[cellId] = color;
      });
    }
  });

  return colors;
};

const colorByGeneExpression = (focusedGene) => {
  const { expression, min, max } = focusedGene;

  const scaleFunction = d3.scaleSequential(d3Chromatic.interpolateViridis)
    .domain([min, max]);
  const cellColoring = {};

  expression.forEach((expressionValue, cellId) => {
    cellColoring[cellId] = hexToRgb(scaleFunction(expressionValue));
  });

  return cellColoring;
};

const convertCellsData = (results) => {
  const data = {};

  results.forEach((value, key) => {
    data[key] = {
      mappings: {
        PCA: value,
      },
    };
  });

  return data;
};

const updateStatus = () => { };
const clearPleaseWait = () => { };

export {
  renderCellSetColors,
  convertCellsData,
  updateStatus,
  clearPleaseWait,
  colorByGeneExpression,
};
