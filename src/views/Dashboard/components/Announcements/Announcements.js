import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Button
} from '@material-ui/core';
import { unsanitize } from '../../../functions';
import moment from 'moment';

const useStyles = makeStyles(() => ({
  root: {},
  chartContainer: {
    height: 400,
    position: 'relative'
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

const Announcements = props => {
  const { className, ...rest } = props;

  const data = [
    {
      firstname: 'Bill',
      lastname: 'Wells',
      text:
        'Here is some text that might have <b> html </b> and &amp; special characters, use the unsanitize function imported above',
      publish_time: '2020-05-06 12:00:00'
    },
    {
      firstname: 'Jon',
      lastname: 'Tosd',
      text: 'Also try to use moment.js, imported above',
      publish_time: '2020-05-06 12:00:00'
    }
  ];

  const classes = useStyles();

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader title="Announcements" />
      <Divider />
      <CardContent>try adding the stuff from data here</CardContent>
      <Divider />
      {/* <CardActions className={classes.actions}>
        <Button color="primary" size="small" variant="text">
          Overview <ArrowRightIcon />
        </Button>
      </CardActions> */}
    </Card>
  );
};

Announcements.propTypes = {
  className: PropTypes.string
};

export default Announcements;
