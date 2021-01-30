import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import axios from 'axios';
import {
  Button,
  Checkbox,
  Typography,
  Card,
  CardActions,
  CardContent
} from '@material-ui/core';
import {
  AdminPanel
} from './components';
import { useGlobal } from 'reactn';
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Admin = props => {
  const classes = useStyles();
  const [global] = useGlobal();
  const [adminPermission, setAdminPermission] = useState(false);

  useEffect(() => {
    if (global.userId) getAdmin();
  }, [global]);

  const getAdmin = async () => {
    await axios
      .get(`${API_URL}/people/admin/`, {
        params: {userId: global.userId}
      })
      .then(response => {
        if (response.data[0]) setAdminPermission(true);
      });
  };

  if (global.userId && adminPermission) {
    return (
      <div className={classes.root}>
        <AdminPanel userId={global.userId} />
      </div>
    );
  }

  return (
    <div className={classes.root}>
    <Card>
    <CardContent>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom>
          This page is for admins only
        </Typography>
        <Typography variant="h1" component="h1">
          <b>Please log in to an account with admin privileges </b>
        </Typography>
      </CardContent>
    </Card>
  </div>)
  
};

export default Admin;
