import React from 'react';

import { AppointmentForm } from '@devexpress/dx-react-scheduler-material-ui';
const BasicLayout = ({ onFieldChange, appointmentData, ...restProps }) => {
  const onLocationChange = nextValue => {
    onFieldChange({ location: nextValue });
  };
  const onInterChange = nextValue => {
    onFieldChange({ interchapter: nextValue });
  };
  const onFundChange = nextValue => {
    onFieldChange({ fundraiser: nextValue });
  };

  return (
    <AppointmentForm.BasicLayout
      locale={'en-US'}
      appointmentData={appointmentData}
      onFieldChange={onFieldChange}
      {...restProps}>
      <AppointmentForm.Label text="Location" type="title" />
      <AppointmentForm.TextEditor
        value={appointmentData.location}
        onValueChange={onLocationChange}
        placeholder="Location"
      />
      <AppointmentForm.BooleanEditor
        value={appointmentData.interchapter}
        onValueChange={onInterChange}
        label="Interchapter?"
      />
      <AppointmentForm.BooleanEditor
        value={appointmentData.fundraiser}
        onValueChange={onFundChange}
        label="Fundraiser?"
      />
    </AppointmentForm.BasicLayout>
  );
};

export default BasicLayout;
