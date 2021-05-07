/* eslint-disable no-param-reassign */
import { Storage } from 'aws-amplify';
import _ from 'lodash';
import loadAndCompressIfNecessary from './loadAndCompressIfNecessary';
import { createSample, updateSampleFile } from '../redux/actions/samples';
import UploadStatus from './UploadStatus';

const putInS3 = (bucketKey, loadedFileData, dispatch, sampleUuid, fileName) => (
  Storage.put(
    bucketKey,
    loadedFileData,
    {
      progressCallback(progress) {
        const percentProgress = Math.round((progress.loaded / progress.total) * 100);

        dispatch(updateSampleFile(sampleUuid, fileName, {
          upload: {
            status: UploadStatus.UPLOADING,
            progress: percentProgress ?? 0,
          },
        }));
      },
    },
  )
);

const compressAndUploadSingleFile = async (bucketKey, sampleUuid, fileName, bundle, dispatch) => {
  dispatch(
    updateSampleFile(
      sampleUuid,
      fileName,
      { bundle, upload: { status: UploadStatus.UPLOADING, progress: 0 } },
    ),
  );

  let loadedFile = null;

  try {
    loadedFile = await loadAndCompressIfNecessary(bundle);
  } catch (e) {
    const fileErrorStatus = e === 'aborted' ? UploadStatus.FILE_READ_ABORTED : UploadStatus.FILE_READ_ERROR;

    dispatch(
      updateSampleFile(
        sampleUuid,
        fileName,
        { upload: { status: fileErrorStatus } },
      ),
    );
  }

  try {
    await putInS3(bucketKey, loadedFile, dispatch, sampleUuid, fileName);
  } catch (e) {
    dispatch(
      updateSampleFile(
        sampleUuid,
        fileName,
        { upload: { status: UploadStatus.UPLOAD_ERROR } },
      ),
    );
  }

  dispatch(
    updateSampleFile(
      sampleUuid,
      fileName,
      { upload: { status: UploadStatus.UPLOADED } },
    ),
  );
};

const compressAndUpload = (sample, activeProjectUuid, dispatch) => {
  const updatedSampleFiles = Object.entries(sample.files).reduce((result, [fileName, file]) => {
    const uncompressed = file.bundle.type !== 'application/gzip';

    const newFileName = uncompressed ? `${fileName}.gz` : fileName;
    const newFile = {
      ...file,
      name: newFileName,
    };

    result[newFileName] = newFile;

    return result;
  }, {});

  Object.entries(updatedSampleFiles).forEach(async ([fileName, file]) => {
    const bucketKey = `${activeProjectUuid}/${sample.uuid}/${fileName}`;

    await compressAndUploadSingleFile(bucketKey, sample.uuid, fileName, file.bundle, dispatch);
  });

  return updatedSampleFiles;
};

const processUpload = async (filesList, sampleType, samples, activeProjectUuid, dispatch) => {
  const samplesMap = filesList.reduce((acc, file) => {
    const pathToArray = file.name.trim().replace(/[\s]{2,}/ig, ' ').split('/');

    const sampleName = pathToArray[0];
    const fileName = _.last(pathToArray);

    // Update the file name so that instead of being saved as
    // e.g. WT13/matrix.tsv.gz, we save it as matrix.tsv.gz
    file.name = fileName;

    const sampleUuid = Object.values(samples).filter(
      (s) => s.name === sampleName
        && s.projectUuid === activeProjectUuid,
    )[0]?.uuid;

    return {
      ...acc,
      [sampleName]: {
        ...acc[sampleName],
        uuid: sampleUuid,
        files: {
          ...acc[sampleName]?.files,
          [fileName]: file,
        },
      },
    };
  }, {});

  Object.entries(samplesMap).forEach(async ([name, sample]) => {
    // Create sample if not exists
    if (!sample.uuid) {
      sample.uuid = await dispatch(createSample(activeProjectUuid, name, sampleType));
    }

    sample.files = compressAndUpload(sample, activeProjectUuid, dispatch);

    Object.values(sample.files).forEach((file) => {
      // Create files
      dispatch(updateSampleFile(sample.uuid, file.name, {
        ...file,
        path: `${activeProjectUuid}/${file.name.replace(name, sample.uuid)}`,
      }));
    });
  });
};

export { compressAndUploadSingleFile };
export default processUpload;
