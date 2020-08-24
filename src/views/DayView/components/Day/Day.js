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
import { Button, Grid } from '@material-ui/core';
import BasicLayout from '../../../BasicAppointmentLayout';
import Event from './Event';
import axios from 'axios';
import moment from 'moment';
import { unsanitize } from '../../../functions';
import {
  makeTypes,
  makeCommitChanges
} from '../../../AppointmentFormFunctions';
import { useGlobal } from 'reactn';
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
            .utc()
            .format('YYYY-MM-DD HH:mm:ss'),
          endDate: moment(currentDate)
            .add(1, 'days')
            .utc()
            .format('YYYY-MM-DD HH:mm:ss')
        }
      })
      .then(response => {
        setData(
          response.data.map(item => {
            item.startDate = moment
              .utc(item.start_at.replace(' ', 'T'))
              .local()
              .toDate();
            item.endDate = moment
              .utc(item.end_at.replace(' ', 'T'))
              .local()
              .toDate();
            if (item.time_allday === 1) {
              item.allDay = true;
            }
            item.title = unsanitize(item.title);
            item.location = unsanitize(item.location || '');
            item.description = unsanitize(item.description || '');
            item.id = item.event_id;
            item.typeId =
              item.type_service_chapter === '1'
                ? 1
                : item.type_service_campus === '1'
                ? 2
                : item.type_service_community === '1'
                ? 3
                : item.type_service_country === '1'
                ? 4
                : item.type_fellowship === '1'
                ? 5
                : 6;
            return item;
          })
        );
      });
  };

  if (data.length > 0 && props.eventId) {
    let d = data.find(a => a.event_id === props.eventId);
    if (d && !eventData) setEventData(d);
  }

  const commitChanges = makeCommitChanges(({ added, changed, deleted }) => {
    window.location.reload(false);
  }, global.userId);

  return (
    <Grid container spacing={4}>
      <Grid item lg={8} sm={8}>
        <Scheduler data={data}>
          <ViewState
            currentDate={currentDate}
            onCurrentDateChange={date => {
              setCurrentDate(date);
            }}
          />
          <EditingState onCommitChanges={commitChanges} />
          <DayView cellDuration={180} timeTableCellComponent={TimeTableCell} />
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
                'Calaphio Website',
                `#/day/${props.dayText}/event/${eventData.event_id}`
              );
            })}
            showCloseButton
            showOpenButton
            showDeleteButton
          />
          {global.userId && (
            <AppointmentForm basicLayoutComponent={BasicLayout} />
          )}
        </Scheduler>
      </Grid>
      <Grid
        item
        lg={4}
        sm={12}
        style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <Event eventData={eventData} />
      </Grid>
    </Grid>
  );
};

export default Day;
