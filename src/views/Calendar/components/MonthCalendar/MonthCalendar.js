import React, { useState, useEffect } from 'react';
import { ViewState, EditingState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  MonthView,
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
import Button from '@material-ui/core/Button';
import BasicLayout from '../../../BasicAppointmentLayout';
import axios from 'axios';
import moment from 'moment';
import {
  makeTypes,
  makeCommitChanges
} from '../../../AppointmentFormFunctions';
import { useGlobal } from 'reactn';
import { Link as RouterLink, withRouter } from 'react-router-dom';
const API_URL = 'http://localhost:3001';

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

const MonthCalendar = props => {
  const { history } = props;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [global] = useGlobal();

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

  const getMonthEvents = async (start, end) => {
    await axios
      .get(`${API_URL}/events/counts/`, {
        params: {
          startDate: start,
          endDate: end
        }
      })
      .then(response => {
        let newList = [];
        response.data.map(item => {
          let service = item.service || 0;
          let fellowship = item.fellowships || 0;
          let total = item.total - service - fellowship || 0;
          let date = moment(item.date);
          let startDate = date.toDate();
          let endDate = date.add(8, 'hours').toDate();
          if (service > 0)
            newList.push({
              title: `${service} Service Events`,
              startDate,
              endDate,
              typeId: 3
            });
          if (fellowship > 0)
            newList.push({
              title: `${fellowship} Fellowships`,
              startDate,
              endDate,
              typeId: 5
            });
          if (total > 0)
            newList.push({
              title: `${total} Other Events`,
              startDate,
              endDate,
              typeId: 6
            });
          return 0;
        });
        setData(newList);
      });
  };
  const commitChanges = makeCommitChanges(({ added, changed, deleted }) => {
    window.location.reload(false);
  }, global.userId);
  return (
    <Scheduler data={data} height={660}>
      <ViewState
        currentDate={currentDate}
        onCurrentDateChange={date => {
          setCurrentDate(date);
        }}
      />
      <EditingState onCommitChanges={commitChanges} />
      <MonthView cellDuration={120} />
      <AllDayPanel />
      <EditRecurrenceMenu />
      <ConfirmationDialog />
      <Appointments />
      <Resources data={resources} />
      <Toolbar />
      <DateNavigator />
      <AppointmentTooltip
        headerComponent={Header(data => {
          history.push(`/day/${data.startDate.toISOString().slice(0, 10)}`);
        })}
        showCloseButton
      />
      {global.userId && <AppointmentForm basicLayoutComponent={BasicLayout} />}
    </Scheduler>
  );
};

export default withRouter(MonthCalendar);
