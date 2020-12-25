import React, { useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import axios from 'axios';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField
} from '@material-ui/core';
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles((theme) => ({
  padded: {
    padding: theme.spacing(4)
  }
}));

const AdminPanel = props => {
  const { userId, ...rest } = props;
  const [window, setWindow] = useState(1);
  const [values, setValues] = useState({});
  const [display, setDisplay] = useState(<div></div>);
  const classes = useStyles();

  const adminFuncs = [
  {
    title: 'Check if Admin',
    forms: {
      userId: 'User Id (number)'
    },
    url: '/people/admin/',
    type: 'GET',
    callback: response => {
      if (response.data[0]) alert('admiN!'); 
    }
  },
  {
    title: 'View Stats',
    forms: {userId: 'User Id (number)', startDate: 'Start Date (YYYY-MM-DD)', endDate: 'End Date (YYYY-MM-DD)'},
    url: '/people/stats/',
    type: 'GET',
    callback: response => {
      if (response.data[0]){
        setDisplay(
          <ul>
            {Object.entries(response.data[0]).map(([title, val]) => {
              return <li key={title}><Typography>{title}: {val}</Typography></li>
            })}
          </ul>
        )
      } 
    }
  }
];

  return (
    <div>
    <Card>
      <CardHeader
        title={"Admin Panel"}
      />
      <Divider />
      <CardContent>
      <Typography
        color="textSecondary"
        gutterBottom>
        Note: Authorized use only! Errors and security bugs WILL NOT be caught!
      </Typography>
          <div>
            <Typography variant="h1"  className={classes.padded}>
              {adminFuncs[window].title}
            </Typography>
          </div>
          {Object.entries(adminFuncs[window].forms).map(([param, title], idx) => {
            return (<TextField
              id={param}
              key={param}
              label={title}
              style={{marginRight:10}}
              value={values[param] || ''}
              onChange={(e) => {
                let c = {
                  ...values
                }
                c[param] = e.target.value
                setValues(c)
              }}
              variant="outlined"
            />)
       })}

        <Button
            size="large"
            variant="outlined"
            onClick={async () => {
              if (adminFuncs[window].type==='GET'){
              await axios.get(`${API_URL}/${adminFuncs[window].url}`, {
                params: values
              })
              .then(adminFuncs[window].callback)
            }}}>
            Run
          </Button>

       </CardContent>
       <CardContent className={classes.padded}>{display}</CardContent>
    </Card></div>
  );
};

export default AdminPanel;
