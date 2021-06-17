import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
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
import { unsanitize } from '../functions';
import PropTypes from 'prop-types';
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
  const [data, setData] = useState([]);

  return (
    <div className={classes.root}>
      <Paper className={classes.root}>
        <Typography
          variant="h1"
          style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          User Search
        </Typography>
        <div style={{ width: '75%', marginLeft: 'auto', marginRight: 'auto' }}>
          <TextField
            fullWidth
            label="Search Name Here"
            style={{ marginTop: 30, marginBottom: 30 }}
            onChange={async e => {
              if (e.target.value.length > 0)
                await axios
                  .get(`${API_URL}/people/search`, {
                    params: {
                      query: e.target.value
                    }
                  })
                  .then(response => {
                    setData(response.data);
                  });
            }}
            variant="outlined"
          />
        </div>
        <TableContainer style={{ overflowX: 'auto' }}>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left">Name</TableCell>
                <TableCell align="left">Pledge Class</TableCell>
                <TableCell align="left">How to Reach Me</TableCell>
                <TableCell align="left">Email</TableCell>
                <TableCell align="left">Dynasty</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((entry, i) => {
                return (
                  <TableRow key={'row' + entry.user_id}>
                    <TableCell align="left">
                      <IconButton
                        onClick={() => {
                          history.push(`/account/${entry.user_id}`);
                        }}>
                        <Typography color="primary" gutterBottom variant="h5">
                          {entry.firstname} {entry.lastname}
                        </Typography>
                      </IconButton>
                    </TableCell>
                    <TableCell align="left">
                      <Typography gutterBottom variant="h5">
                        {entry.pledgeclass}
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography gutterBottom variant="h5">
                        {unsanitize(entry.phone)}
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography gutterBottom variant="h5">
                        {entry.email}
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Typography gutterBottom variant="h5">
                        {entry.dynasty}
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
