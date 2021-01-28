const embeddingPreviewInitialConfig = {
  width: 600,
  height: 500,
  pointSize: 5,
  toggleInvert: '#FFFFFF',
  masterColour: '#000000',
  umap1Domain: null,
  umap2Domain: null,
  plotToDraw: true,
  titleText: '',
  titleSize: 20,
  titleAnchor: 'start',
  axisTitlesize: 13,
  axisTicks: 13,
  transGrid: 0,
  axesOffset: 10,
  masterFont: 'sans-serif',
  xAxisText: '',
  yAxisText: '',
  pointStyle: 'circle',
  pointOpa: 5,
  g1Color: 'red',
  g2mColor: 'green',
  sColor: 'blue',
  legendTextColor: '#FFFFFF',
  legendEnabled: true,
  legend: null,
  legendPosition: 'top-right',
  geneexpLegendloc: '',
  colGradient: 'spectral',
  labelSize: 28,
  labelShow: 1,
  labelFont: 2,
  labelsEnabled: true,
  reverseCbar: false,
  selectedClusters: [],
  testVar: null,
  bounceX: 0,
  plotTitle: 'default clusters',
  maxHeight: 600,
  maxWidth: 700,
};

const embeddingCategoricalInitialConfig = {
  spec: '1.0.0',
  width: 700,
  height: 550,
  pointSize: 5,
  toggleInvert: '#FFFFFF',
  masterColour: '#000000',
  titleText: '',
  titleSize: 20,
  titleAnchor: 'start',
  axisTitlesize: 13,
  axisTicks: 13,
  transGrid: 0,
  axesOffset: 10,
  masterFont: 'sans-serif',
  xaxisText: 'UMAP 1',
  yaxisText: 'UMAP 2',
  pointStyle: 'circle',
  pointOpa: 5,
  g1Color: 'red',
  g2mColor: 'green',
  sColor: 'blue',
  legendTextColor: '#FFFFFF',
  geneexpLegendloc: '',
  labelSize: 28,
  labelShow: 1,
  labelFont: 2,
  labelsEnabled: true,
  selectedCellSet: 'louvain',
  testVar: null,
  legendEnabled: true,
  legendPosition: 'top',
};

const embeddingContinuousInitialConfig = {
  spec: '1.0.0',
  width: 700,
  height: 550,
  selectedSample: 'All',
  pointSize: 5,
  colGradient: 'viridis',
  toggleInvert: '#FFFFFF',
  masterColour: '#000000',
  reverseCbar: false,
  logEquation: 'datum.expression*1',
  titleText: '',
  shownGene: 'CST3',
  titleSize: 20,
  titleAnchor: 'start',
  axisTitlesize: 13,
  axisTicks: 13,
  transGrid: 0,
  axesOffset: 10,
  masterFont: 'sans-serif',
  xaxisText: 'UMAP 1',
  yaxisText: 'UMAP 2',
  pointStyle: 'circle',
  pointOpa: 5,
  bounceX: 0,
  legendEnabled: true,
  legendPosition: 'top-right',
};

const heatmapInitialConfig = {
  spec: '1.0.0',
  width: 500,
  height: 500,
  colGradient: 'viridis',
  legend: null,
  legendEnabled: true,
  selectedGenes: [],
  selectedCellSet: 'louvain',
  masterFont: 'sans-serif',
  titleText: '',
  titleSize: 20,
  titleAnchor: 'start',
  bounceX: 0,
  masterColour: '#000000',
  labelColour: 'transparent',
  legendLocation: 'horizontal',
};

const volcanoInitialConfig = {
  legendEnabled: true,
  spec: '1.0.0',
  width: 500,
  height: 500,
  noDifferenceColor: '#aaaaaa',
  significantUpregulatedColor: '#0000ffaa',
  significantDownregulatedColor: '#ff0000',
  notSignificantDownregulatedColor: '#aaaaaa',
  notSignificantUpregulatedColor: '#aaaaaa',
  significantChangeDirectionUnknownColor: '#aaaaaa',

  // `null` automatically scales to range. This is a problem
  // because our DE is bad right now, so it throws off the
  // range to extreme values. TODO: set this back when we have
  // good DE
  // logFoldChangeDomain: null,

  logFoldChangeDomain: 20,
  maxNegativeLogpValueDomain: null,
  negLogpValueThreshold: 4,
  logFoldChangeThreshold: 1,
  logFoldChangeTickCount: 5,
  negativeLogpValueTickCount: 5,
  downsampleRatio: 0,
  showLogFoldChangeThresholdGuides: true,
  showpvalueThresholdGuides: true,
  thresholdGuideWidth: 1,
  logFoldChangeThresholdColor: '#ff0000',
  pvalueThresholdColor: '#ff0000',
  pointSize: 32,
  pointStyle: 'circle',
  pointOpa: 5,
  strokeOpa: 1,
  strokeCol: '#000000',
  legend: null,
  axisTitlesize: 13,
  axisTicks: 13,
  colGrid: '#000000',
  widthGrid: 10,
  transGrid: 5,
  axesOffset: 10,
  lineWidth: 2,
  xaxisText: 'log2 fold change',
  yaxisText: '-log10(adj. p-value)',
  titleText: '',
  titleSize: 20,
  titleAnchor: 'start',
  masterFont: 'sans-serif',
  masterColour: '#000000',
  toggleInvert: '#FFFFFF',
  reverseCbar: false,
  textThresholdValue: 240,
  legendPosition: 'top-right',
};
const frequencyInitialConfig = {
  frequencyType: 'proportional',
  metadata: '',
  legendEnabled: true,
  chosenClusters: '',
  legendPosition: 'top',
  spec: '1.0.0',
  width: 500,
  height: 500,
  pointSize: 5,
  toggleInvert: '#FFFFFF',
  masterColour: '#000000',
  titleText: '',
  titleSize: 20,
  titleAnchor: 'start',
  axisTitlesize: 13,
  axisTicks: 13,
  transGrid: 0,
  axesOffset: 10,
  masterFont: 'sans-serif',
  xaxisText: 'Sample',
  yaxisText: 'Proportion',
  pointStyle: 'circle',
  pointOpa: 5,
  g1Color: 'red',
  g2mColor: 'green',
  sColor: 'blue',
  legendTextColor: '#FFFFFF',
  geneexpLegendloc: '',
  labelSize: 28,
  labelShow: 1,
  labelFont: 2,
  labelsEnabled: true,
  testVar: null,
};

// This is an updated spec that is only used in data processing and not in plots and tables.
const dataProcessingEmbeddingCategorical = {
  spec: '2.0.0',
  dimensions: {
    width: 700,
    height: 550,
  },
  axes: {
    titleSize: 13,
    fontSize: 13,
    gridOpacity: 0,
    gridWidth: 10,
    offset: 10,
    xText: 'UMAP 1',
    yText: 'UMAP 2',
    lineWidth: 2,
  },
  title: {
    text: '',
    size: 20,
    anchor: 'start',
  },
  labels: {
    show: true,
    size: 28,
  },
  legend: {
    show: true,
    position: 'top',
  },
  markers: {
    size: 5,
    opacity: 5,
    shape: 'circle',
  },
  text: {
    font: 'sans-serif',
    color: '#000000',
  },
  colorInverted: false,
  data: {
    cellSet: 'louvain',
  },
};

const interactiveHeatmapInitialConfig = {
  selectedTracks: ['louvain'],
  groupedTrack: 'louvain',
  expressionValue: 'raw',
  legendIsVisible: true,
};

const initialPlotConfigStates = {
  embeddingPreview: embeddingPreviewInitialConfig,
  embeddingCategorical: embeddingCategoricalInitialConfig,
  embeddingContinuous: embeddingContinuousInitialConfig,
  heatmap: heatmapInitialConfig,
  volcano: volcanoInitialConfig,
  frequency: frequencyInitialConfig,

  // These are updated plots with sensible config structures.
  // Plots and tables should be updated to these when possible/feasible.
  dataProcessingEmbeddingCategorical,
};

const initialComponentConfigStates = {
  interactiveHeatmap: interactiveHeatmapInitialConfig,
};
export { initialPlotConfigStates, initialComponentConfigStates };

const initialState = {};
export default initialState;
