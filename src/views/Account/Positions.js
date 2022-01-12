import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Paper, Grid, Typography, Divider } from '@material-ui/core';
import axios from 'axios';
import moment from 'moment';
import { unsanitize } from '../functions';
const API_URL = process.env.REACT_APP_SERVER;

const columns = [
  {
    field: 'title',
    headerName: 'Event',
    flex: 1,
    valueFormatter: params => unsanitize(params.value)
  },
  {
    field: 'date',
    headerName: 'Date',
    flex: 0.7,
    valueFormatter: params =>
      moment
        .utc(params.value)
        .local()
        .format('ll')
  },
  {
    field: 'hours',
    headerName: 'Hours',
    flex: 0.5,
    valueFormatter: params => params.value || 0
  },
  {
    field: 'category',
    headerName: 'Type',
    flex: 0.7,
    valueGetter: r => {
      return r.row.service === '1'
        ? 'Service'
        : r.row.fellowship === '1'
        ? 'Fellowship'
        : 'Other';
    }
  },
  {
    field: 'attended',
    headerName: 'Attendence',
    flex: 0.7,
    valueGetter: r => {
      return r.row.chair === '1'
        ? 'Chaired'
        : r.row.flaked === '1'
        ? 'Flaked'
        : 'Attended';
    }
  }
];

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  mini_root: {
    paddingTop: theme.spacing(4)
  },
  centered: {
    marginLeft: 'auto',
    marginRight: 'auto',
    alignText: 'center'
  }
}));

const Positions = props => {
  const classes = useStyles();
  const userId = props.userId;
  const [userData, setUserData] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    const getUserData = async () => {
      await axios
        .get(`${API_URL}/people/allPositions/`, {
          params: { userId }
        })
        .then(response => {
          var data = [];
          if (response.data) data = response.data;
          // data = [
          //   {"position_title":"CM5","position_name":"GG Pledge Maniac","semester":"1","year":"2018"},
          //   {"position_title":"Little","position_name":"Gotta Make Them Squirt (GMTs)","semester":"1","year":"2018"},
          //   {"position_title":"Administrative Committee","position_name":"PVL Pledge Class","semester":"1","year":"2018"},
          //   {"position_title":"Parliamentarian ","position_name":"President","semester":"0","year":"2019"},
          //   {"position_title":"Webmaster","position_name":"Administrative VP","semester":"0","year":"2019"},
          //   {"position_title":"Fundraising Chair","position_name":"Finance VP","semester":"0","year":"2019"},
          //   {"position_title":"Sturdy Oak Recipient","position_name":"Sturdy Oak Recipient","semester":"0","year":"2019"},
          //   {"position_title":"Big","position_name":"Growing My True Self","semester":"0","year":"2019"},
          //   {"position_title":"Bronze","position_name":"Presidential Service Award","semester":"0","year":"2019"},
          //   {"position_title":"Alpha Dynasty Director" ,"position_name":"Membership VP","semester":"1","year":"2019"},
          //   {"position_title":"Webmaster","position_name":"Administrative VP","semester":"1","year":"2019"}
          //   ]

          let years = [];

          let rv = data.reduce(function(rv, x) {
            let sem = parseInt(x['semester']);
            if (!years.includes(x['year'])) {
              years.push(x['year']);
            }
            if (!rv[x['year']]) rv[x['year']] = [[], []];
            rv[x['year']][sem].push(x);
            return rv;
          }, {});
          years.sort();
          setYears(years);
          setUserData(rv);
        });
    };
    if (userId) getUserData();
  }, [userId]);

  if (
    years.reduce((sum, year) => {
      if (userData[year])
        return sum + userData[year][0].length + userData[year][1].length;
      return sum;
    }, 0) === 0
  ) {
    return <div></div>;
  }

  return (
    <Paper style={{ width: '100%' }}>
      <Grid
        container
        alignItems="center"
        justify="center"
        direction="column"
        style={{ paddingTop: 10, paddingBottom: 10 }}>
        <Grid item xs={12} style={{ paddingTop: 10, paddingBottom: 10 }}>
          <Typography variant="h2" align="center">
            Excomm Positions
          </Typography>
        </Grid>
        <Divider style={{ paddingTop: 5, paddingBottom: 5 }} />
        {years.map(year => {
          return (
            <React.Fragment key={year}>
              {[0, 1].map(sem => {
                if (!userData[year] || userData[year][sem].length === 0)
                  return '';
                return (
                  <Grid
                    item
                    xs={12}
                    key={year + sem}
                    style={{ paddingTop: 10, paddingBottom: 15 }}>
                    <Typography variant="h4" align="center">
                      {['Spring', 'Fall'][sem]} {year}
                    </Typography>
                    {userData[year][sem].map(row => (
                      <Typography variant="h6" align="center">
                        {' '}
                        {unsanitize(row['position_title'])} --{' '}
                        {unsanitize(row['position_name'])}
                      </Typography>
                    ))}
                  </Grid>
                );
              })}
            </React.Fragment>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default Positions;
