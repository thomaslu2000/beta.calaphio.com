import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Divider,
  Typography
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  chartContainer: {
    position: 'relative',
    height: '300px'
  },
  stats: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center'
  },
  device: {
    textAlign: 'center',
    padding: theme.spacing(1)
  },
  deviceIcon: {
    color: theme.palette.icon
  }
}));

const NextEvents = props => {
  const { className, ...rest } = props;

  const classes = useStyles();
  const theme = useTheme();

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader title="Your Next Events" />
      <Divider />
      <CardContent>hallo</CardContent>
    </Card>
  );
};

NextEvents.propTypes = {
  className: PropTypes.string
};

export default NextEvents;
