import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Avatar } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { unsanitize } from '../../../functions';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  content: {
    alignItems: 'center',
    display: 'flex'
  },
  title: {
    fontWeight: 700
  },
  avatar: {
    backgroundColor: theme.palette.white,
    color: theme.palette.primary.main,
    height: 56,
    width: 56
  },
  icon: {
    height: 32,
    width: 32
  }
}));

const Evaluate = props => {
  const { className, ...rest } = props;

  const classes = useStyles();
  const data = [
    {
      event_id: 123412,
      title: 'a thing &amp; stuff, use the unsanitize function',
      end_at: '2020-08-01 12:43:09'
    }
  ];

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardContent>
        <Grid container justify="space-between">
          <Grid item>
            <Typography
              className={classes.title}
              color="inherit"
              gutterBottom
              variant="body2">
              Evaluate Events
            </Typography>
            <Typography color="inherit" variant="h3">
              Name Of Event from Data
            </Typography>
          </Grid>
          <Grid item>
            <IconButton>
              <ExitToAppIcon style={{ color: 'yellow' }} size="large" />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

Evaluate.propTypes = {
  className: PropTypes.string
};

export default Evaluate;
