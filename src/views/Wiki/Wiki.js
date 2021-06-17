import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField
} from '@material-ui/core';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { unsanitize, clean } from '../functions';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useGlobal } from 'reactn';
import axios from 'axios';

const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4),
    textAlign: 'center'
  }
}));

const Search = props => {
  const classes = useStyles();
  const { history } = props;
  const [global] = useGlobal();

  const pageId = props.match ? props.match.params.pageId : false;

  const [data, setData] = useState([]);
  const [newPage, setNewPage] = useState({
    title: '',
    description: ''
  });
  const [updated, setUpdated] = useState(1);

  const getPages = async e => {
    axios
      .get(`${API_URL}/wiki/pages`, {
        params: {}
      })
      .then(response => {
        setData(response.data);
      });
  };

  const submitPage = async () => {
    axios
      .post(
        `${API_URL}/wiki/addPage`,
        {
          title: newPage.title,
          description: newPage.description,
          userId: global.userId,
          API_SECRET
        },
        {
          headers: { 'content-type': 'application/x-www-form-urlencoded' }
        }
      )
      .then(res => {
        setUpdated(updated + 1);
      });
  };

  useEffect(() => {
    getPages();
  }, [updated]);

  return (
    <div className={classes.root}>
      <Paper className={classes.root}>
        <Typography
          variant="h1"
          style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          {pageId ? `My Page Id is ${pageId}` : 'Pee and poop'}
        </Typography>

        <form style={{ paddingTop: 30, paddingBottom: 30 }}>
          <TextField
            label={'Title'}
            value={newPage['title'] || ''}
            style={{ marginRight: 5 }}
            variant="outlined"
            onChange={e => {
              setNewPage({
                ...newPage,
                title: e.target.value
              });
            }}
          />
          <TextField
            label={'Description'}
            value={newPage['description'] || ''}
            style={{ marginLeft: 5 }}
            variant="outlined"
            onChange={e => {
              setNewPage({
                ...newPage,
                description: e.target.value
              });
            }}
          />
          <div align="center" style={{ alignItems: 'center', paddingTop: 10 }}>
            <Button
              onClick={() => {
                submitPage();
              }}
              size="large"
              variant="outlined">
              Submit
            </Button>
          </div>
        </form>

        <TableContainer style={{ overflowX: 'auto' }}>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left">Name</TableCell>
                <TableCell align="left">Description</TableCell>
                <TableCell align="left">Timestamp</TableCell>
                <TableCell align="left">Creator ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((entry, i) => {
                return (
                  <TableRow key={'row' + entry.page_id}>
                    <TableCell align="left">
                      <IconButton
                        onClick={() => {
                          history.push(`/wiki/${entry.page_id}`);
                        }}>
                        <Typography color="primary" gutterBottom variant="h5">
                          {entry.page_name}
                        </Typography>
                      </IconButton>
                    </TableCell>
                    <TableCell align="left">
                      <Typography gutterBottom variant="h5">
                        {unsanitize(entry.description)}
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography gutterBottom variant="h5">
                        {moment(entry.timestamp).fromNow()}
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography gutterBottom variant="h5">
                        {entry.creator_user_id}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

Search.propTypes = {
  history: PropTypes.object
};

export default withRouter(Search);
