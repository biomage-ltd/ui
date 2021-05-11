import React, { useState, useEffect, useRef } from 'react';
import {
  Table, Typography, Space, Tooltip, PageHeader, Button, Input, Progress,
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import {
  UploadOutlined, EditOutlined, FileSearchOutlined,
} from '@ant-design/icons';
import _ from 'lodash';
import PropTypes from 'prop-types';
import useSWR from 'swr';
import { saveAs } from 'file-saver';
import { Storage } from 'aws-amplify';
import SpeciesSelector from './SpeciesSelector';
import MetadataEditor from './MetadataEditor';
import EditableField from '../EditableField';
import FileUploadModal from './FileUploadModal';
import UploadDetailsModal from './UploadDetailsModal';
import MetadataPopover from './MetadataPopover';

import getFromApiExpectOK from '../../utils/getFromApiExpectOK';
import {
  deleteSamples, updateSample,
} from '../../redux/actions/samples';
import {
  updateProject,
  createMetadataTrack,
  updateMetadataTrack,
  deleteMetadataTrack,
} from '../../redux/actions/projects';
import processUpload, { compressAndUploadSingleFile, metadataFor } from '../../utils/processUpload';
import validateSampleName from '../../utils/validateSampleName';
import { metadataNameToKey, metadataKeyToName, temporaryMetadataKey } from '../../utils/metadataUtils';

import UploadStatus, { messageFor } from '../../utils/UploadStatus';

import '../../utils/css/hover.css';

const { Text, Paragraph } = Typography;

const ProjectDetails = ({ width, height }) => {
  const defaultNA = 'N.A.';

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadDetailsModalVisible, setUploadDetailsModalVisible] = useState(false);
  const uploadDetailsModalDataRef = useRef(null);

  const [isAddingMetadata, setIsAddingMetadata] = useState(false);
  const dispatch = useDispatch();

  const { data: speciesData } = useSWR(
    'https://biit.cs.ut.ee/gprofiler/api/util/organisms_list/',
    getFromApiExpectOK,
  );
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [sortedSpeciesData, setSortedSpeciesData] = useState([]);
  const projects = useSelector((state) => state.projects);
  const samples = useSelector((state) => state.samples);
  const { activeProjectUuid } = useSelector((state) => state.projects.meta) || false;
  const activeProject = useSelector((state) => state.projects[activeProjectUuid]) || false;
  const [sampleNames, setSampleNames] = useState(new Set());

  const uploadFiles = (filesList, sampleType) => {
    processUpload(filesList, sampleType, samples, activeProjectUuid, dispatch);
    setUploadModalVisible(false);
  };

  useEffect(() => {
    if (activeProject) {
      setSampleNames(new Set(activeProject.samples.map((id) => samples[id].name.trim())));
    } else {
      setSampleNames([]);
    }
  }, [samples, activeProject]);

  useEffect(() => {
    if (!speciesData) {
      return;
    }

    const commonSpecies = ['hsapiens', 'mmusculus', 'drerio', 'ggallus'];

    const d = [...speciesData].sort((a, b) => {
      const indexOfA = commonSpecies.indexOf(a.id);
      const indexOfB = commonSpecies.indexOf(b.id);

      if (indexOfA > -1 && indexOfB > -1) {
        return indexOfA - indexOfB;
      }

      if (indexOfA > -1) {
        return -1;
      }

      if (indexOfB > -1) {
        return 1;
      }

      return a.scientific_name.localeCompare(b.scientific_name);
    });

    setSortedSpeciesData(d);
  }, [speciesData]);

  const renderUploadCell = (columnId, tableCellData) => {
    const {
      sampleUuid,
      file,
    } = tableCellData;

    const { status = null, progress = null } = file?.upload ?? {};

    const showSuccessDetails = () => {
      uploadDetailsModalDataRef.current = {
        sampleUuid,
        file,
      };

      setUploadDetailsModalVisible(true);
    };

    const showErrorDetails = () => {
      uploadDetailsModalDataRef.current = {
        sampleUuid,
        file,
      };

      setUploadDetailsModalVisible(true);
    };

    if (status === UploadStatus.UPLOADED) {
      return (
        <Space
          onClick={showSuccessDetails}
          onKeyDown={showSuccessDetails}
        >
          <div
            style={{
              whiteSpace: 'nowrap',
              height: '35px',
              minWidth: '90px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            className='hoverSelectCursor'
          >
            <Text type='success'>{messageFor(status)}</Text>
            <FileSearchOutlined style={{ marginLeft: '10px' }} />
          </div>
        </Space>
      );
    }

    if (status === UploadStatus.UPLOADING) {
      return (
        <div style={{
          whiteSpace: 'nowrap',
          height: '35px',
          minWidth: '90px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        >
          <Space direction='vertical' size={[1, 1]}>
            <Text type='warning'>{`${messageFor(status)}`}</Text>
            {progress ? (<Progress percent={progress} size='small' />) : <div />}
          </Space>
        </div>
      );
    }

    if (status === UploadStatus.UPLOAD_ERROR) {
      return (
        <Space>
          <div
            className='hoverSelectCursor'
            onClick={showErrorDetails}
            onKeyDown={showErrorDetails}
            style={{
              whiteSpace: 'nowrap',
              height: '35px',
              minWidth: '90px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text type='danger'>{messageFor(status)}</Text>
            <FileSearchOutlined style={{ marginLeft: '10px' }} />
          </div>
        </Space>
      );
    }

    if (
      [
        UploadStatus.FILE_NOT_FOUND,
        UploadStatus.FILE_READ_ABORTED,
        UploadStatus.FILE_READ_ERROR,
      ].includes(status)
    ) {
      return (
        <div style={{
          whiteSpace: 'nowrap',
          height: '35px',
          minWidth: '90px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        >
          <Space>
            <Tooltip placement='bottom' title='Upload missing' mouseLeaveDelay={0}>
              <Button
                size='small'
                shape='link'
                icon={<UploadOutlined />}
                onClick={() => setUploadModalVisible(true)}
              />
            </Tooltip>
          </Space>
        </div>
      );
    }

    if (status === UploadStatus.DATA_MISSING) {
      return (
        <div style={{ whiteSpace: 'nowrap', height: '35px', minWidth: '90px' }}>
          <Space>
            <Text type='danger'>Data missing</Text>
            <MetadataEditor size='small' shape='link' icon={<EditOutlined />}>
              {_.find(tableColumns, { dataIndex: columnId }).fillInBy}
            </MetadataEditor>
          </Space>
        </div>
      );
    }
  };

  const renderEditableFieldCell = (
    initialText,
    cellText,
    record,
    dataIndex,
    rowIdx,
    onAfterSubmit,
  ) => (
    <div key={`cell-${dataIndex}-${rowIdx}`} style={{ whiteSpace: 'nowrap' }}>
      <Space>
        <EditableField
          deleteEnabled={false}
          value={cellText || initialText}
          onAfterSubmit={(value) => onAfterSubmit(value, cellText, record, dataIndex, rowIdx)}
        />
      </Space>
    </div>
  );

  const renderSampleCells = (text, record, idx) => (
    <Text strong key={`sample-cell-${idx}`}>
      <EditableField
        deleteEnabled
        value={text}
        onAfterSubmit={(name) => dispatch(updateSample(record.uuid, { name }))}
        onDelete={() => dispatch(deleteSamples(record.uuid))}
        validationFunc={(name) => validateSampleName(name, sampleNames)}
      />
    </Text>
  );

  const createMetadataColumn = () => {
    const key = temporaryMetadataKey(tableColumns);

    const metadataColumn = {
      key,
      fixed: 'right',
      title: () => (
        <MetadataPopover
          existingMetadata={activeProject.metadataKeys}
          onCreate={(name) => {
            const newMetadataColumn = createInitializedMetadataColumn(name);
            setTableColumns([...tableColumns, newMetadataColumn]);
            dispatch(createMetadataTrack(name, activeProjectUuid));
            setIsAddingMetadata(false);
          }}
          onCancel={() => {
            deleteMetadataColumn(key);
            setIsAddingMetadata(false);
          }}
          message='Provide new metadata track name'
          visible
        >
          <Space>
            New Metadata Track
          </Space>
        </MetadataPopover>
      ),
      fillInBy: <Input />,
      width: 200,
    };

    setTableColumns([...tableColumns, metadataColumn]);
  };

  const deleteMetadataColumn = (name) => {
    setTableColumns([...tableColumns.filter((entryName) => entryName !== name)]);
    dispatch(deleteMetadataTrack(name, activeProjectUuid));
  };

  const createInitializedMetadataColumn = (name) => {
    const key = metadataNameToKey(name);

    const newMetadataColumn = {
      key,
      title: () => (
        <Space>
          <EditableField
            deleteEnabled
            onDelete={(e, currentName) => deleteMetadataColumn(currentName)}
            onAfterSubmit={(newName) => dispatch(
              updateMetadataTrack(name, newName, activeProjectUuid),
            )}
            value={name}
          />
          <MetadataEditor
            onReplaceEmpty={(value) => {
              activeProject.samples.forEach(
                (sampleUuid) => {
                  if (
                    !samples[sampleUuid].metadata[key]
                    || samples[sampleUuid].metadata[key] === defaultNA
                  ) {
                    dispatch(updateSample(sampleUuid, { metadata: { [key]: value } }));
                  }
                },
              );
            }}
            onReplaceAll={(value) => {
              activeProject.samples.forEach(
                (sampleUuid) => dispatch(updateSample(sampleUuid, { metadata: { [key]: value } })),
              );
            }}
            onClearAll={() => {
              activeProject.samples.forEach(
                (sampleUuid) => dispatch(updateSample(sampleUuid, { metadata: { [key]: defaultNA } })),
              );
            }}
            massEdit
          >
            <Input />
          </MetadataEditor>
        </Space>
      ),
      fillInBy: <Input />,
      width: 200,
      dataIndex: key,
      render: (cellValue, record, rowIdx) => renderEditableFieldCell(
        defaultNA,
        cellValue,
        record,
        key,
        rowIdx,
        (newValue) => {
          dispatch(updateSample(record.uuid, { metadata: { [key]: newValue } }));
        },
      ),
    };
    return newMetadataColumn;
  };

  const columns = [
    {
      key: 'sample',
      title: 'Sample',
      dataIndex: 'name',
      fixed: true,
      render: renderSampleCells,
    },
    {
      key: 'barcodes',
      title: 'Barcodes.csv',
      dataIndex: 'barcodes',
      render: (tableCellData) => renderUploadCell('barcodes', tableCellData),
    },
    {
      key: 'genes',
      title: 'Genes.csv',
      dataIndex: 'genes',
      render: (tableCellData) => renderUploadCell('genes', tableCellData),
    },
    {
      key: 'matrix',
      title: 'Matrix.mtx',
      dataIndex: 'matrix',
      render: (tableCellData) => renderUploadCell('matrix', tableCellData),
    },
    {
      key: 'species',
      title: () => (
        <Space>
          <Text>Species</Text>
          <MetadataEditor
            onReplaceEmpty={(value) => {
              activeProject.samples.forEach(
                (sampleUuid) => {
                  if (
                    !samples[sampleUuid].species
                    || samples[sampleUuid].species === defaultNA
                  ) {
                    dispatch(updateSample(sampleUuid, { species: value }));
                  }
                },
              );
            }}
            onReplaceAll={(value) => {
              activeProject.samples.forEach(
                (sampleUuid) => dispatch(updateSample(sampleUuid, { species: value })),
              );
            }}
            onClearAll={() => {
              activeProject.samples.forEach(
                (sampleUuid) => dispatch(updateSample(sampleUuid, { species: defaultNA })),
              );
            }}
            massEdit
          >
            <SpeciesSelector data={sortedSpeciesData} />
          </MetadataEditor>
        </Space>
      ),
      fillInBy: <SpeciesSelector data={sortedSpeciesData} />,
      dataIndex: 'species',
      render: (text, record, rowIdx) => renderEditableFieldCell(
        defaultNA,
        text,
        record,
        'species',
        rowIdx,
        (newValue) => dispatch(updateSample(record.uuid, { species: newValue })),
      ),
      width: 200,
    },
  ];

  useEffect(() => {
    if (projects.ids.length === 0 || samples.ids.length === 0) {
      setTableData([]);
      setTableColumns([]);
      return;
    }

    // Set table columns
    const metadataColumns = activeProject?.metadataKeys.map(
      (metadataKey) => createInitializedMetadataColumn(metadataKeyToName(metadataKey)),
    ) || [];

    setTableColumns([...columns, ...metadataColumns]);

    // Set table data
    const newData = activeProject.samples.map((sampleUuid, idx) => {
      const sampleFiles = samples[sampleUuid].files;

      const barcodesFile = sampleFiles['barcodes.tsv.gz'] ?? { status: UploadStatus.FILE_NOT_FOUND };
      const genesFile = sampleFiles['features.tsv.gz'] ?? { status: UploadStatus.FILE_NOT_FOUND };
      const matrixFile = sampleFiles['matrix.mtx.gz'] ?? { status: UploadStatus.FILE_NOT_FOUND };

      const barcodesData = { sampleUuid, file: barcodesFile };
      const genesData = { sampleUuid, file: genesFile };
      const matrixData = { sampleUuid, file: matrixFile };

      return {
        key: idx,
        name: samples[sampleUuid].name,
        uuid: sampleUuid,
        barcodes: barcodesData,
        genes: genesData,
        matrix: matrixData,
        species: samples[sampleUuid].species || defaultNA,
        ...samples[sampleUuid].metadata,
      };
    });

    setTableData(newData);
  }, [projects, samples, activeProjectUuid]);

  const changeDescription = (description) => {
    dispatch(updateProject(activeProjectUuid, { description }));
  };

  const uploadFileBundle = (bundleToUpload) => {
    if (!uploadDetailsModalDataRef.current) {
      return;
    }

    const { sampleUuid, file } = uploadDetailsModalDataRef.current;

    const bucketKey = `${activeProjectUuid}/${sampleUuid}/${file.name}`;

    const metadata = metadataFor(bundleToUpload);

    compressAndUploadSingleFile(
      bucketKey, sampleUuid, file.name,
      bundleToUpload, dispatch, metadata,
    );

    setUploadDetailsModalVisible(false);
  };

  const downloadFile = async () => {
    const { sampleUuid, file } = uploadDetailsModalDataRef.current;
    const bucketKey = `${activeProjectUuid}/${sampleUuid}/${file.name}`;

    const downloadedS3Object = await Storage.get(bucketKey, { download: true });

    const bundleName = file?.bundle.name;
    const fileNameToSaveWith = bundleName.endsWith('.gz') ? bundleName : `${bundleName}.gz`;

    saveAs(downloadedS3Object.Body, fileNameToSaveWith);
  };

  return (
    <>
      <FileUploadModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onUpload={uploadFiles}
      />
      <UploadDetailsModal
        sampleName={samples[uploadDetailsModalDataRef.current?.sampleUuid]?.name}
        file={uploadDetailsModalDataRef.current?.file}
        visible={uploadDetailsModalVisible}
        onUpload={uploadFileBundle}
        onDownload={downloadFile}
        onCancel={() => setUploadDetailsModalVisible(false)}
      />
      <div width={width} height={height}>
        <PageHeader
          title={activeProject.name}
          extra={[
            <Button
              disabled={projects.ids.length === 0}
              onClick={() => setUploadModalVisible(true)}
            >
              Add samples
            </Button>,
            <Button
              disabled={
                projects.ids.length === 0
                || activeProject?.samples.length === 0
                || isAddingMetadata
              }
              onClick={() => {
                setIsAddingMetadata(true);
                createMetadataColumn();
              }}
            >
              Add metadata
            </Button>,
            <Button
              type='primary'
              disabled={
                projects.ids.length === 0
                || activeProject?.samples.length === 0
              }
            >
              Launch analysis
            </Button>,
          ]}
        >
          {
            activeProjectUuid && (
              <Space direction='vertical' size='small'>
                <Text strong>Description:</Text>
                <Paragraph
                  editable={{ onChange: changeDescription }}
                >
                  {activeProject.description}

                </Paragraph>
              </Space>
            )
          }
        </PageHeader>

        <Table
          size='small'
          scroll={{
            x: 'max-content',
            y: height - 250,
          }}
          bordered
          columns={tableColumns}
          dataSource={tableData}
          sticky
          pagination={false}
        />
      </div>
    </>
  );
};

ProjectDetails.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default ProjectDetails;
