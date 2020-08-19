import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  content: {
    alignItems: 'center',
    display: 'flex'
  },
  title: {
    fontWeight: 700
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    height: 56,
    width: 56
  },
  icon: {
    height: 32,
    width: 32
  },
  progress: {
    marginTop: theme.spacing(3)
  }
}));

const MiscStatus = props => {
  const { className, ...rest } = props;

  const classes = useStyles();

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardContent>
        <Grid container justify="space-between">
          <Grid item style={{ marginRight: 'auto', marginLeft: 'auto' }}>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
              variant="h5">
              Events Chaired
            </Typography>
            <br />
            <Typography variant="h3">{props.chaired} events</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

MiscStatus.propTypes = {
  className: PropTypes.string
};

export default MiscStatus;
