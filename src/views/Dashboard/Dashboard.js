import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import axios from 'axios';
import {
  ServiceHours,
  Fellowships,
  MiscStatus,
  Evaluate,
  Announcements,
  NextEvents
} from './components';
import moment from 'moment';
import { useGlobal } from 'reactn';
const API_URL = 'http://localhost:3001';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Dashboard = () => {
  const classes = useStyles();
  const [global] = useGlobal();
  const [data, setData] = useState({});

  useEffect(() => {
    getLatest();
  }, []);

  const getLatest = async () => {
    await axios
      .get(`${API_URL}/general/lastSem/`, {
        params: {}
      })
      .then(response => {
        let sem = response.data[0];
        getStats(
          moment(sem.start).format('YYYY-MM-DD hh:mm:ss'),
          moment(sem.end).format('YYYY-MM-DD hh:mm:ss')
        );
      });
  };

  const getStats = async (startDate, endDate) => {
    await axios
      .get(`${API_URL}/people/stats/`, {
        params: {
          startDate,
          endDate,
          userId: global.userId
        }
      })
      .then(response => {
        setData(response.data[0]);
      });
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={4}>
        <Grid item lg={3} sm={6} xl={3} xs={12}>
          <ServiceHours
            attended={data.service_hours_attended || 0}
            flaked={data.service_hours_flaked || 0}
          />
        </Grid>
        <Grid item lg={3} sm={6} xl={3} xs={12}>
          <Fellowships
            attended={data.fellowships_attended || 0}
            flaked={data.fellowships_flaked || 0}
          />
        </Grid>
        <Grid item lg={3} sm={6} xl={3} xs={12}>
          <MiscStatus chaired={data.events_chaired || 0} />
        </Grid>
        <Grid item lg={3} sm={6} xl={3} xs={12}>
          <Evaluate userId={global.userId} />
        </Grid>
        <Grid item lg={8} md={12} xl={9} xs={12}>
          <Announcements />
        </Grid>
        <Grid item lg={4} md={6} xl={3} xs={12}>
          <NextEvents />
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
