import React, { useState, useEffect } from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Button,
  Checkbox,
  Typography,
  Card,
  CardActions,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useGlobal } from 'reactn';
import axios from 'axios';
import moment from 'moment';
import { unsanitize } from '../functions';
const API_URL = 'http://localhost:3001';

const EvaluateEvent = props => {
  const classes = useStyles();
  const eid = props.match.params.eventId;
  const [global] = useGlobal();
  const [attending, setAttending] = useState([]);
  const [eventData, setEventData] = useState(false);
  const [attendingChair, setAttendingChair] = useState({});
  const [attendingSelect, setAttendingSelect] = useState({});
  const [attendingHours, setAttendingHours] = useState({});
  const { history } = props;

  if (!eid) {
    history.push('/not-found');
  }

  useEffect(() => {
    if (eid) {
      getEvent();
    }
  }, [eid]);

  const getEvent = async () => {
    await axios
      .get(`${API_URL}/events/`, {
        params: {
          eventId: eid
        }
      })
      .then(response => {
        setEventData(response.data[0]);
        getAttending(response.data[0]);
      });
  };
  const getAttending = async ed => {
    let dt1 = new Date(ed.start_at);
    let dt2 = new Date(ed.end_at);
    let defaultHours = Math.abs(
      ((dt2.getTime() - dt1.getTime()) / 36e5).toFixed(2)
    );
    await axios
      .get(`${API_URL}/events/attending/`, {
        params: {
          eventId: eid
        }
      })
      .then(response => {
        setAttendingSelect(
          response.data.reduce((o, key) => ({ ...o, [key.uid]: 1 }), {})
        );
        setAttendingHours(
          response.data.reduce(
            (o, key) => ({ ...o, [key.uid]: defaultHours }),
            {}
          )
        );
        setAttendingChair(
          response.data.reduce(
            (o, key) => ({ ...o, [key.uid]: key.chair === 1 }),
            {}
          )
        );
        setAttending(response.data);
      });
  };

  const makeParams = () => {
    let params = {
      eventId: eid,
      attend: [],
      delete: []
    };
    for (const [userId, hours] of Object.entries(attendingHours)) {
      let status = attendingSelect[userId];
      let chair = attendingChair[userId];
      if (status < 2)
        params.attend.push({
          attended: status,
          flaked: 1 - status,
          userId,
          hours,
          chair: chair ? 1 : 0
        });
      else params.delete.push(userId);
    }
    return params;
  };

  const submitEval = async () => {
    let params = makeParams();
    await axios
      .get(`${API_URL}/people/adminOrChair`, {
        params: { userId: global.userId || -1, eventId: eid }
      })
      .then(response => {
        if (response.data.length > 0) {
          axios.post(`${API_URL}/events/evaluate`, params).then(res => {
            history.push('/');
            alert('Successfully Evaluated :)');
          });
        } else {
          alert(
            'You are unauthorized to evaluate this event. This action has been logged.'
          );
        }
      });
  };

  if (!eventData) {
    return <Paper className={classes.root}>Loading...</Paper>;
  }

  const makeHandleSelect = uid => {
    return event => {
      attendingSelect[uid] = event.target.value;
    };
  };
  const makeHandleChair = uid => {
    return event => {
      attendingChair[uid] = !attendingChair[uid];
      setAttendingChair({ ...attendingChair });
    };
  };
  const makeHandleHours = uid => {
    return event => {
      attendingHours[uid] = parseFloat(event.target.value) || 0;
    };
  };

  let starttime = moment(eventData.start_at);
  let endtime = moment(eventData.end_at);
  let s = starttime.format('MMMM Do YYYY');
  let e = endtime.format('MMMM Do YYYY');
  return (
    <Paper className={classes.root}>
      <Card>
        <CardContent>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom>
            Evaluate Event:
          </Typography>
          <Typography variant="h1" component="h1">
            <b>{unsanitize(eventData.title)}</b>
          </Typography>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom>
            Date: <b>{s === e ? s : s + ' to ' + e}</b>
            <br />
            Time:{' '}
            <b>
              {eventData.time_allday
                ? 'All Day'
                : starttime.format('hh:mm a') +
                  ' to ' +
                  endtime.format('hh:mm a')}
            </b>
          </Typography>

          <Table
            className={classes.table}
            size="small"
            aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Name</TableCell>
                <TableCell align="left">Chair</TableCell>
                <TableCell align="left">Attended</TableCell>
                <TableCell align="left">Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attending.map(row => (
                <TableRow key={row.uid}>
                  <TableCell component="th" scope="row">
                    {row.firstname + ' ' + row.lastname}
                  </TableCell>
                  <TableCell align="left">
                    <Checkbox
                      id={'check' + row.uid}
                      color="primary"
                      checked={attendingChair[row.uid]}
                      onChange={makeHandleChair(row.uid)}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <Select
                      id={'select' + row.uid}
                      defaultValue={attendingSelect[row.uid]}
                      onChange={makeHandleSelect(row.uid)}>
                      <MenuItem value={0}>Flaked</MenuItem>
                      <MenuItem value={1}>Attended</MenuItem>
                      <MenuItem value={2}>Removed</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="left">
                    <TextField
                      id={'text' + row.uid}
                      type="number"
                      label="Hours"
                      defaultValue={attendingHours[row.uid]}
                      onChange={makeHandleHours(row.uid)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardActions>
          <Button
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: 30
            }}
            size="large"
            variant="outlined"
            onClick={submitEval}>
            Submit
          </Button>
        </CardActions>
      </Card>
    </Paper>
  );
};

const useStyles = makeStyles({
  root: {
    marginTop: 30,
    marginRight: 30,
    marginLeft: 30
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginTop: 12
  }
});

export default withRouter(EvaluateEvent);
