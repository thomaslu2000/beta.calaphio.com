import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Search = props => {
  const classes = useStyles();
  const { history } = props;
  return (
    <div className={classes.root}>
      <Paper className={classes.root}>hi insert search bar and table pls</Paper>
    </div>
  );
};

Search.propTypes = {
  history: PropTypes.object
};

export default withRouter(Search);
