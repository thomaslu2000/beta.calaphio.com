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
    backgroundColor: theme.palette.success.main,
    height: 56,
    width: 56
  },
  icon: {
    height: 32,
    width: 32
  },
  difference: {
    marginTop: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    marginRight: 'auto',
    marginLeft: 'auto'
  },
  differenceIcon: {
    color: theme.palette.error.dark
  },
  differenceValue: {
    color: theme.palette.error.dark,
    marginRight: theme.spacing(1)
  },
  successValue: {
    color: theme.palette.success.dark,
    marginRight: theme.spacing(1)
  }
}));

const Fellowships = props => {
  const { className, ...rest } = props;

  const classes = useStyles();

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardContent>
        <Grid container justify="space-between">
          <Grid
            item
            style={{ marginRight: 'auto', marginLeft: 'auto' }}
            xs={12}>
            <Typography
              className={classes.title}
              color="textSecondary"
              style={{ textAlign: 'center' }}
              gutterBottom
              variant="h5">
              Fellowships
            </Typography>
            <br />
            <Typography variant="h3" style={{ textAlign: 'center' }}>
              {props.attended - props.flaked} events
            </Typography>
          </Grid>
          <Grid item className={classes.difference} xs={12}>
            <div
              style={{
                textAlign: 'center',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
              <Typography className={classes.successValue} variant="body2">
                {props.attended} events attended
              </Typography>
              <Typography className={classes.differenceValue} variant="body2">
                {props.flaked} events flaked
              </Typography>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

Fellowships.propTypes = {
  className: PropTypes.string
};

export default Fellowships;
