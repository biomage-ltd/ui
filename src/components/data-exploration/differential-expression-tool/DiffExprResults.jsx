import React, { useState, useEffect } from 'react';
import {
  useSelector,
  useDispatch,
} from 'react-redux';
import {
  Space, Button, Alert, Tooltip,
} from 'antd';
import Link from 'next/link';
import { LeftOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import GeneTable from '../generic-gene-table/GeneTable';
import { geneTableUpdateReason } from '../../../utils/geneTable/geneTableUpdateReason';
import loadDifferentialExpression from '../../../redux/actions/differentialExpression/loadDifferentialExpression';

const DiffExprResults = (props) => {
  const {
    experimentId, onGoBack, width, height,
  } = props;

  const dispatch = useDispatch();
  const loading = useSelector((state) => state.differentialExpression.properties.loading);
  const data = useSelector((state) => state.differentialExpression.properties.data);
  const total = useSelector((state) => state.differentialExpression.properties.total);
  const error = useSelector((state) => state.differentialExpression.properties.error);
  const comparisonGroup = useSelector((state) => state.differentialExpression.comparison.group);
  const comparisonType = useSelector((state) => state.differentialExpression.comparison.type);

  const [dataShown, setDataShown] = useState(data);
  const [exportAlert, setExportAlert] = useState(false);
  const [settingsListed, setSettingsListed] = useState(false);

  const columns = [
    {
      title: 'Avg log2FC',
      key: 'avg_log2FC',
      sorter: true,
    },
    {
      title: 'adj p-value',
      key: 'p_val_adj',
      sorter: true,
      render: (score, record) => <Tooltip title={`adj p-value: ${record.qval}`}>{score}</Tooltip>,
    },
    {
      title: 'Pct 1',
      key: 'pct_1',
      sorter: true,
    },
    {
      title: 'Pct 2',
      key: 'pct_2',
      sorter: true,
    },
  ];
  // When data changes, update rows.
  useEffect(() => {
    if (data) {
      setDataShown(data);
    }
  }, [data]);

  const isTableLoading = () => data.length === 0 || loading;

  const onUpdate = (newState, reason) => {
    // We handle `loading` and `loaded` in the HOC, no need to react to these.
    if (reason === geneTableUpdateReason.loaded || reason === geneTableUpdateReason.loading) {
      return;
    }

    dispatch(
      loadDifferentialExpression(
        experimentId,
        comparisonGroup[comparisonType],
        comparisonType,
        newState,
      ),
    );
  };
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const optionName = (word) => (
    <span style={{ color: 'red' }}>
      {capitalize(word.split('/').pop().replace('-', ' '))}
    </span>
  );
  const { basis, cellSet, compareWith } = comparisonGroup[comparisonType];

  const renderExportAlert = () => {
    if (!exportAlert) return null;
    return (
      <Alert
        message={(
          <span>
            Exporting to CSV is not currently available here. Use the&nbsp;
            <Link
              target='_blank'
              as={`/experiments/${experimentId}/plots-and-tables/volcano`}
              href='/experiments/[experimentId]/plots-and-tables/volcano'
              passHref
            >
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a target='_blank'>volcano plot</a>
            </Link>
            &nbsp;in Plots and Tables to dump results (opens in new tab).
          </span>
        )}
        type='info'
        closable
        showIcon
        afterClose={() => {
          setExportAlert(false);
        }}
      />
    );
  };

  return (
    <Space direction='vertical' style={{ width: '100%' }}>

      {/* This is needed so changes to the export alert don't cause the table to re-render. */}
      <Space direction='vertical' style={{ width: '100%' }}>
        <Button size='small' onClick={onGoBack}>
          <span>
            <LeftOutlined />
            Go back
          </span>
        </Button>
        {renderExportAlert()}
        <Button id='settingsButton' onClick={() => setSettingsListed(!settingsListed)}>
          {settingsListed ? 'Hide' : 'Show'}
          {' '}
          settings
        </Button>
      </Space>
      {settingsListed
        ? (
          <div id='settingsText'>
            {optionName(cellSet)}
            {' '}
            vs.
            {' '}
            {optionName(compareWith)}
            {' '}
            in
            {' '}
            {optionName(basis)}
          </div>
        ) : <div />}
      <GeneTable
        experimentId={experimentId}
        initialTableState={{
          sorter: {
            field: 'abszscore',
            columnKey: 'abszscore',
            order: 'descend',
          },
        }}
        onUpdate={onUpdate}
        columns={columns}
        loading={isTableLoading()}
        onExportCSV={() => { setExportAlert(true); }}
        error={error}
        width={width}
        height={height - 70 - (exportAlert ? 70 : 0)}
        data={dataShown}
        total={total}
      />
    </Space>
  );
};

DiffExprResults.defaultProps = {};

DiffExprResults.propTypes = {
  experimentId: PropTypes.string.isRequired,
  onGoBack: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default DiffExprResults;
