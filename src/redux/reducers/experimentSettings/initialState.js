export default {
  processing: {
    initialState: true,
    meta: {
      complete: false,
      stepsDone: new Set([]),
      errorMessage: null,
    },
    dataIntegration: {
      dataIntegration: {
        method: 'seuratv4',
        methodSettings: {
          seuratv4: {
            numGenes: 2000,
            normalisation: 'logNormalise',
          },
        },
      },
      dimensionalityReduction: {
        method: 'rpca',
        numPCs: 30,
        variationExplained: 91,
        excludeGeneCategories: [],
      },
      errorMessage: null,
    },
    configureEmbedding: {
      embeddingSettings: {
        method: 'umap',
        methodSettings: {
          umap: {
            minimumDistance: 0.1,
            distanceMetric: 'euclidean',
          },
          tsne: {
            perplexity: 30,
            learningRate: 200,
          },
        },
      },
      clusteringSettings: {
        method: 'louvain',
        methodSettings: {
          louvain: {
            resolution: 0.5,
          },
        },
      },
      errorMessage: null,
    },
  },
};
