import React, { useState, useEffect } from 'react';

import { AppointmentForm } from '@devexpress/dx-react-scheduler-material-ui';

import { DialogTitle, Dialog } from '@material-ui/core';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/lib/css/styles.css';

const makeBasicLayout = onRecurrence => {
  let BasicLayout = ({ onFieldChange, appointmentData, ...restProps }) => {
    // const [specialColor, setSpecialColor] = useState('');
    const defCol = {
      hex: '#ebb434',
      hsv: { h: 42, s: 77.9, v: 92.2, a: undefined },
      rgb: { r: 235, g: 180, b: 52, a: undefined }
    };

    const [open, setOpen] = useState(false);
    const [useCustomColor, setUseCustomColor] = useState(false);
    const [color, setColor] = useColor('hex', defCol.hex);

    const onLocationChange = nextValue => {
      onFieldChange({ location: nextValue });
    };
    const onInterChange = nextValue => {
      onFieldChange({ interchapter: nextValue });
    };
    const onFundChange = nextValue => {
      onFieldChange({ fundraiser: nextValue });
    };
    const onLimitChange = nextValue => {
      onFieldChange({ signup_limit: nextValue });
    };

    const onColorChange = nextValue => {
      if (nextValue) {
        setOpen(true);
      } else {
        setColor(defCol);
        setUseCustomColor(false);
        onFieldChange({ customColor: '' });
      }
    };

    return (
      <AppointmentForm.BasicLayout
        appointmentData={appointmentData}
        onFieldChange={blah => {
          onRecurrence(blah);
          onFieldChange(blah);
        }}
        {...restProps}
        // locale={'en-us'}
      >
        <AppointmentForm.Label text="Location" type="title" />
        <AppointmentForm.TextEditor
          value={appointmentData.location}
          onValueChange={onLocationChange}
          placeholder="Location"
        />
        <AppointmentForm.Label text="Signup Limit" type="title" />
        <AppointmentForm.Label
          text="(Set to 0 for no limit)"
          type="ordinaryLabel"
        />
        <AppointmentForm.TextEditor
          value={appointmentData.signup_limit}
          type="numberEditor"
          onValueChange={onLimitChange}
          placeholder={'0'}
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
        <AppointmentForm.Label
          text="Custom Color"
          type="title"
          style={{ color: useCustomColor && color.hex }}
        />
        <Dialog
          onClose={() => {
            setOpen(false);
          }}
          open={open}>
          <ColorPicker
            width={456}
            height={228}
            color={color}
            onChange={e => {
              setUseCustomColor(true);
              setColor(e);
              onFieldChange({ customColor: e.hex });
            }}
            hideHSV
            // dark
          />
          ;
        </Dialog>
        <AppointmentForm.BooleanEditor
          value={appointmentData.customColor}
          onValueChange={onColorChange}
          label="Use Custom Color"
        />
      </AppointmentForm.BasicLayout>
    );
  };
  return BasicLayout;
};
export default makeBasicLayout;
