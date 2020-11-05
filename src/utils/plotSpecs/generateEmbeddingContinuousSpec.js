const generateSpec = (config) => {
  let legend = [];

  if (config.legendEnabled) {
    legend = [
      {
        fill: 'color',
        type: 'gradient',
        title: config.shownGene,
        gradientLength: 100,
        labelColor: { value: config.masterColour },
        titleColor: { value: config.masterColour },
        labels: {
          interactive: true,
          update: {
            fontSize: { value: 12 },
            fill: { value: config.masterColour },
          },

        },
      }];
  }
  return {
    $schema: 'https://vega.github.io/schema/vega/v5.json',
    description: 'A basic scatter plot example depicting gene expression in the context of UMAP.',
    width: config.width,
    height: config.height,
    autosize: { type: 'fit', resize: true },

    background: config.toggleInvert,
    padding: 5,
    signals: [
      { name: 'chartSize', value: 120 },
      { name: 'chartPad', value: 20 },
      { name: 'chartStep', update: 'chartSize + chartPad' },
    ],
    data: [
      {
        name: 'expression',
        transform: [
          { type: 'flatten', fields: ['expression'], index: ['cellId'] },
          { type: 'formula', as: 'expression', expr: config.logEquation },
        ],
      },
      {
        name: 'embedding',
        transform: [
          { type: 'window', ops: ['row_number'], as: ['cellId'] },
          { type: 'formula', as: 'cellId', expr: 'datum.cellId - 1' },
          {
            type: 'lookup', from: 'expression', key: 'cellId', fields: ['cellId'], values: ['expression'], as: ['expression'],
          },
        ],
      },
      {
        name: 'fields',
        values: [
          'plot1',
          'plot2',
        ],
      },
      {
        name: 'cross',
        source: 'fields',
        transform: [
          { type: 'cross', as: ['x', 'y'] },
          { type: 'formula', as: 'xscale', expr: "datum.x.data + 'X'" },
          { type: 'formula', as: 'yscale', expr: "datum.y.data + 'Y'" },
        ],
      },
    ],
    scales: [
      {
        name: 'xall',
        type: 'band',
        domain: { data: 'fields', field: 'data' },
        range: 'width',
      },
      {
        name: 'yall',
        type: 'band',
        domain: { data: 'fields', field: 'data' },
        range: [{ signal: 'height' }, 0],
      },
      {
        name: 'color',
        type: 'linear',
        range: { scheme: config.colGradient },
        domain: { data: 'embedding', field: 'expression' },
        reverse: config.reverseCbar,
      },
      {
        name: 'x',
        type: 'linear',
        round: true,
        nice: true,
        domain: { data: 'embedding', field: '0' },
        range: 'width',
      },
      {
        name: 'y',
        type: 'linear',
        round: true,
        nice: true,
        domain: { data: 'embedding', field: '1' },
        range: 'height',
      },
      {
        name: 'x2',
        type: 'linear',
        round: true,
        nice: true,
        domain: { data: 'embedding', field: '0' },
        range: 'width',
      },
      {
        name: 'y2',
        type: 'linear',
        round: true,
        nice: true,
        domain: { data: 'embedding', field: '1' },
        range: 'height',
      },
    ],
    axes: [
      {
        scale: 'x',
        grid: true,
        domain: true,
        orient: 'bottom',
        title: { value: config.xaxisText },
        titleFont: { value: config.masterFont },
        labelFont: { value: config.masterFont },
        labelColor: { value: config.masterColour },
        tickColor: { value: config.masterColour },
        gridColor: { value: config.masterColour },
        gridOpacity: { value: (config.transGrid / 20) },
        gridWidth: { value: (config.widthGrid / 20) },
        offset: { value: config.axesOffset },
        titleFontSize: { value: config.axisTitlesize },
        titleColor: { value: config.masterColour },
        labelFontSize: { value: config.axisTicks },
        domainWidth: { value: config.lineWidth },
        // offset: { signal: '-chartPad' },

      },
      {
        scale: 'y',
        grid: true,
        domain: true,
        orient: 'left',
        titlePadding: 5,
        gridColor: { value: config.masterColour },
        gridOpacity: { value: (config.transGrid / 20) },
        gridWidth: { value: (config.widthGrid / 20) },
        tickColor: { value: config.masterColour },
        offset: { value: config.axesOffset },
        title: { value: config.yaxisText },
        titleFont: { value: config.masterFont },
        labelFont: { value: config.masterFont },
        labelColor: { value: config.masterColour },
        titleFontSize: { value: config.axisTitlesize },
        titleColor: { value: config.masterColour },
        labelFontSize: { value: config.axisTicks },
        domainWidth: { value: config.lineWidth },
        position: 0,

      },
      {
        scale: 'x2',
        grid: true,
        domain: true,
        orient: 'bottom',
        title: { value: config.xaxisText },
        titleFont: { value: config.masterFont },
        labelFont: { value: config.masterFont },
        labelColor: { value: config.masterColour },
        tickColor: { value: config.masterColour },
        gridColor: { value: config.masterColour },
        gridOpacity: { value: (config.transGrid / 20) },
        gridWidth: { value: (config.widthGrid / 20) },
        offset: { value: config.axesOffset },
        titleFontSize: { value: config.axisTitlesize },
        titleColor: { value: config.masterColour },
        labelFontSize: { value: config.axisTicks },
        domainWidth: { value: config.lineWidth },
        // offset: { signal: '-chartPad' },

      },
      {
        scale: 'y2',
        grid: true,
        domain: true,
        orient: 'left',
        titlePadding: 5,
        gridColor: { value: config.masterColour },
        gridOpacity: { value: (config.transGrid / 20) },
        gridWidth: { value: (config.widthGrid / 20) },
        tickColor: { value: config.masterColour },
        offset: { value: config.axesOffset },
        title: { value: config.yaxisText },
        titleFont: { value: config.masterFont },
        labelFont: { value: config.masterFont },
        labelColor: { value: config.masterColour },
        titleFontSize: { value: config.axisTitlesize },
        titleColor: { value: config.masterColour },
        labelFontSize: { value: config.axisTicks },
        domainWidth: { value: config.lineWidth },
        // position: { signal: '2 * chartStep' },

      },
    ],
    marks: [
      {
        type: 'rect',
        encode: {
          enter: {
            fill: { value: '#eee' },
          },
        },
      },

      {
        name: 'cell',
        type: 'group',
        from: { data: 'cross' },

        encode: {
          enter: {
            x: { scale: 'xall', field: 'x.data' },
            y: { scale: 'yall', field: 'y.data' },
            width: { signal: 'chartSize' },
            height: { signal: 'chartSize' },
            fill: { value: 'transparent' },
            stroke: { value: '#ddd' },
          },
        },
        marks: [
          {
            type: 'symbol',
            from: { data: 'embedding' },
            encode: {
              enter: {
                x: { scale: 'x', field: '0' },
                y: { scale: 'y', field: '1' },
                size: { value: config.pointSize },
                stroke: {
                  scale: 'color',
                  field: 'expression',
                },
                fill: {
                  scale: 'color',
                  field: 'expression',
                },
                shape: { value: config.pointStyle },
                fillOpacity: { value: config.pointOpa / 10 },
              },
            },
          },
        ],
      },
      {
        type: 'rect',
        name: 'brush',
        encode: {
          enter: {
            fill: { value: 'transparent' },
          },
        },
      },
    ],
    legends: legend,
    title:
    {
      text: { value: config.titleText },
      color: { value: config.masterColour },
      anchor: { value: config.titleAnchor },
      font: { value: config.masterFont },
      dx: { value: config.bounceX },
      fontSize: { value: config.titleSize },
    },
  };
};

export {
  // eslint-disable-next-line import/prefer-default-export
  generateSpec,
};
