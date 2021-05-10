const projectTemplate = {
  name: null,
  description: null,
  metadataKeys: [],
  uuid: null,
  createdDate: null,
  lastModified: null,
  samples: [],
  lastAnalyzed: null,
  experiments: [],
};

const initialState = {
  ids: [],
  meta: {
    activeProjectUuid: null,
  },
};

export default initialState;
export { projectTemplate };
