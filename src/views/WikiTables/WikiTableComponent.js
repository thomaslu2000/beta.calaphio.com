import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { unsanitize, clean } from '../functions';
import PropTypes from 'prop-types';
import { useGlobal } from 'reactn';
import axios from 'axios';
import { positionTypes } from './PosTypes';

const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4),
    textAlign: 'center'
  }
}));

const WikiTableComponent = props => {
  const classes = useStyles();
  const {
    showDelete,
    posId,
    year,
    sem,
    posIdx,
    updated,
    searchTitle,
    searchParent,
    history
  } = props;
  const [data, setData] = useState([]);
  const posType = posIdx
    ? positionTypes[posIdx]
    : posId
    ? positionTypes.find(x => x.id === posId)
    : positionTypes[0];
  const [updated2, setUpdated2] = useState(1);
  const ref = useRef(null);
  const [global] = useGlobal();

  const getPositions = async e => {
    if (!searchTitle && !searchParent) {
      axios
        .get(`${API_URL}/wiki/positions`, {
          params: { year, sem, posType: posType.id }
        })
        .then(response => {
          setData(response.data);
        });
    } else {
      let newSearchParent = searchParent || '';
      let newSearchTitle = searchTitle || '';
      newSearchParent = newSearchParent.replaceAll('*', '%');
      newSearchTitle = newSearchTitle.replaceAll('*', '%');
      axios
        .get(`${API_URL}/wiki/searchParent`, {
          params: {
            year,
            sem,
            searchParent: newSearchParent,
            searchTitle: newSearchTitle,
            posType: posType.id
          }
        })
        .then(response => {
          // console.log(response.data);
          setData(response.data);
        });
    }
  };

  const deletePosition = async simpleId => {
    axios
      .post(
        `${API_URL}/wiki/deletePosition`,
        {
          simpleId,
          userId: global.userId,
          token: global.token,
          API_SECRET
        },
        {
          headers: { 'content-type': 'application/x-www-form-urlencoded' }
        }
      )
      .then(res => {
        setUpdated2(updated2 + 1);
      });
  };

  useEffect(() => {
    getPositions();
  }, [updated, updated2, sem, year, posType]);

  useEffect(() => {
    if (data.length > 0)
      window.parent.postMessage(
        {
          message: `wikitable-${year}-${sem}-${posId}`,
          value: ref.current.clientHeight
        },
        '*'
      );
  });

  return (
    <TableContainer
      style={{ overflowX: 'auto', backgroundColor: 'white' }}
      ref={ref}>
      <Table className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCell align="left">Name</TableCell>
            <TableCell align="left">
              {posType.title || 'Position Name'}
            </TableCell>
            <TableCell align="left">
              {posType.parent || 'Position Parent'}
            </TableCell>
            {showDelete && <TableCell align="left">Delete</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((entry, i) => {
            return (
              <TableRow key={'row' + i}>
                <TableCell align="left">
                  <IconButton
                    onClick={() => {
                      window.open(
                        `https://beta.calaphio.com/#/account/${entry.user_id}`,
                        '_blank'
                      );
                      // history.push(`/account/${entry.user_id}`);
                    }}>
                    <Typography color="primary" gutterBottom variant="h5">
                      {entry.name}
                    </Typography>
                  </IconButton>
                </TableCell>
                <TableCell align="left">
                  <Typography gutterBottom variant="h5">
                    {unsanitize(entry.title)}
                  </Typography>
                </TableCell>
                <TableCell align="left">
                  <Typography gutterBottom variant="h5">
                    {unsanitize(entry.parent)}
                  </Typography>
                </TableCell>
                {showDelete && (
                  <TableCell align="left">
                    <IconButton
                      onClick={() => {
                        if (
                          window.confirm(
                            `Remove ${unsanitize(entry.name)} as ${unsanitize(
                              entry.title
                            )} under ${unsanitize(entry.parent)}?`
                          )
                        ) {
                          deletePosition(entry.simple_id);
                        }
                      }}>
                      <Typography color="primary" gutterBottom variant="h5">
                        ❌
                      </Typography>
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default withRouter(WikiTableComponent);
