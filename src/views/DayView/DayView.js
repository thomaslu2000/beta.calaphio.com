import React from 'react';
import Paper from '@material-ui/core/Paper';
import { Day } from './components';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import moment from 'moment';

const DayView = props => {
  if (!props.match.params.day) {
    history.push('/not-found');
  }

  let d = new Date(props.match.params.day);
  let day = moment(d)
    .add(d.getTimezoneOffset(), 'm')
    .toDate();
  const { history } = props;
  return (
    <Paper>
      <Day
        day={day}
        setDay={() => {
          history.goBack();
        }}
      />
    </Paper>
  );
};

export default withRouter(DayView);
