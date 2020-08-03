import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';

import { LatestSales, UsersByDevice } from './components';

import { useGlobal } from 'reactn';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  }
}));

const Dashboard = () => {
  const classes = useStyles();
  const [global] = useGlobal();

  return (
    <div className={classes.root}>
      {/* {global.name} */}
      <Grid container spacing={4}>
        <Grid item lg={8} md={12} xl={8} xs={12}>
          <LatestSales />
        </Grid>
        <Grid item lg={4} md={6} xl={3} xs={12}>
          <UsersByDevice />
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
