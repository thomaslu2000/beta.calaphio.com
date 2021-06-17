import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import { useGlobal } from 'reactn';
import { AccountProfile, AccountDetails } from './components';
import AttendedEvents from './AttendedEvents';
import Positions from './Positions';
import axios from 'axios';
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  },
  mini_root: {
    paddingTop: theme.spacing(4)
  }
}));

const Account = props => {
  const classes = useStyles();
  const [global] = useGlobal();
  const userId = props.match ? props.match.params.userId : props.userId;
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const getUserData = async () => {
      await axios
        .get(`${API_URL}/people/userData/`, {
          params: {
            userId
          }
        })
        .then(response => {
          if (response.data.length === 0) {
            alert(`User ${userId} not found!`);
            return;
          }
          setUserData(response.data[0]);
        });
    };
    if (userId) getUserData();
  }, [props.match]);

  return (
    <Grid
      container
      spacing={4}
      className={props.mini ? classes.mini_root : classes.root}>
      <Grid
        item
        lg={props.mini ? 12 : 4}
        md={props.mini ? 12 : 6}
        xl={props.mini ? 12 : 4}
        xs={12}>
        <AccountProfile userdata={userData} viewerid={global.userId} />
      </Grid>
      <Grid
        item
        lg={props.mini ? 12 : 8}
        md={props.mini ? 12 : 6}
        xl={props.mini ? 12 : 8}
        xs={12}>
        <AccountDetails userdata={userData} viewerid={global.userId} />
      </Grid>
      {props.min || (
        <React.Fragment>
          <Grid
            item
            lg={props.mini ? 12 : 4}
            md={props.mini ? 12 : 6}
            xl={props.mini ? 12 : 4}
            xs={12}>
            <Positions userId={userId} />
          </Grid>
          <Grid
            item
            lg={props.mini ? 12 : 8}
            md={props.mini ? 12 : 6}
            xl={props.mini ? 12 : 8}
            xs={12}>
            <AttendedEvents userId={userId} />
          </Grid>
        </React.Fragment>
      )}
    </Grid>
  );
};

export default Account;
