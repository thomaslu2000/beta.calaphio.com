import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Avatar, Typography, IconButton } from '@material-ui/core';
import { useGlobal } from 'reactn';
import { Link as RouterLink, withRouter } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 'fit-content'
  },
  avatar: {
    width: 60,
    height: 60
  },
  name: {
    marginTop: theme.spacing(1)
  }
}));

const Profile = props => {
  const [global] = useGlobal();
  const { className, history, ...rest } = props;

  const classes = useStyles();

  return (
    <div {...rest} className={clsx(classes.root, className)}>
      <Typography className={classes.name} variant="h4">
      {global.userId ? 'Welcome,' : 'Please Sign In'}
      </Typography>
      {global.userId &&
      <Typography className={classes.name} variant="h1">
         <IconButton
        onClick={() => {
          history.push(`/account/${global.userId}`);
        }}>{global.name}</IconButton>
      </Typography>}
    </div>
  );
};

Profile.propTypes = {
  className: PropTypes.string
};

export default withRouter(Profile);
