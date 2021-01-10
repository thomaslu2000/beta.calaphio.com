import React, { useState } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Typography,
  TextField
} from '@material-ui/core';
import { unsanitize, clean } from '../../../functions';
import { useGlobal } from 'reactn';
import * as XLSX from 'xlsx';

const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles((theme) => ({
  padded: {
    padding: theme.spacing(4)
  }
}));


const AddPledges = props => {
  const classes = useStyles();
  const [value, setValue] = useState({});
  const [pledgeclass, setPledgeclass] = useState("");
  const [global] = useGlobal();


  const handleUpload = (e) => {
    e.preventDefault();

    var files = e.target.files, f = files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        var data = e.target.result;
        let readedData = XLSX.read(data, {type: 'binary'});
        const wsname = readedData.SheetNames[0];
        const ws = readedData.Sheets[wsname];

        /* Convert array to json*/
        const dataParse = XLSX.utils.sheet_to_json(ws, {header:1, raw: false});
        let keys = dataParse.shift();
        let newData = [];
        for (let i = 0; i < dataParse.length; i++) {
            while (dataParse[i].length < keys.length) dataParse[i].push("");
            newData.push(
                dataParse[i].map((e, j) => e.replaceAll(',', 'ˏ')).toString()
            );
        }
        let base = {keys:keys.toString(), data:newData.join('%&^%')};
        setValue(base);
    };
    reader.readAsBinaryString(f);
    }

  return (
      <div style={{textAlign: 'center'}}>
          <Typography variant='body1' color='textSecondary'>Note: xlsx must have very specific column names. Copy this example 
          <a target="_blank" href="https://docs.google.com/spreadsheets/d/14mEUs3y4nEW30mpcCqIRayEwmxQ330l7rTinpQzPX9w/edit?usp=sharing"> HERE</a>,
           make sure to download as xlsx. It is ok to leave some fields blank, 
           but you must have the student id (sid) and email. The default password is the student id.</Typography>
        <TextField
              label="Pledge Class Acronym"
              value={pledgeclass}
              onChange={(e) => {
                setPledgeclass(e.target.value);
              }}
              variant="outlined"
            /><br />

            <Button
            variant="contained"
            component="label"
            style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: 10
              }}
            >
            {Object.keys(value).length > 0 ? 'xlsx Loaded' : 'Upload xlsx'}
            <input
            type="file"
            hidden
            accept=".xls,.xlsx"
            onChange={handleUpload}
            />
            </Button><br />
        <Button
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 10
          }}
          size="large"
          variant="outlined"
          onClick={() => {
              if (value.data.length > 0){
                value['pledgeclass'] = pledgeclass;
                value['uid'] = global.userId;
                axios
                .post(`${API_URL}/admin/addPledges`, 
                value
                , {
                    headers: { 'content-type': 'application/x-www-form-urlencoded' }
                })
                .then(res => {
                    if (res.data.length === 0) alert("SUCCESS");
                    else alert("FAILED, please verify csv");
                });
                  
              }
                
              }}>
          Submit Pledge Data
        </Button>
      </div>
  );
};

export default AddPledges;
