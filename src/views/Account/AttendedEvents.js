import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Paper, Grid, FormControlLabel, Switch, Typography } from '@material-ui/core';
import axios from 'axios';
import moment from 'moment';
import { DataGrid } from '@material-ui/data-grid';
import { unsanitize } from '../functions';
const API_URL = process.env.REACT_APP_SERVER;


const columns = [
  { field: 'title', headerName: 'Event', flex: 1,
  valueFormatter: (params) =>
    unsanitize(params.value)},
  { field: 'date', headerName: 'Date', flex: 0.6 , 
  valueFormatter: (params) =>
  moment.utc(params.value).local().format('ll') },
  { field: 'hours', headerName: 'Hours', flex: 0.5, 
  valueFormatter: (params) =>
  params.value || 0},
  { field: 'category', headerName: 'Type', flex: 0.6, 
  valueGetter: (r) => {
    return r.row.service==="1" ? 'Service' : r.row.fellowship==="1" ? 'Fellowship' : 'Other' }}, 
  { field: 'attended', headerName: 'Attendence', flex: 0.6, 
  valueGetter: (r) => {
    return r.row.chair==="1" ? 'Chaired' : r.row.flaked==="1" ? 'Flaked' : 'Attended' }}
];

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  mini_root : {
    paddingTop: theme.spacing(4)
  }
}));

const AttendedEvents = props => {
  const classes = useStyles();
  const userId = props.userId;
  const [userData, setUserData] = useState([]);
  const [current, setCurrent] = useState(true);
  const [stats, setStats] = useState({service: '', flaked_service: '', fellowships: '', flaked_fellowships: '', chaired: ''});

  useEffect(() => {
    const getUserData = async (s) => {
      await axios
      .get(`${API_URL}/people/${s}/`, {
        params: {userId}
      })
      .then(response => {
        if (response.data) setUserData(response.data);
      });
    }
    if (userId && current) getUserData('allCurrentEvents');
    else if (userId) getUserData('allEvents');
  }, [userId, current]);

  useEffect(() => {
    let counts = {service: 0, flaked_service: 0, fellowships: 0, flaked_fellowships: 0, chaired: 0};
    userData.map(function (row) {
      if (!row.hours) return;
      if (row.chair==='1') counts.chaired += 1;
      if (row.service==='1'){
        if (row.flake==='0') counts.service += parseFloat(row.hours);
        else counts.flaked_service += parseFloat(row.hours);
      } else if (row.fellowship==='1') {
        if (row.flake==='0') counts.fellowships += 1;
        else counts.flaked_fellowships += 1;
      }
    }
    )
    setStats(counts);
  }, [userData]);
  
  return (
  <Paper  style={{ display: 'flex', height: '100%', minHeight: "520px" }}>
    <Grid container>
      <Grid item xs={12} style={{paddingTop: 10, height:'7%'}}>
          <Typography align="center" variant='h4'> Attended Events </Typography>
        </Grid>
        <Grid item xs={12} style={{height:'5%'}}>
          <Typography align="center" variant='h6'>Service hours: {stats.service} (and {stats.flaked_service} Flaked) |  Fellowships: {stats.fellowships} (and {stats.flaked_fellowships} Flaked) | Chaired: {stats.chaired} </Typography>
        </Grid>
        <Grid item xs={12} style={{ height: '6%'}}>
          <FormControlLabel
          control={<Switch checked={current} onChange={() => setCurrent(!current)} name="setCurrent" />}
          label="Current Semester Only" style={{ marginLeft: '30px' }}
        />
        </Grid>
        <Grid item xs={12}  style={{ height:'82%'}} >
        <DataGrid rows={userData} columns={columns} pageSize={5} style={{ width: "100%" }}/>
        </Grid>
      </Grid>
  </Paper>
  );
  }

export default AttendedEvents;
