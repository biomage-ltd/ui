import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import {
  SAMPLES_CREATE,
} from '../../actionTypes/samples';
import {
  PROJECTS_UPDATE,
} from '../../actionTypes/projects';
import {
  DEFAULT_NA,
} from '../../reducers/projects/initialState';
import saveSamples from './saveSamples';
import { saveProject } from '../projects';
import endUserMessages from '../../../utils/endUserMessages';
import pushNotificationMessage from '../../../utils/pushNotificationMessage';

import { sampleTemplate } from '../../reducers/samples/initialState';

const createSample = (
  projectUuid,
  name,
  type,
) => async (dispatch, getState) => {
  const project = getState().projects[projectUuid];

  const createdDate = moment().toISOString();

  const newSampleUuid = uuidv4();

  const newSample = {
    ...sampleTemplate,
    name,
    type,
    projectUuid,
    uuid: newSampleUuid,
    createdDate,
    lastModified: createdDate,
    metadata: project?.metadataKeys
      .reduce((acc, curr) => ({ ...acc, [curr]: DEFAULT_NA }), {}) || {},
  };

  const newProject = {
    uuid: projectUuid,
    ...project || {},
    samples: project?.samples.includes(newSampleUuid) ? project.samples
      : [...project?.samples || [], newSampleUuid],
  };

  try {
    dispatch(saveSamples(projectUuid, newSample));
    dispatch(saveProject(projectUuid, newProject));

    dispatch({
      type: SAMPLES_CREATE,
      payload: { sample: newSample },
    });

    dispatch({
      type: PROJECTS_UPDATE,
      payload: {
        projectUuid,
        project: newProject,
      },
    });
  } catch (e) {
    pushNotificationMessage('error', endUserMessages.ERROR_SAVING);
  }

  return Promise.resolve(newSampleUuid);
};

export default createSample;
