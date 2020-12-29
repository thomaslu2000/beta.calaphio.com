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
import {default as Account} from '../Account'
import { Box, Card, CardContent, Divider, Typography } from '@material-ui/core';
import moment from 'moment';
import { useGlobal } from 'reactn';
import { Link as RouterLink, withRouter } from 'react-router-dom';

const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Dashboard = props => {
  const classes = useStyles();
  const [global] = useGlobal();
  const [data, setData] = useState({});

  const { history } = props;

  useEffect(() => {
    if (global.userId) getLatest();
  }, [global]);

  const getLatest = async () => {
    await axios
      .get(`${API_URL}/general/lastSem/`, {
        params: {}
      })
      .then(response => {
        let sem = response.data[0];
        getStats(
          moment(sem.start).format('YYYY-MM-DD HH:mm:ss'),
          moment(sem.end).format('YYYY-MM-DD HH:mm:ss')
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

  if (!global.userId)
    return (
      <div className={classes.root}>
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h3">
              Sign in to View User Info
            </Typography>
          </CardContent>
        </Card>
        <br />
        <Announcements />
      </div>
    );

  return (
    <div className={classes.root}>
      <Grid container spacing={4}>
        <Box clone order={{ sm: 4 }}>
          <Grid item lg={3} sm={6} xl={3} xs={12}>
            <Evaluate userId={global.userId} />
          </Grid>
        </Box>
        <Box clone order={{ sm: 6 }}>
          <Grid item lg={4} md={6} xl={3} xs={12}>
            <NextEvents history={history} userid={global.userId} />
            <Divider />
            <Account userId={global.userId} mini />
          </Grid>
        </Box>

        <Box clone order={{ sm: 5 }}>
          <Grid item lg={8} md={12} xl={9} xs={12}>
            <Announcements />
          </Grid>
        </Box>

        <Box clone order={{ sm: 1 }}>
          <Grid item lg={3} sm={6} xl={3} xs={12}>
            <ServiceHours
              attended={data.service_hours_attended || 0}
              flaked={data.service_hours_flaked || 0}
            />
          </Grid>
        </Box>
        <Box clone order={{ sm: 2 }}>
          <Grid item lg={3} sm={6} xl={3} xs={12}>
            <Fellowships
              attended={data.fellowships_attended || 0}
              flaked={data.fellowships_flaked || 0}
            />
          </Grid>
        </Box>
        <Box clone order={{ sm: 3 }}>
          <Grid item lg={3} sm={6} xl={3} xs={12}>
            <MiscStatus chaired={data.events_chaired || 0} />
          </Grid>
        </Box>
      </Grid>
    </div>
  );
};

export default withRouter(Dashboard);
