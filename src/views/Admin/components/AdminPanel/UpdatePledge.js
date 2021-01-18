import React, { useState } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField
} from '@material-ui/core';
import { unsanitize } from '../../../functions';

const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles((theme) => ({
  padded: {
    padding: theme.spacing(4)
  }
}));

const UpdatePledge = props => {
  let attending = props.data;
  const classes = useStyles();
  const [statuses, setStatuses] = useState({});

//   console.log(statuses)

  return (
      <div><div style={{textAlign:'center'}}>
      <Button
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: 30
        }}
        size="large"
        variant="outlined"
        onClick={() => {
            let cross = [];
            let depledge = [];
            for (const [key, value] of Object.entries(statuses)) {
                var li = value === 'cross' ? cross : value === 'depledge' ? depledge : [];
                li.push(key);
              }

            axios
            .post(`${API_URL}/admin/updatePledges`, 
            {
                'cross': cross.toString(),
                'depledge': depledge.toString()
            }
            , {
              headers: { 'content-type': 'application/x-www-form-urlencoded' }
            })
            .then(res => {
                console.log(res.data)
              alert('Successfully Updated');
              window.location.reload(false);
            });
            }}>
        Submit Pledge Data
      </Button>
      </div>
          <Table
            className={classes.table}
            size="small"
            aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Name</TableCell>
                <TableCell align="left">etc</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attending.map((row, i) => (
                <TableRow key={row.user_id} style={ i % 2? { background : "#fdffe0" }:{ background : "white" }}>
                  <TableCell component="th" scope="row">
                    {row.firstname + ' ' + row.lastname}
                  </TableCell>
                  <TableCell align="left">
                  <FormControl component="fieldset">
                    <RadioGroup row name="gender1" value={statuses[row.user_id] || 'none'} 
                    onChange={(e) => {
                        let n = {...statuses};
                        if (e.target.value !== "none") n[row.user_id] = e.target.value;
                        else delete n[row.user_id]
                        setStatuses(n);
                        } }>
                        <FormControlLabel value="cross" control={<Radio />} label="Cross" />
                        <FormControlLabel value="depledge" control={<Radio />} label="Depledge" />
                        <FormControlLabel value="none" control={<Radio />} label="Remain Pledge" />
                    </RadioGroup>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
      </div>
  );
};

export default UpdatePledge;
