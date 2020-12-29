import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import axios from 'axios';
import moment from 'moment';
import { useGlobal } from 'reactn';
import { gCalAdd } from '../../../functions';

const API_URL = process.env.REACT_APP_SERVER;

const eventType = item => {
  let types = [];
  if (item.type_service_chapter === '1') types.push('Service to Chapter');
  if (item.type_service_campus === '1') types.push('Service to Campus');
  if (item.type_service_community === '1') types.push('Service to Community');
  if (item.type_service_country === '1') types.push('Service to Country');
  if (item.type_fellowship === '1') types.push('Fellowship');
  if (item.type_interchapter === '1') types.push('Interchapter');
  if (types.length === 0) types.push('Other');
  return types.join(', ');
};


export default function Event(props) {
  const classes = useStyles();
  const [attending, setAttending] = useState([]);
  const [imAttending, setImAttending] = useState(false);
  const [imChair, setImChair] = useState(false);
  const [global] = useGlobal();

  useEffect(() => {
    if (props.eventData) getAttending();
  }, [props.eventData]);

  const getAttending = async () => {
    await axios
      .get(`${API_URL}/events/attending/`, {
        params: {
          eventId: props.eventData.event_id
        }
      })
      .then(response => {
        let own = response.data.find(x => x.uid === global.userId);
        if (own) {
          setImAttending(true);
          setImChair(own.chair === '1');
        } else {
          setImAttending(false);
          setImChair(false);
        }
        setAttending(response.data);
      });
  };

  const signUp = async () => {
    if (global.userId)
      await axios
        .post(
          `${API_URL}/events/signUp/`,
          {
            eventId: props.eventData.event_id,
            userId: global.userId,
            timestamp: moment()
              .utc()
              .format('YYYY-MM-DD HH:mm:ss')
          },
          { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
        )
        .then(response => {
          setImAttending(true);
          let n = [
            {
              uid: global.userId,
              signup_time: moment()
                .utc()
                .format('YYYY-MM-DD HH:mm:ss'),
              chair: 0,
              firstname: '',
              lastname: 'You'
            },
            ...attending
          ];
          setAttending(n);
        });
  };

  const signOff = async () => {
    await axios
      .post(
        `${API_URL}/events/signOff/`,
        {
          eventId: props.eventData.event_id,
          userId: global.userId
        },
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
      )
      .then(response => {
        setAttending(attending.filter(x => x.uid !== global.userId));
        setImAttending(false);
        setImChair(false);
      });
  };

  const becomeChair = async () => {
    await axios
      .post(
        `${API_URL}/events/changeChair/`,
        {
          eventId: props.eventData.event_id,
          userId: global.userId,
          setting: 1
        },
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
      )
      .then(response => {
        setImChair(true);
        setAttending(
          attending.map(x => {
            if (x.uid === global.userId) x.chair = 1;
            return x;
          })
        );
      });
  };
  const loseChair = async () => {
    await axios
      .post(
        `${API_URL}/events/changeChair/`,
        {
          eventId: props.eventData.event_id,
          userId: global.userId,
          setting: 0
        },
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
      )
      .then(response => {
        setImChair(false);
        setAttending(
          attending.map(x => {
            if (x.uid === global.userId) x.chair = 0;
            return x;
          })
        );
      });
  };

  if (!props.eventData) {
    return (
      <Paper
        style={{
          marginTop: 30,
          marginRight: 20,
          padding: '30px 10px 30px 10px'
        }}>
        <Typography variant="h5" component="h2">
          <b>Select An Event on the Schedule</b>
        </Typography>
      </Paper>
    );
  }
  let starttime = moment(props.eventData.startDate);
  let endtime = moment(props.eventData.endDate);
  let s = starttime.format('MMMM Do YYYY');
  let e = endtime.format('MMMM Do YYYY');

  const sayChair = row => {
    if (row.uid === global.userId) {
      if (imChair) return 'Chair';
      else return;
    }
    return row.chair === '1' && 'Chair';
  };

  return (
    <Paper>
      <Card className={classes.root}>
    <CardHeader
    action={
          <Button
              size="large"
              variant="outlined"
              onClick={() => {gCalAdd([props.eventData])}}>
              Add To Google Calendar
            </Button>} />
        <CardContent>
          <Typography variant="h5" component="h2">
            <b>{props.eventData.title}</b>
          </Typography>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom>
            Date: <b>{s === e ? s : s + ' to ' + e}</b>
            <br />
            Time:{' '}
            <b>
              {props.eventData.time_allday === '1'
                ? 'All Day'
                : starttime.format('h:mm a') +
                  ' to ' +
                  endtime.format('h:mm a')}
            </b>
          </Typography>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom>
            Location:{' '}
            <b>{props.eventData.location || 'No Location Provided'}</b>
          </Typography>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom>
            Event Type: <b>{eventType(props.eventData)}</b>
          </Typography>
          <Typography className={classes.pos} color="textSecondary">
            Description:
          </Typography>
          <Typography
            variant="body2"
            component="p"
            dangerouslySetInnerHTML={{
              __html: props.eventData.description || 'No Description Provided'
            }}></Typography>
          <CardActions>
            {imAttending && (
              <Button
                style={{ marginLeft: 'auto', marginRight: 'auto' }}
                size="large"
                onClick={imChair ? loseChair : becomeChair}>
                {imChair ? 'Give Up Chair' : 'Become Chair'}
              </Button>
            )}
            <Button
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
              size="large"
              onClick={imAttending ? signOff : signUp}>
              {imAttending ? 'Take Me Off' : 'Sign Up'}
            </Button>
          </CardActions>
          <Table
            className={classes.table}
            size="small"
            aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell align="right">Name</TableCell>
                <TableCell align="right">Sign Up Time</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attending.map(row => (
                <TableRow key={row.firstname + row.lastname}>
                  <TableCell component="th" scope="row">
                    {row.firstname + ' ' + row.lastname}
                  </TableCell>
                  <TableCell align="right">
                    {moment
                      .utc(row.signup_time)
                      .local()
                      .fromNow()}
                  </TableCell>
                  <TableCell align="right">{sayChair(row)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Paper>
  );
}

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    marginTop: 30
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginTop: 12
  }
});
