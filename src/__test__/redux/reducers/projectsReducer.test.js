import projectsReducer from '../../../redux/reducers/projects';
import initialState, { projectTemplate } from '../../../redux/reducers/projects/initialState';

import {
  PROJECTS_CREATE,
  PROJECTS_UPDATE,
  PROJECTS_SET_ACTIVE,
  PROJECTS_DELETE,
  PROJECTS_SAVING,
  PROJECTS_SAVED,
  PROJECTS_ERROR,
  PROJECTS_RESTORE,
} from '../../../redux/actionTypes/projects';

describe('projectsReducer', () => {
  const projectUuid1 = 'project-1';
  const projectUuid2 = 'project-2';

  const project1 = {
    ...projectTemplate,
    name: 'test project',
    uuid: projectUuid1,
    description: 'this is a test description',
    createdDate: '01-01-2021',
    lastModified: '01-01-2021',
  };

  const project2 = {
    ...projectTemplate,
    name: 'test project 2',
    description: 'This is another test description :)',
    uuid: projectUuid2,
    createdDate: '01-01-2021',
    lastModified: '01-01-2021',
  };

  const updatedProject1 = {
    ...project1,
    name: 'updated name',
    lastModified: '02-01-2021',
  };

  const oneProjectState = {
    ...initialState,
    ids: [...initialState.ids, project1.uuid],
    meta: {
      activeProjectUuid: project1.uuid,
    },
    [project1.uuid]: project1,
  };

  const twoProjectsState = {
    ...oneProjectState,
    ids: [...oneProjectState.ids, project2.uuid],
    meta: {
      activeProjectUuid: project2.uuid,
    },
    [project2.uuid]: project2,
  };

  it('Reduces identical state on unknown action', () => expect(
    projectsReducer(undefined, {
      action: 'well/this/is/not/a/valid/action',
      payload: {},
    }),
  ).toEqual(initialState));

  it('Inserts a new project correctly', () => {
    const newState = projectsReducer(initialState, {
      type: PROJECTS_CREATE,
      payload: {
        project: project1,
      },
    });

    expect(newState.ids).toEqual([project1.uuid]);
    expect(newState.meta.activeProjectUuid).toEqual(project1.uuid);
    expect(newState[project1.uuid]).toEqual(project1);
    expect(newState).toMatchSnapshot();
  });

  it('Adds a new project correctly', () => {
    const newState = projectsReducer(oneProjectState, {
      type: PROJECTS_CREATE,
      payload: {
        project: project2,
      },
    });

    expect(newState.ids).toEqual([project1.uuid, project2.uuid]);
    expect(newState.meta.activeProjectUuid).toEqual(project2.uuid);
    expect(newState[project1.uuid]).toEqual(project1);
    expect(newState[project2.uuid]).toEqual(project2);
    expect(newState).toMatchSnapshot();
  });

  it('Updates a project correctly', () => {
    const newState = projectsReducer(oneProjectState, {
      type: PROJECTS_UPDATE,
      payload: {
        projectUuid: projectUuid1,
        diff: updatedProject1,
      },
    });

    expect(newState.ids).toEqual(oneProjectState.ids);
    expect(newState.meta.activeProjectUuid).toEqual(oneProjectState.meta.activeProjectUuid);
    expect(newState[project1.uuid]).toEqual(updatedProject1);
    expect(newState).toMatchSnapshot();
  });

  it('Sets an active project correctly', () => {
    const newState = projectsReducer(twoProjectsState, {
      type: PROJECTS_SET_ACTIVE,
      payload: {
        projectUuid: project2.uuid,
      },
    });

    expect(newState.ids).toEqual(twoProjectsState.ids);
    expect(newState.meta.activeProjectUuid).toEqual(project2.uuid);
    expect(newState).toMatchSnapshot();
  });

  it('Deletes projects correctly', () => {
    const newState = projectsReducer(twoProjectsState, {
      type: PROJECTS_DELETE,
      payload: { projectUuid: projectUuid2 },
    });

    expect(newState.ids).toEqual([project1.uuid]);
    expect(newState[project2.uuid]).toBeUndefined();
    expect(newState).toMatchSnapshot();
  });

  it('Sets up saving state correctly', () => {
    const newState = projectsReducer({
      ...oneProjectState,
      meta: {
        ...oneProjectState[projectUuid1].meta,
        loading: false,
        saving: false,
        error: false,
      },
    }, { type: PROJECTS_SAVING });

    expect(newState.meta.error).toBe(false);
    expect(newState.meta.loading).toBe(false);
    expect(newState.meta.saving).toBe(true);
    expect(newState).toMatchSnapshot();
  });

  it('Sets up saved state correctly', () => {
    const newState = projectsReducer({
      ...oneProjectState,
      meta: {
        ...oneProjectState[projectUuid1].meta,
        loading: false,
        saving: true,
        error: true,
      },
    }, { type: PROJECTS_SAVED });

    expect(newState.meta.error).toBe(false);
    expect(newState.meta.loading).toBe(false);
    expect(newState.meta.saving).toBe(false);
    expect(newState).toMatchSnapshot();
  });

  it('Stores error state correctly', () => {
    const errMsg = 'Error message';

    const newState = projectsReducer({
      ...oneProjectState,
      meta: {
        ...oneProjectState[projectUuid1].meta,
        loading: false,
        saving: true,
        error: false,
      },
    }, {
      type: PROJECTS_ERROR,
      payload: {
        error: errMsg,
      },
    });

    expect(newState.meta.error).not.toBe(false);
    expect(newState.meta.error).toBe(errMsg);
    expect(newState.meta.loading).toBe(false);
    expect(newState.meta.saving).toBe(false);
    expect(newState).toMatchSnapshot();
  });

  it('Restore a specific state correctly', () => {
    const newState = projectsReducer(oneProjectState, {
      type: PROJECTS_RESTORE,
      payload: {
        state: twoProjectsState,
      },
    });

    expect(newState.ids).toEqual([project1.uuid, project2.uuid]);
    expect(newState[projectUuid1]).toEqual(project1);
    expect(newState[projectUuid2]).toEqual(project2);
    expect(newState).toMatchSnapshot();
  });
});
