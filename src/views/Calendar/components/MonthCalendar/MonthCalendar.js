import React, { useState, useEffect } from 'react';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  MonthView,
  Appointments,
  AppointmentTooltip,
  Resources,
  Toolbar,
  DateNavigator,
  AllDayPanel
} from '@devexpress/dx-react-scheduler-material-ui';
import { Button, List, ListItem, ListItemText } from '@material-ui/core';
import axios from 'axios';
import moment from 'moment';
import { makeTypes } from '../../../AppointmentFormFunctions';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { unsanitize } from '../../../functions';
const API_URL = process.env.REACT_APP_SERVER;

const Header = f => {
  let h = ({ children, appointmentData, classes, ...restProps }) => (
    <AppointmentTooltip.Header {...restProps} appointmentData={appointmentData}>
      <Button
        style={{ marginTop: 10 }}
        variant="contained"
        onClick={() => f(appointmentData)}>
        <h4>View Day</h4>
      </Button>
    </AppointmentTooltip.Header>
  );
  return h;
};

const types = makeTypes();

const resources = [
  {
    fieldName: 'typeId',
    title: 'Type',
    instances: types
  }
];

const Content = ({ children, appointmentData, classes, ...restProps }) => (
  <AppointmentTooltip.Content {...restProps} appointmentData={appointmentData}>
    <h2>Events</h2>
    <List component="nav" aria-label="events">
      {appointmentData.description.map(item => {
        return (
          <ListItem
            button
            component="a"
            key={item}
            href={`#/day/${item[2]}/event/${item[0]}`}>
            <ListItemText primary={item[1]} />
          </ListItem>
        );
      })}
    </List>
  </AppointmentTooltip.Content>
);
const MonthCalendar = props => {
  const { history } = props;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState([]);

  useEffect(() => {
    let today = moment(currentDate);
    getMonthEvents(
      today
        .clone()
        .add(-5, 'week')
        .format('YYYY-MM-DD'),
      today
        .clone()
        .add(5, 'week')
        .format('YYYY-MM-DD')
    );
  }, [currentDate]);

  const TimeScaleCell = props => (
    <MonthView.TimeTableCell
      {...props}
      onClick={() => {
        history.push(`/day/${props.startDate.toISOString().slice(0, 10)}`);
      }}
    />
  );
  const getMonthEvents = async (start, end) => {
    await axios
      .get(`${API_URL}/events/month/`, {
        params: {
          startDate: start,
          endDate: end
        }
      })
      .then(response => {
        let days = {};
        response.data.map(item => {
          let type = item.service === '1' ? 0 : item.fellowship === '1' ? 1 : 2;
          let date = moment
            .utc(item.start_at)
            .local()
            .format('YYYY-MM-DD');
          if (!days[date]) days[date] = [[], [], []];
          days[date][type].push([item.event_id, unsanitize(item.title), date]);
        });
        let newList = [];
        for (const [day, cats] of Object.entries(days)) {
          let date = moment(day);
          let startDate = date.toDate();
          let endDate = date.add(23, 'hours').toDate();
          if (cats[0].length > 0)
            newList.push({
              title: `${cats[0].length} Service Events`,
              startDate,
              endDate,
              typeId: 3,
              description: cats[0]
            });
          if (cats[1].length > 0)
            newList.push({
              title: `${cats[1].length} Fellowships`,
              startDate,
              endDate,
              typeId: 5,
              description: cats[1]
            });
          if (cats[2].length > 0)
            newList.push({
              title: `${cats[2].length} Other Events`,
              startDate,
              endDate,
              typeId: 6,
              description: cats[2]
            });
        }
        setData(newList);
      });
  };
  return (
    <Scheduler data={data} height={660}>
      <ViewState
        currentDate={currentDate}
        onCurrentDateChange={date => {
          setCurrentDate(date);
        }}
      />
      <MonthView cellDuration={120} timeTableCellComponent={TimeScaleCell} />
      <AllDayPanel />
      <Appointments />
      <Resources data={resources} />
      <Toolbar />
      <DateNavigator />
      <AppointmentTooltip
        headerComponent={Header(data => {
          history.push(`/day/${data.startDate.toISOString().slice(0, 10)}`);
        })}
        contentComponent={Content}
        showCloseButton
      />
    </Scheduler>
  );
};

export default withRouter(MonthCalendar);
