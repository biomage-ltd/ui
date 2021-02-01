const legendBaseState = {
  legend: {
    enabled: true,
    position: 'top',
    color: '#000000',
  },
};

const dimensionsBaseState = {
  dimensions: {
    width: 400,
    height: 200,
  },
};

const axesBaseState = {
  axes: {
    xAxisText: '',
    yAxisText: '',
    labelSize: 12,
    tickSize: 13,
    offset: 0,
    gridLineWeight: 0,
  },
};

const titleBaseState = {
  title: {
    text: '',
    fontSize: 15,
    location: 'left',
    anchor: 'start',
  },
};

const fontStyleBaseState = {
  fontStyle: {
    value: 'Sans-serif',
    colour: '#000000',
  },
};

const colourBaseState = {
  colour: {
    gradient: 'viridis',
    toggleInvert: '#FFFFFF',
    invert: 'standard',
  },
};

const markerBaseState = {
  marker: {
    pointSize: 5,
    pointOpacity: 5,
    pointShape: 'circle',
  },
};

const labelBaseState = {
  label: {
    enabled: true,
    size: 28,
  },
};

export {
  legendBaseState,
  dimensionsBaseState,
  axesBaseState,
  titleBaseState,
  fontStyleBaseState,
  colourBaseState,
  markerBaseState,
  labelBaseState,
};
