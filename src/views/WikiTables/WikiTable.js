import React from 'react';
import { default as WikiComponent } from './WikiTableComponent';

const Wiki = props => {
  const { history } = props;
  const year = props.match ? props.match.params.year : 2018;
  const sem = props.match ? props.match.params.semester : 1;
  const posTypeId = props.match ? parseInt(props.match.params.postype) : 1;
  const searchTitle = props.match
    ? props.match.params.searchTitle
      ? props.match.params.searchTitle
      : false
    : false;
  const searchParent = props.match
    ? props.match.params.searchParent
      ? props.match.params.searchParent
      : false
    : false;

  return (
    <WikiComponent
      posId={posTypeId}
      year={year}
      sem={sem}
      searchTitle={searchTitle}
      searchParent={searchParent}
    />
  );
};

export default Wiki;
