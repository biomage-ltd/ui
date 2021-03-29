import samplesReducer from '../../../redux/reducers/samples';
import initialState, { sampleTemplate, sampleFileTemplate } from '../../../redux/reducers/samples/initialState';

import {
  SAMPLES_CREATE, SAMPLES_UPDATE, SAMPLES_FILE_UPDATE,
} from '../../../redux/actionTypes/samples';

describe('samplesReducer', () => {
  const mockUuid1 = 'asd123';
  const mockUuid2 = 'qwe234';
  const fileName = 'features.tsv';

  const sample1 = {
    ...sampleTemplate,
    name: 'test sample',
    uuid: mockUuid1,
    createdDate: '2021-01-01T14:48:00.000Z',
    lastModified: '2021-01-01T14:48:00.000Z',
  };

  const sample2 = {
    ...sampleTemplate,
    name: 'test sample 2',
    uuid: mockUuid2,
    createdDate: '2021-01-02T14:48:00.000Z',
    lastModified: '2021-01-02T14:48:00.000Z',
  };

  const updateActionResult = {
    ...sample1,
    name: 'updated name',
  };

  const oneSampleState = {
    ...initialState,
    ids: [...initialState.ids, sample1.uuid],
    [sample1.uuid]: sample1,
  };

  const mockFile = {
    ...sampleFileTemplate,
    name: fileName,
  };

  it('Reduces identical state on unknown action', () => expect(
    samplesReducer(undefined, {
      action: 'well/this/is/not/a/valid/action',
      payload: {},
    }),
  ).toEqual(initialState));

  it('Inserts a new sample correctly', () => {
    const newState = samplesReducer(initialState, {
      type: SAMPLES_CREATE,
      payload: {
        sample: sample1,
      },
    });

    expect(newState.ids).toEqual([sample1.uuid]);
    expect(newState[sample1.uuid]).toEqual(sample1);
    expect(newState).toMatchSnapshot();
  });

  it('Adds a new sample correctly', () => {
    const newState = samplesReducer(oneSampleState, {
      type: SAMPLES_CREATE,
      payload: {
        sample: sample2,
      },
    });

    expect(newState.ids).toEqual([sample1.uuid, sample2.uuid]);
    expect(newState[sample1.uuid]).toEqual(sample1);
    expect(newState[sample2.uuid]).toEqual(sample2);
    expect(newState).toMatchSnapshot();
  });

  it('Updates a sample correctly', () => {
    const newState = samplesReducer(oneSampleState, {
      type: SAMPLES_UPDATE,
      payload: {
        sampleUuid: mockUuid1,
        sample: updateActionResult,
      },
    });

    expect(newState.ids).toEqual(oneSampleState.ids);
    expect(newState[sample1.uuid]).toEqual(updateActionResult);
  });

  it('Updates sample files correctly', () => {
    const newState = samplesReducer(oneSampleState, {
      type: SAMPLES_FILE_UPDATE,
      payload: {
        sampleUuid: mockUuid1,
        file: mockFile,
      },
    });

    console.log('new state');
    console.log(newState);

    expect(newState[sample1.uuid].fileNames).toEqual([fileName]);
    expect(newState[sample1.uuid].files[fileName]).toEqual(mockFile);
  });
});
