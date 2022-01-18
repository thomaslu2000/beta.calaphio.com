import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
  Button,
  TextField
} from '@material-ui/core';
import { unsanitize, clean } from '../../../functions';
import axios from 'axios';
const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(() => ({
  root: {
    '& .MuiInputBase-root.Mui-disabled': {
      color: 'rgba(0, 0, 0, 1)' // (default alpha is 0.38)
    }
  }
}));

const cellData = [
  ['firstname', 'First Name'],
  ['lastname', 'Last Name'],
  ['email', 'Email'],
  ['cellphone', 'Phone'],
  ['phone', 'How to Reach Me'],
  ['address', 'Address'],
  ['city', 'City'],
  ['zipcode', 'Zipcode']
];

const AccountDetails = props => {
  const { className, userdata, viewerid, viewertoken, ...rest } = props;
  const [values, setValues] = useState({});

  useEffect(() => {
    setValues(userdata);
  }, [userdata]);

  const classes = useStyles();

  const makeChangeHandler = id => {
    return e => {
      setValues({
        ...values,
        [id]: clean(e.target.value)
      });
    };
  };

  const updateProfile = async () => {
    await axios
      .post(
        `${API_URL}/people/updateProfile/`,
        {
          ...values,
          userId: viewerid,
          token: viewertoken,
          viewertoken,
          API_SECRET
        },
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
      )
      .then(response => {
        alert('Profile Updated!');
      });
  };

  let mine = viewerid === userdata.user_id;

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader
        title={
          mine
            ? 'Edit Your Account'
            : `Viewing ${userdata.firstname}'s account:`
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          {cellData.map(([id, label]) => {
            return (
              <Grid item md={6} xs={12} key={id}>
                <TextField
                  disabled={!mine}
                  fullWidth
                  label={label}
                  color="secondary"
                  margin="dense"
                  onChange={makeChangeHandler(id)}
                  value={unsanitize(values[id] || '')}
                  // variant="outlined"
                />
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
      <Divider />
      {mine && (
        <CardActions>
          <Button color="primary" variant="contained" onClick={updateProfile}>
            Save details
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

AccountDetails.propTypes = {
  className: PropTypes.string
};

export default AccountDetails;
