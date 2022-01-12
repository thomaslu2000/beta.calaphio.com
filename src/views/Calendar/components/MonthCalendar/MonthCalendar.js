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
import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  ListItemSecondaryAction
} from '@material-ui/core';
import LaunchIcon from '@material-ui/icons/Launch';
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
    <br />
    <hr />
    <br />
    <h2>Events</h2>
    <List component="nav" aria-label="events">
      {appointmentData.description.map(item => {
        return (
          <ListItem
            button
            component="a"
            key={item}
            href={`#/day/${item[2]}/event/${item[0]}`}>
            <ListItemIcon>
              <LaunchIcon color="secondary" />
            </ListItemIcon>
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
  const [height, setHeight] = useState(false);

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

  const Appointment = ({ children, style, data, ...restProps }) => (
    <Appointments.Appointment
      {...restProps}
      style={{
        ...style,
        backgroundColor: data.color || ''
      }}
      data={data}>
      {children}
    </Appointments.Appointment>
  );

  const makeTSC = height => {
    let style = height ? { height: height } : {};
    return props => (
      <MonthView.TimeTableCell
        {...props}
        style={style}
        onClick={() => {
          history.push(`/day/${moment(props.startDate).format('YYYY-MM-DD')}`);
        }}
      />
    );
  };
  var TimeScaleCell = makeTSC(height);

  useEffect(() => {
    TimeScaleCell = makeTSC(height);
  }, [height]);

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
          let timeStart = moment.utc(item.start_at).local();
          let timeEnd = moment.utc(item.end_at).local();
          if (timeEnd < timeStart) {
            timeEnd = moment(timeStart).add(2, 'hours');
          }
          let date = timeStart.format('YYYY-MM-DD');
          let dateEnd = timeEnd.format('YYYY-MM-DD');
          if (!days[date]) days[date] = [[], [], []];
          days[date][type].push([
            item.event_id,
            unsanitize(item.title),
            date,
            timeStart,
            timeEnd,
            item.color
          ]);
          if (dateEnd !== date) {
            if (!days[dateEnd]) days[dateEnd] = [[], [], []];
            days[dateEnd][type].push([
              item.event_id,
              unsanitize(item.title),
              dateEnd,
              timeStart,
              timeEnd,
              item.color
            ]);
          }
        });
        let newList = [];
        var maxTotal = 0;
        for (const [day, cats] of Object.entries(days)) {
          let date = moment(day);
          let total = cats[0].length + cats[1].length + cats[2].length;
          maxTotal = Math.max(total, maxTotal);
          for (var i = 0; i < 3; i++) {
            cats[i].map((ev, idx) => {
              newList.push({
                title: ev[1],
                startDate: ev[3],
                endDate: ev[4],
                typeId: [3, 5, 6][i],
                description: [ev],
                color: ev[5]
              });
            });
          }
        }
        console.log(newList);
        setData(newList);
        setHeight(maxTotal > 3 && 25 * maxTotal);
      });
  };
  return (
    <Scheduler data={data}>
      <ViewState
        currentDate={currentDate}
        onCurrentDateChange={date => {
          setCurrentDate(date);
        }}
      />
      <MonthView
        cellDuration={120}
        timeTableCellComponent={TimeScaleCell}
        stuff={height}
      />
      <AllDayPanel />
      <Appointments appointmentComponent={Appointment} />
      <Resources data={resources} />
      <Toolbar />
      <DateNavigator />
      <AppointmentTooltip
        headerComponent={Header(data => {
          // console.log(data)
          history.push(`/day/${moment(data.startDate).format('YYYY-MM-DD')}`);
        })}
        contentComponent={Content}
        showCloseButton
      />
    </Scheduler>
  );
};

export default withRouter(MonthCalendar);
