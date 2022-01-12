import React from 'react';
import { default as WikiComponent } from './WikiTableComponent';

const Wiki = props => {
  const { history } = props;
  const year = props.match ? props.match.params.year : 2018;
  const sem = props.match ? props.match.params.semester : 1;
  const posTypeId = props.match ? parseInt(props.match.params.postype) : 1;

  return <WikiComponent posId={posTypeId} year={year} sem={sem} />;
};

export default Wiki;
