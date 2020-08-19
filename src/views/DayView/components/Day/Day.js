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
import { IconButton, Button, Grid } from '@material-ui/core';
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import BasicLayout from '../../../BasicAppointmentLayout';
import Event from './Event';
import axios from 'axios';
import { unsanitize } from '../../../functions';
import {
  makeTypes,
  makeCommitChanges
} from '../../../AppointmentFormFunctions';
import { useGlobal } from 'reactn';
const API_URL = 'http://localhost:3001';

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
const ToolbarRootBase = setDay => {
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
          <IconButton
            style={{
              backgroundColor: 'rgba(200, 0, 0, 0.1)',
              color: '#000000'
            }}
            onClick={() => {
              setDay();
            }}>
            <KeyboardReturnIcon />
          </IconButton>
        </div>
      }
    />
  );
};

const Day = props => {
  const [currentDate, setCurrentDate] = useState(props.day);
  const [eventData, setEventData] = useState(false);
  const [data, setData] = useState([]);
  const [global] = useGlobal();

  useEffect(() => {
    getDayEvents();
  }, [currentDate]);

  const getDayEvents = async () => {
    await axios
      .get(`${API_URL}/events/day/`, {
        params: {
          date: currentDate.toISOString().slice(0, 10)
        }
      })
      .then(response => {
        setData(
          response.data.map(item => {
            item.startDate = new Date(item.start_at);
            item.endDate = new Date(item.end_at);
            if (item.time_allday === 1) {
              item.allDay = true;
            }
            item.title = unsanitize(item.title);
            item.location = unsanitize(item.location || '');
            item.description = unsanitize(item.description || '');
            item.id = item.event_id;
            item.typeId = item.type_service_chapter
              ? 1
              : item.type_service_campus
              ? 2
              : item.type_service_community
              ? 3
              : item.type_service_country
              ? 4
              : item.type_fellowship
              ? 5
              : 6;
            return item;
          })
        );
      });
  };

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
          <DayView cellDuration={180} />
          <Appointments />
          <Resources data={resources} />
          <Toolbar flexibleSpaceComponent={ToolbarRootBase(props.setDay)} />
          <AllDayPanel />
          <EditRecurrenceMenu />
          <ConfirmationDialog />
          <DateNavigator />
          <AppointmentTooltip
            headerComponent={Header(eventData => {
              setEventData(eventData);
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
