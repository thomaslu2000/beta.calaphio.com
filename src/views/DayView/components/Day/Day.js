import React, { useState, useEffect } from 'react';
import { ViewState, EditingState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  DayView,
  Appointments,
  AppointmentTooltip,
  Resources,
  Toolbar,
  DateNavigator,
  AppointmentForm,
  EditRecurrenceMenu,
  AllDayPanel,
  ConfirmationDialog
} from '@devexpress/dx-react-scheduler-material-ui';
import { Button, Grid, Box } from '@material-ui/core';
import makeBasicLayout from '../../../BasicAppointmentLayout';
import Event from './Event';
import axios from 'axios';
import moment from 'moment';
import { unsanitize, dayToObj } from '../../../functions';
import {
  makeTypes,
  makeCommitChanges
} from '../../../AppointmentFormFunctions';
import { useGlobal } from 'reactn';
const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const Header = f => {
  let h = ({ children, appointmentData, classes, ...restProps }) => {
    f(appointmentData);
    return (
      <AppointmentTooltip.Header
        {...restProps}
        appointmentData={appointmentData}>
        <Button
          style={{ marginTop: 10 }}
          variant="contained"
          disabled
          // onClick={() => f(appointmentData)}
        >
          <h4>Event Shown</h4>
        </Button>
      </AppointmentTooltip.Header>
    );
  };
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

const Day = props => {
  const [currentDate, setCurrentDate] = useState(props.day);
  const [eventData, setEventData] = useState(false);
  const [stretchDay, setStretchDay] = useState(false);
  const [data, setData] = useState([]);
  const make = [];
  const [global] = useGlobal();

  useEffect(() => {
    getDayEvents();
  }, [currentDate]);

  let TimeTableCell = ({ onDoubleClick, ...restProps }) => {
    if (make.length === 0) make.push(onDoubleClick);
    return (
      <DayView.TimeTableCell onDoubleClick={onDoubleClick} {...restProps} />
    );
  };

  let ToolbarRootBase = () => {
    return ({ ...restProps }) => (
      <Toolbar.Root
        {...restProps}
        children={
          <div
            align="right"
            style={{
              paddingTop: 10,
              marginLeft: 'auto'
            }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                make[0]();
              }}>
              <h4>Create Event</h4>
            </Button>
          </div>
        }
      />
    );
  };

  const getDayEvents = async () => {
    await axios
      .get(`${API_URL}/events/day/`, {
        params: {
          startDate: moment(currentDate)
            .subtract(1, 'days')
            .utc()
            .format('YYYY-MM-DD HH:mm:ss'),
          endDate: moment(currentDate)
            .add(1, 'days')
            .add(1, 'days')
            .utc()
            .format('YYYY-MM-DD HH:mm:ss')
        }
      })
      .then(response => {
        setData(response.data.map(dayToObj));
      });
  };

  if (data.length > 0 && props.eventId) {
    let d = data.find(a => a.event_id === props.eventId);
    if (d && !eventData) setEventData(d);
  }

  const commitChanges = makeCommitChanges(({ added, changed, deleted }) => {
    window.location.reload(false);
  }, global.userId);

  const onAppointmentEdit = changes => {
    if ('rRule' in changes) {
      if (changes['rRule'] === undefined) {
        setStretchDay(false);
      } else {
        setStretchDay(true);
      }
    }
  };

  return (
    <Grid container>
      <Box clone order={{ xs: 2, sm: 2, md: 1 }}>
        <Grid item md={stretchDay ? 12 : 7} sm={12}>
          <Scheduler data={data}>
            <ViewState
              currentDate={currentDate}
              onCurrentDateChange={date => {
                setCurrentDate(date);
              }}
            />
            <EditingState onCommitChanges={commitChanges} />
            <DayView
              cellDuration={180}
              timeTableCellComponent={TimeTableCell}
            />
            <Appointments />
            <Resources data={resources} />
            <Toolbar flexibleSpaceComponent={ToolbarRootBase()} />
            <AllDayPanel />
            <EditRecurrenceMenu />
            <ConfirmationDialog />
            <DateNavigator />
            <AppointmentTooltip
              headerComponent={Header(eventData => {
                setEventData(eventData);
                window.history.replaceState(
                  null,
                  '',
                  `#/day/${props.dayText}/event/${eventData.event_id}`
                );
              })}
              showCloseButton
              showOpenButton
              showDeleteButton
            />
            {global.userId && (
              <AppointmentForm
                basicLayoutComponent={makeBasicLayout(onAppointmentEdit)}
              />
            )}
          </Scheduler>
        </Grid>
      </Box>
      <Box clone order={{ sm: 1, md: 2 }}>
        <Grid
          item
          md={5}
          sm={12}
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: 5,
            paddingRight: 5,
            zIndex: '0'
          }}>
          <Event eventData={eventData} />
        </Grid>
      </Box>
    </Grid>
  );
};

export default Day;
