import projectsReducer from '../../../redux/reducers/projects';
import initialState, { projectTemplate } from '../../../redux/reducers/projects/initialState';

import {
  PROJECTS_CREATE, PROJECTS_UPDATE, PROJECTS_SET_ACTIVE,
} from '../../../redux/actionTypes/projects';

describe('projectsReducer', () => {
  const project1 = {
    ...projectTemplate,
    name: 'test project',
    description: 'this is a test description',
    uuid: '12345',
    createdDate: '01-01-2021',
    lastModified: '01-01-2021',
  };

  const project2 = {
    ...projectTemplate,
    name: 'test project 2',
    description: 'This is another test description :)',
    uuid: '67890',
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
      activeProject: project1.uuid,
    },
    [project1.uuid]: project1,
  };

  const twoProjectsState = {
    ...oneProjectState,
    ids: [...oneProjectState.ids, project2.uuid],
    meta: {
      activeProject: project2.uuid,
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
    expect(newState.meta.activeProject).toEqual(project1.uuid);
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
    expect(newState.meta.activeProject).toEqual(project2.uuid);
    expect(newState[project1.uuid]).toEqual(project1);
    expect(newState[project2.uuid]).toEqual(project2);
    expect(newState).toMatchSnapshot();
  });

  it('Updates a project correctly', () => {
    const newState = projectsReducer(oneProjectState, {
      type: PROJECTS_UPDATE,
      payload: {
        project: updatedProject1,
      },
    });

    expect(newState.ids).toEqual(oneProjectState.ids);
    expect(newState.meta.activeProject).toEqual(oneProjectState.meta.activeProject);
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
    expect(newState.meta.activeProject).toEqual(project2.uuid);
    expect(newState).toMatchSnapshot();
  });
});
