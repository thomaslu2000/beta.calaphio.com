import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Typography,
  Grid,
  IconButton
} from '@material-ui/core';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import moment from 'moment';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  centered: { marginLeft: 'auto', marginRight: 'auto' }
}));

const NextEvents = props => {
  const { className, ...rest } = props;
  const { history } = props;
  const classes = useStyles();
  const theme = useTheme();

  const data = [
    {
      title: 'eat ass',
      location: 'aakarshs house',
      start_at: '2020-09-03 12:00:00',
      end_at: '2020-09-03 14:00:00',
      event_id: 122,
      date: '2020-09-03',
      time_allday: 0
    },
    {
      title: 'gain mass',
      location: 'aakarshs moms house',
      start_at: '2020-09-04 3:00:00',
      end_at: '2020-09-04 6:00:00',
      event_id: 123,
      date: '2020-09-04',
      time_allday: 1
    }
  ];

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader title="Your Next Events" />
      <Divider />
      {data.map(item => {
        let day = moment(item.date).format('MMM Do YYYY');
        let date = moment(item.date).format('YYYY-MM-DD');
        var time;
        if (item.time_allday) {
          time = 'All Day';
        } else {
          let starttime = moment(item.start_at);
          let endtime = moment(item.end_at);
          time = starttime.format('h:mm a') + ' to ' + endtime.format('h:mm a');
        }
        return (
          <React.Fragment key={item.event_id}>
            <CardContent>
              <Grid container justify="space-between">
                <Grid item className={classes.centered}>
                  <IconButton
                    onClick={() => {
                      history.push(`/day/${date}`);
                    }}>
                    <Typography color="primary" gutterBottom variant="h4">
                      {item.title}
                    </Typography>
                  </IconButton>
                </Grid>
              </Grid>
              <Grid container justify="space-between">
                <Grid item className={classes.centered}>
                  <Typography variant="h5">{item.location}</Typography>
                </Grid>
              </Grid>
              <Grid container justify="space-between">
                <Grid item className={classes.centered}>
                  <Typography color="secondary" variant="h6">
                    {day}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container justify="space-between">
                <Grid item className={classes.centered}>
                  <Typography color="secondary" variant="h6">
                    {time}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
          </React.Fragment>
        );
      })}
    </Card>
  );
};

NextEvents.propTypes = {
  className: PropTypes.string
};

export default withRouter(NextEvents);
