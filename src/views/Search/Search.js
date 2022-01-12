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
import { SearchUser } from 'components';
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
        <SearchUser
          extraData
          toAdd={entry => {
            history.push(`/account/${entry.uid}`);
          }}
        />
      </Paper>
    </div>
  );
};

Search.propTypes = {
  history: PropTypes.object
};

export default withRouter(Search);
