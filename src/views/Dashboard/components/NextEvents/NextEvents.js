import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/styles';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Typography,
  Grid,
  IconButton
} from '@material-ui/core';
import moment from 'moment';
import axios from 'axios';
import { unsanitize, dayToObj, gCalAdd } from '../../../functions';
const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(theme => ({
  root: {
    // height: '100%'
  },
  centered: { marginLeft: 'auto', marginRight: 'auto' }
}));

const NextEvents = props => {
  const { history, userid, className, ...rest } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [data, setData] = useState([]);

  useEffect(() => {
    getNext();
  }, [userid]);
  
  const getNext = async () => {
    await axios
      .get(`${API_URL}/people/next3/`, {
        params: {
          userId: userid
        }
      })
      .then(response => {
        setData(response.data);
      });
  };

  const addToCal = async () => {
    await axios
      .get(`${API_URL}/people/upcoming/`, {
        params: {
          userId: userid
        }
      })
      .then(response => {
        gCalAdd(response.data.map(dayToObj))
      });
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <div 
            style={{textAlign:'center', paddingBottom: 10}}>
      <CardHeader title="Your Next 3 Events" 
          /> 
        <Button
              variant="outlined"
              onClick={addToCal}>
              Add To Google Calendar
            </Button>
            </div>
      <Divider />
      {data.map(item => {
        let day = moment
          .utc(item.start_at)
          .local()
          .format('MMM Do YYYY');
        let date = moment
          .utc(item.start_at)
          .local()
          .format('YYYY-MM-DD');
        var time;
        if (item.time_allday === '1') {
          time = 'All Day';
        } else {
          let starttime = moment.utc(item.start_at).local();
          let endtime = moment.utc(item.end_at).local();
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
                      {unsanitize(item.title)}
                    </Typography>
                  </IconButton>
                </Grid>
              </Grid>
              <Grid container justify="space-between">
                <Grid item className={classes.centered}>
                  <Typography variant="h5">
                    {unsanitize(item.location)}
                  </Typography>
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

export default NextEvents;
