import React from 'react';
import Paper from '@material-ui/core/Paper';
import { Day } from './components';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import moment from 'moment';

const DayView = props => {
  const { history } = props;

  if (!props.match.params.day) {
    history.push('/not-found');
  }

  let d = new Date(props.match.params.day);
  let day = moment(d)
    .add(d.getTimezoneOffset(), 'm')
    .toDate();
  return (
    <Paper style={{width: '100%', marginRight:0}}>
      <Day
        day={day}
        eventId={props.match.params.event}
        dayText={props.match.params.day}
      />
    </Paper>
  );
};

export default withRouter(DayView);
