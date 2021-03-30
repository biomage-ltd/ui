import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Card, Space, Descriptions,
} from 'antd';
import { blue } from '@ant-design/colors';
import EditableField from '../EditableField';

// eslint-disable-next-line import/no-extraneous-dependencies

import ProjectDeleteModal from './ProjectDeleteModal';
import FileUploadModal from './FileUploadModal';
import { setActiveProject, updateProject, deleteProject as deleteProjectAction } from '../../redux/actions/projects';
import PrettyTime from '../PrettyTime';
import { createSample, updateSampleFile } from '../../redux/actions/samples';

const ProjectsListContainer = (props) => {
  const { height } = props;
  const dispatch = useDispatch();

  const projects = useSelector((state) => state.projects);
  const samples = useSelector((state) => state.samples);
  const { activeProject } = projects.meta;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteProjectUuid, setDeleteProjectUuid] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(true);

  useEffect(() => {
    setUploadModalVisible(projects[activeProject]?.samples.length === 0);
  }, [activeProject]);

  const activeProjectStyle = {
    backgroundColor: blue[0],
    cursor: 'pointer',
    border: `2px solid ${blue.primary}`,
  };

  const uploadFiles = (filesList, sampleType) => {
    const samplesMap = filesList.reduce((acc, file) => {
      const sampleName = file.name.trim().replace(/[\s]{2,}/ig, ' ').split('/')[0];
      const sampleUuid = Object.values(samples).filter(
        (s) => s.name === sampleName
          && s.projectUuid === activeProject,
      )[0]?.uuid;

      return {
        ...acc,
        [sampleName]: {
          ...acc[sampleName],
          uuid: sampleUuid,
          files: {
            ...acc[sampleName]?.files,
            [sampleName]: file,
          },
        },
      };
    }, {});

    Object.entries(samplesMap).forEach(async ([name, sample]) => {
      // Create sample if not exists
      if (!sample.uuid) {
        // eslint-disable-next-line no-param-reassign
        sample.uuid = await dispatch(createSample(activeProject, name, sampleType));
      }

      Object.values(sample.files).forEach((file) => {
        dispatch(updateSampleFile(sample.uuid, {
          ...file,
          path: `${activeProject}/${file.name.replace(name, sample.uuid)}`,
        }));
      });
    });

    setUploadModalVisible(false);
  };

  const deleteProject = () => {
    dispatch(deleteProjectAction(deleteProjectUuid));
    setDeleteModalVisible(false);
  };

  return (
    <>
      <FileUploadModal
        visible={uploadModalVisible}
        onCancel={() => { setUploadModalVisible(false); }}
        onUpload={uploadFiles}
      />
      <ProjectDeleteModal
        visible={deleteModalVisible}
        onCancel={() => { setDeleteModalVisible(false); }}
        onDelete={deleteProject}
        projectName={projects[deleteProjectUuid]?.name}
      />

      <Space direction='vertical' style={{ width: '100%', height: height - 90 }}>
        {
          projects.ids.map((uuid) => (
            <Card
              key={uuid}
              type='primary'
              style={activeProject === uuid ? activeProjectStyle : { cursor: 'pointer' }}

              onClick={() => {
                dispatch(setActiveProject(uuid));
                setUploadModalVisible(projects[uuid].samples.length === 0);
              }}
            >
              <Descriptions
                layout='horizontal'
                size='small'
                column={1}
                colon=''
                title={(
                  <EditableField
                    value={projects[uuid].name}
                    onAfterSubmit={(name) => {
                      dispatch(updateProject(uuid, { name }));
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      setDeleteProjectUuid(uuid);
                      setDeleteModalVisible(true);
                    }}
                  />
                )}
              >
                <Descriptions.Item
                  labelStyle={{ fontWeight: 'bold' }}
                  label='Samples'
                >
                  {projects[uuid].samples.length}

                </Descriptions.Item>
                <Descriptions.Item
                  labelStyle={{ fontWeight: 'bold' }}
                  label='Created'
                >
                  <PrettyTime isoTime={projects[uuid].createdDate} />

                </Descriptions.Item>
                <Descriptions.Item
                  labelStyle={{ fontWeight: 'bold' }}
                  label='Modified'
                >
                  <PrettyTime isoTime={projects[uuid].lastModified} />

                </Descriptions.Item>
                <Descriptions.Item
                  labelStyle={{ fontWeight: 'bold' }}
                  label='Last analyzed'
                >
                  {projects[uuid].lastAnalyzed ? (
                    <PrettyTime isoTime={projects[uuid].lastAnalyzed} />
                  ) : ('never')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ))
        }
      </Space>
    </>
  );
};

ProjectsListContainer.propTypes = {
  height: PropTypes.number,
};

ProjectsListContainer.defaultProps = {
  height: 800,
};

export default ProjectsListContainer;
