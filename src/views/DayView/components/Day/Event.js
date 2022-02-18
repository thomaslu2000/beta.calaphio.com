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
import { SearchUser } from '../../../../components/';
import axios from 'axios';
import moment from 'moment';
import { useGlobal } from 'reactn';
import { unsanitize, gCalAdd } from '../../../functions';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Comments from './Comments';

const API_SECRET = process.env.REACT_APP_SECRET;
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

const lock_hours = 24;

const Event = props => {
  const classes = useStyles();
  const { eventData, history } = props;
  const [attending, setAttending] = useState([]);
  const [imAttending, setImAttending] = useState(false);
  const [imChair, setImChair] = useState(false);
  const [imAdmin, setImAdmin] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [toAdd, setToAdd] = useState(false);
  const [addingPart, setAddingPart] = useState(false);
  const [global] = useGlobal();

  useEffect(() => {
    if (eventData) {
      getAttending();
      getAdmin();
    }
  }, [eventData]);

  const getAdmin = async () => {
    await axios
      .get(`${API_URL}/people/adminOrChair`, {
        params: {
          userId: global.userId || -1,
          token: global.token || -1,
          eventId: eventData.event_id
        }
      })
      .then(res => {
        setImAdmin(res.data.length > 0);
      });
  };

  const getAttending = async () => {
    await axios
      .get(`${API_URL}/events/attending/`, {
        params: {
          eventId: eventData.event_id
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
  const signUpTarget = async (uid, firstname = 'New', lastname = 'User') => {
    if (uid)
      await axios
        .post(
          `${API_URL}/adminOrChair/signUpTarget/`,
          {
            eventId: eventData.event_id,
            userId: global.userId,
            targetId: uid,
            token: global.token,
            timestamp: moment()
              .utc()
              .format('YYYY-MM-DD HH:mm:ss'),
            API_SECRET
          },
          { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
        )
        .then(response => {
          // setImAttending(firstname == '' && lastname == 'You');
          let n = [
            {
              signup_time: moment()
                .utc()
                .format('YYYY-MM-DD HH:mm:ss'),
              chair: 0,
              uid,
              firstname,
              lastname
            },
            ...attending
          ];
          setAttending(n);
        });
  };

  const signOffTarget = async uid => {
    await axios
      .post(
        `${API_URL}/adminOrChair/signOffTarget/`,
        {
          eventId: eventData.event_id,
          userId: global.userId,
          targetId: uid,
          token: global.token,
          API_SECRET
        },
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
      )
      .then(response => {
        setAttending(attending.filter(x => x.uid !== uid));
        setImAttending(false);
        setImChair(false);
      });
  };

  const signUp = async (uid, firstname = '', lastname = 'You') => {
    if (uid)
      await axios
        .post(
          `${API_URL}/events/signUp/`,
          {
            eventId: eventData.event_id,
            userId: uid,
            token: global.token,
            timestamp: moment()
              .utc()
              .format('YYYY-MM-DD HH:mm:ss'),
            API_SECRET
          },
          { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
        )
        .then(response => {
          setImAttending(firstname == '' && lastname == 'You');
          let n = [
            {
              signup_time: moment()
                .utc()
                .format('YYYY-MM-DD HH:mm:ss'),
              chair: 0,
              uid,
              firstname,
              lastname
            },
            ...attending
          ];
          setAttending(n);
        });
  };

  const signOff = async uid => {
    await axios
      .post(
        `${API_URL}/events/signOff/`,
        {
          eventId: eventData.event_id,
          userId: uid,
          token: global.token,
          API_SECRET
        },
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
      )
      .then(response => {
        setAttending(attending.filter(x => x.uid !== uid));
        setImAttending(false);
        setImChair(false);
      });
  };

  const becomeChair = async () => {
    await axios
      .post(
        `${API_URL}/events/changeChair/`,
        {
          eventId: eventData.event_id,
          userId: global.userId,
          token: global.token,
          setting: 1,
          API_SECRET
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
    setImChair(false);
    await axios
      .post(
        `${API_URL}/events/changeChair/`,
        {
          eventId: eventData.event_id,
          userId: global.userId,
          token: global.token,
          setting: 0,
          API_SECRET
        },
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
      )
      .then(response => {
        setAttending(
          attending.map(x => {
            if (x.uid === global.userId) x.chair = 0;
            return x;
          })
        );
      });
  };

  useEffect(() => {
    if (toAdd) {
      setAddingPart(false);
      signUpTarget(toAdd.uid, toAdd.firstname, toAdd.lastname);
      setToAdd(false);
    }
  }, [toAdd]);

  if (!eventData) {
    return (
      <Card
        className={classes.root}
        style={{
          marginTop: 30,
          marginRight: 20,
          padding: '30px 10px 30px 10px'
        }}>
        <Typography variant="h5" component="h2">
          <b>Select An Event on the Schedule</b>
        </Typography>
      </Card>
    );
  }

  let starttime = moment(eventData.startDate);
  let endtime = moment(eventData.endDate);
  let s = starttime.format('MMMM Do YYYY');
  let e = endtime.format('MMMM Do YYYY');

  const sayChair = row => {
    let symbol = (
      <React.Fragment>
        👑
        <br />
      </React.Fragment>
    );
    if (row.uid === global.userId) {
      if (imChair) return symbol;
      else return;
    }
    return row.chair === '1' && symbol;
  };

  return (
    <Card className={classes.root}>
      <Helmet>
        <title>{eventData.title}</title>
        <meta property="og:title" content={eventData.title} />
      </Helmet>
      <CardHeader
        action={
          <Button
            size="large"
            variant="outlined"
            onClick={() => {
              gCalAdd([eventData]);
            }}>
            Add To Google Calendar
          </Button>
        }
      />
      <CardContent>
        <Typography variant="h5" component="h2">
          <b>{eventData.title}</b>
          {(imChair || imAdmin) && (
            <Button
              // size="large"
              variant="outlined"
              style={{ float: 'right' }}
              onClick={() => {
                history.push(`/evaluate/${eventData.event_id}`);
              }}>
              Evaluation
            </Button>
          )}
        </Typography>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom>
          Date: <b>{s === e ? s : s + ' to ' + e}</b>
          <br />
          Time:{' '}
          <b>
            {eventData.time_allday === '1'
              ? 'All Day'
              : starttime.format('h:mm a') + ' to ' + endtime.format('h:mm a')}
          </b>
        </Typography>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom>
          Location: <b>{eventData.location || 'No Location Provided'}</b>
        </Typography>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom>
          Event Type: <b>{eventType(eventData)}</b>
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          Description:
        </Typography>
        <Typography
          variant="body2"
          component="p"
          dangerouslySetInnerHTML={{
            __html: eventData.description || 'No Description Provided'
          }}></Typography>

        {addingPart && <SearchUser toAdd={setToAdd} />}

        <CardActions>
          {(imChair || imAdmin) && (
            <Button
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
              size="large"
              onClick={() => {
                setAddingPart(!addingPart);
              }}>
              Add Participant
            </Button>
          )}
          {imAttending && (
            <Button
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
              size="large"
              onClick={imChair ? loseChair : becomeChair}>
              {imChair ? 'Give Up Chair' : 'Become Chair'}
            </Button>
          )}
          {imAttending &&
          moment.duration(moment(eventData.start_at).diff(moment())).asHours() <
            lock_hours ? (
            <Button
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
              size="large"
              disabled>
              Too Late to Drop
            </Button>
          ) : (
            <Button
              style={{ marginLeft: 'auto', marginRight: 'auto' }}
              size="large"
              onClick={() => {
                imAttending ? signOff(global.userId) : signUp(global.userId);
              }}>
              {imAttending ? 'Take Me Off' : 'Sign Up'}
            </Button>
          )}
        </CardActions>
        <Table
          className={classes.table}
          size="small"
          aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">How to Reach</TableCell>
              <TableCell align="left">Sign Up Time</TableCell>
              {(imChair || imAdmin) && (
                <TableCell align="center">Drop</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {attending.map(row => (
              <TableRow key={row.firstname + row.lastname}>
                <TableCell component="th" scope="row">
                  {sayChair(row)} {row.firstname} {row.lastname}
                </TableCell>
                <TableCell component="th" scope="row">
                  {unsanitize(row.phone)}
                </TableCell>
                <TableCell align="left">
                  {moment
                    .utc(row.signup_time)
                    .local()
                    .fromNow()}
                </TableCell>
                {(imChair || imAdmin) && (
                  <TableCell align="center">
                    <Button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Drop ${row.firstname} ${row.lastname} From Event?`
                          )
                        ) {
                          signOffTarget(row.uid, row.firstname, row.lastname);
                        }
                      }}>
                      ❌
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardActions>
        <Button
          className={classes.alignMid}
          size="small"
          onClick={() => {
            setShowComments(!showComments);
          }}>
          {showComments ? 'Hide' : 'Show'} Comments
        </Button>
      </CardActions>
      {showComments && <Comments eventId={eventData.event_id} />}
    </Card>
  );
};

const useStyles = makeStyles({
  root: {
    minWidth: 300,
    marginTop: 30,
    border: 'none',
    boxShadow: 'none'
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginTop: 12
  },
  table: {
    width: '100%'
  },
  alignMid: {
    marginLeft: 'auto',
    marginRight: 'auto'
  }
});

export default withRouter(Event);
