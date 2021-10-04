import React, { useState, useEffect } from 'react';

import { AppointmentForm } from '@devexpress/dx-react-scheduler-material-ui';

import { DialogTitle, Dialog } from '@material-ui/core';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/lib/css/styles.css';

const makeBasicLayout = onRecurrence => {
  let BasicLayout = ({ onFieldChange, appointmentData, ...restProps }) => {
    // const [specialColor, setSpecialColor] = useState('');
    const [open, setOpen] = useState(false);
    const [color, setColor] = useColor('hex', '#121212');
    const defCol = {
      hex: '#121212',
      hsv: { h: 0, s: 0, v: 7.0588235294117645, a: undefined },
      rgb: { r: 18, g: 18, b: 18, a: undefined }
    };

    const onLocationChange = nextValue => {
      onFieldChange({ location: nextValue });
    };
    const onInterChange = nextValue => {
      onFieldChange({ interchapter: nextValue });
    };
    const onFundChange = nextValue => {
      onFieldChange({ fundraiser: nextValue });
    };

    const onColorChange = nextValue => {
      if (nextValue) {
        setOpen(true);
      } else {
        setColor(defCol);
        onFieldChange({ customColor: '' });
      }
    };

    return (
      <AppointmentForm.BasicLayout
        locale={'en-US'}
        appointmentData={appointmentData}
        onFieldChange={blah => {
          onRecurrence(blah);
          onFieldChange(blah);
        }}
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
        <AppointmentForm.Label
          text="Custom Color"
          type="title"
          style={{ color: color.hex }}
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
