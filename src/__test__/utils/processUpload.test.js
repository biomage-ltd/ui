import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import waitForActions from 'redux-mock-store-await-actions';
import uuid from 'uuid';

import { Storage } from 'aws-amplify';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import { SAMPLES_FILE_UPDATE } from '../../redux/actionTypes/samples';

import initialSampleState, { sampleTemplate } from '../../redux/reducers/samples/initialState';
import initialProjectState, { projectTemplate } from '../../redux/reducers/projects/initialState';

import processUpload from '../../utils/processUpload';
import UploadStatus from '../../utils/UploadStatus';

enableFetchMocks();

const validFilesList = [
  {
    name: 'WT13/features.tsv.gz',
    bundle: {
      name: 'features.tsv.gz',
      path: '/WT13/features.tsv.gz',
      type: 'application/gzip',
      valid: true,
    },
    upload: { status: UploadStatus.UPLOADING },
    errors: '',
  },
  {
    name: 'WT13/barcodes.tsv.gz',
    bundle: {
      name: 'features.tsv.gz',
      path: '/WT13/barcodes.tsv.gz',
      type: 'application/gzip',
      valid: true,
    },
    upload: { status: UploadStatus.UPLOADING },
    errors: '',
  },
  {
    name: 'WT13/matrix.mtx.gz',
    bundle: {
      name: 'features.tsv.gz',
      path: '/WT13/matrix.mtx.gz',
      type: 'application/gzip',
      valid: true,
    },
    upload: { status: UploadStatus.UPLOADING },
    errors: '',
  },
];

const sampleType = '10X Chromium';

const mockSampleUuid = 'sample-uuid';
const mockProjectUuid = 'project-uuid';

jest.mock('uuid', () => jest.fn());
uuid.v4 = jest.fn(() => 'sample-uuid');

const initialState = {
  projects: {
    ...initialProjectState,
    ids: [mockProjectUuid],
    meta: {
      activeProjectUuid: mockProjectUuid,
    },
    [mockProjectUuid]: {
      ...projectTemplate,
      samples: [mockSampleUuid],
    },
  },
  samples: {
    ...initialSampleState,
    ids: [mockSampleUuid],
    meta: {
      loading: true,
      error: false,
    },
    [mockSampleUuid]: {
      ...sampleTemplate,
      uuid: [mockSampleUuid],
      projectUuid: mockProjectUuid,
    },
  },
};

const flushPromises = () => new Promise(setImmediate);

const mockStore = configureMockStore([thunk]);

jest.mock('../../utils/loadAndCompressIfNecessary',
  () => jest.fn().mockImplementation(
    (bundle) => {
      if (!bundle.valid) {
        return Promise.reject(new Error('error'));
      }

      return Promise.resolve('loadedGzippedFile');
    },
  ));

jest.mock('../../utils/environment', () => ({
  __esModule: true,
  isBrowser: () => false,
  ssrGetCurrentEnvironment: () => 'development',
}));

jest.mock('../../redux/actions/samples/saveSamples', () => jest.fn().mockImplementation(() => ({
  type: 'samples/saved',
})));

let mockStorageCalls = [];

Storage.put = jest.fn().mockImplementation(
  (bucketKey, file) => {
    mockStorageCalls.push({ bucketKey, file });
    if (bucketKey.includes('errorProjectUuid')) {
      return Promise.reject(new Error('error'));
    }

    return Promise.resolve('Resolved');
  },
);

describe('processUpload (in development)', () => {
  afterEach(() => {
    mockStorageCalls = [];
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // eslint-disable-next-line no-param-reassign
    validFilesList.forEach((file) => { file.bundle.valid = true; });

    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockResponse(JSON.stringify({}));
  });

  it('Uploads and updates redux correctly when there are no errors', async () => {
    const store = mockStore(initialState);

    processUpload(
      validFilesList,
      sampleType,
      store.getState().samples,
      mockProjectUuid,
      store.dispatch,
    );

    // Wait for first storage puts to be made
    await waitForActions(
      store,
      new Array(6).fill(SAMPLES_FILE_UPDATE),
      { matcher: waitForActions.matchers.containing },
    );

    // Three Storage.put calls are made
    expect(mockStorageCalls.length).toBe(3);

    // Each put call is made with the correct information
    expect(mockStorageCalls[0].file).toEqual('loadedGzippedFile');
    expect(mockStorageCalls[1].file).toEqual('loadedGzippedFile');
    expect(mockStorageCalls[2].file).toEqual('loadedGzippedFile');

    // Wait until all put promises are resolved
    await flushPromises();

    const fileUpdateActions = store.getActions().filter(
      (action) => action.type === SAMPLES_FILE_UPDATE,
    );

    const uploadProperties = fileUpdateActions.map((action) => action.payload.fileDiff.upload);

    const uploadingStatusProperties = uploadProperties.filter(
      ({ status }) => status === UploadStatus.UPLOADING,
    );

    const uploadedStatusProperties = uploadProperties.filter(
      ({ status }) => status === UploadStatus.UPLOADED,
    );

    // There are 6 files actions with status uploading
    expect(uploadingStatusProperties.length).toEqual(6);

    // There are 3 files actions with status uploaded
    expect(uploadedStatusProperties.length).toEqual(3);

    // After uploading ends successfully the upload promises are removed
    uploadedStatusProperties.forEach(({ amplifyPromise }) => {
      expect(amplifyPromise).toBeNull();
    });
  });

  it('Updates redux correctly when there are file load and compress errors', async () => {
    const store = mockStore(initialState);

    // eslint-disable-next-line no-param-reassign
    validFilesList.forEach((file) => { file.bundle.valid = false; });

    processUpload(
      validFilesList,
      sampleType,
      store.getState().samples,
      mockProjectUuid,
      store.dispatch,
    );

    await waitForActions(
      store,
      new Array(6).fill(SAMPLES_FILE_UPDATE),
      { matcher: waitForActions.matchers.containing },
    );

    const fileUpdateActions = store.getActions().filter(
      (action) => action.type === SAMPLES_FILE_UPDATE,
    );

    const uploadProperties = fileUpdateActions.map((action) => action.payload.fileDiff.upload);

    const uploadingFileProperties = uploadProperties.filter(
      ({ status }) => status === UploadStatus.UPLOADING,
    );

    const errorFileProperties = uploadProperties.filter(
      ({ status }) => status === UploadStatus.FILE_READ_ERROR,
    );

    const uploadedFileProperties = uploadProperties.filter(
      ({ status }) => status === UploadStatus.UPLOADED,
    );

    // There are 3 files actions with status uploading
    expect(uploadingFileProperties.length).toEqual(3);

    // There are 3 files actions with status upload error
    expect(errorFileProperties.length).toEqual(3);

    // There are no file actions with status successfully uploaded
    expect(uploadedFileProperties.length).toEqual(0);
  });

  it('Updates redux correctly when there are file upload errors', async () => {
    const store = mockStore(initialState);

    processUpload(
      validFilesList,
      sampleType,
      store.getState().samples,
      'errorProjectUuid',
      store.dispatch,
    );

    await waitForActions(
      store,
      new Array(9).fill(SAMPLES_FILE_UPDATE),
      { matcher: waitForActions.matchers.containing, throttleWait: 20 },
    );

    const fileUpdateActions = store.getActions().filter(
      (action) => action.type === SAMPLES_FILE_UPDATE,
    );

    const uploadProperties = fileUpdateActions.map((action) => action.payload.fileDiff.upload);

    const uploadingFileProperties = uploadProperties.filter(
      ({ status }) => status === UploadStatus.UPLOADING,
    );

    const errorFileProperties = uploadProperties.filter(
      ({ status }) => status === UploadStatus.UPLOAD_ERROR,
    );

    const uploadedFileProperties = uploadProperties.filter(
      ({ status }) => status === UploadStatus.UPLOADED,
    );

    // There are 3 files actions with status uploading
    expect(uploadingFileProperties.length).toEqual(6);

    // There are 3 files actions with status upload error
    expect(errorFileProperties.length).toEqual(3);

    // There are no file actions with status successfully uploaded
    expect(uploadedFileProperties.length).toEqual(0);

    // Upload end deletes aws promise (if there was one)
    errorFileProperties.forEach(({ amplifyPromise }) => {
      expect(amplifyPromise).toBeNull();
    });
  });
});
