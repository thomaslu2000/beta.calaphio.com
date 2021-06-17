import React, { useState, useEffect } from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useGlobal } from 'reactn';
import axios from 'axios';
import moment from 'moment';
const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const ChangeSemester = props => {
  const classes = useStyles();
  const [global] = useGlobal();
  const [sems, setSems] = useState([]);
  const [newData, setNewData] = useState({});
  const [modifiedSem, setModifiedSem] = useState(-1);
  const { history } = props;

  useEffect(() => {
    getSems();
  }, []);

  useEffect(() => {
    let ind = sems.findIndex(x => x.id === modifiedSem);
    if (ind === -1) {
      setNewData({});
    } else {
      setNewData({
        ...sems[ind],
        start: sems[ind]['start'].slice(0, 10),
        end: sems[ind]['end'].slice(0, 10)
      });
    }
  }, [modifiedSem]);

  const getSems = async () => {
    await axios
      .get(`${API_URL}/general/allSems/`, {
        params: {}
      })
      .then(response => {
        setSems(response.data);
      });
  };

  const makeOnChange = param => {
    return e => {
      let c = {
        ...newData
      };
      c[param] = e.target.value;
      setNewData(c);
    };
  };

  const submitSem = async () => {
    await axios
      .get(`${API_URL}/people/admin`, {
        params: { userId: global.userId || -1 }
      })
      .then(response => {
        if (response.data.length > 0) {
          var newId = false;
          if (!newData.id || newData.id === -1) {
            newData.id =
              1 +
              Math.max.apply(
                Math,
                sems.map(r => r.id)
              );
            newId = true;
          }
          axios
            .post(
              `${API_URL}/general/updateSem`,
              { ...newData, API_SECRET },
              {
                headers: { 'content-type': 'application/x-www-form-urlencoded' }
              }
            )
            .then(res => {
              if (res.data.length === 0) {
                if (newId) {
                  setSems([newData, ...sems]);
                } else {
                  for (var i = 0; i < sems.length; i++)
                    if (sems[i].id === newData.id) sems[i] = newData;
                  setSems([...sems]);
                }
                alert('Successfully Updated');
              } else {
                alert('Error With Submission');
              }
            });
        } else {
          alert(
            'You are unauthorized to evaluate this event. This action has been logged.'
          );
        }
      });
  };

  return (
    <Paper className={classes.root}>
      <div align="center" style={{ alignItems: 'center', marginBottom: 5 }}>
        Note: the date format MUST be correct
      </div>
      <form>
        <div align="center" style={{ alignItems: 'center', marginBottom: 5 }}>
          <Select
            size="large"
            defaultValue={-1}
            onChange={event => {
              setModifiedSem(event.target.value);
            }}>
            <MenuItem value={-1}>New Semester</MenuItem>
            {sems.map(row => {
              return (
                <MenuItem key={row.id} value={row.id}>
                  {row.semester}: {row.namesake_short}
                </MenuItem>
              );
            })}
          </Select>{' '}
        </div>
        <div align="center" style={{ alignItems: 'center' }}>
          <TextField
            label={'Semester'}
            value={newData['semester'] || ''}
            style={{ marginRight: 5 }}
            variant="outlined"
            onChange={makeOnChange('semester')}
          />
          <TextField
            label={'Start Date (yyyy-mm-dd)'}
            value={newData['start'] || ''}
            style={{ marginRight: 5 }}
            variant="outlined"
            onChange={makeOnChange('start')}
          />
          <TextField
            label={'End Date (yyyy-mm-dd)'}
            value={newData['end'] || ''}
            style={{ marginRight: 5 }}
            variant="outlined"
            onChange={makeOnChange('end')}
          />
          <br />
          <TextField
            label={'Namesake'}
            value={newData['namesake'] || ''}
            style={{ marginRight: 5 }}
            variant="outlined"
            onChange={makeOnChange('namesake')}
          />
          <TextField
            label={'Namesake Abbreviation'}
            value={newData['namesake_short'] || ''}
            style={{ marginRight: 5 }}
            variant="outlined"
            onChange={makeOnChange('namesake_short')}
          />
        </div>
        <div align="center" style={{ alignItems: 'center' }}>
          <Button
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: 30
            }}
            onClick={submitSem}
            size="large"
            variant="outlined">
            Submit
          </Button>
        </div>
      </form>
      <Card>
        <CardContent>
          <Table className={classes.table} size="small" aria-label="table">
            <TableHead>
              <TableRow>
                <TableCell align="left" width="20%">
                  Semester
                </TableCell>
                <TableCell align="left" width="15%">
                  Start
                </TableCell>
                <TableCell align="left" width="15%">
                  End
                </TableCell>
                <TableCell align="left" width="35%">
                  Namesake
                </TableCell>
                <TableCell align="left" width="10%">
                  Namesake Abbreviation
                </TableCell>
                <TableCell align="Right" width="5%">
                  Delete
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sems.map(row => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    {row.semester}
                  </TableCell>
                  <TableCell align="left">{row.start.slice(0, 10)}</TableCell>
                  <TableCell align="left">{row.end.slice(0, 10)}</TableCell>
                  <TableCell align="left">{row.namesake}</TableCell>
                  <TableCell align="left">{row.namesake_short}</TableCell>
                  <TableCell align="right">
                    <Button
                      onClick={async () => {
                        if (
                          window.confirm(
                            `Delete ${row.semester}, ${row.namesake}?`
                          )
                        ) {
                          await axios
                            .post(
                              `${API_URL}/general/deleteSem/`,
                              { id: row.id, API_SECRET },
                              {
                                headers: {
                                  'content-type':
                                    'application/x-www-form-urlencoded'
                                }
                              }
                            )
                            .then(response => {
                              setSems(sems.filter(x => x.id !== row.id));
                            });
                        }
                      }}>
                      ❌
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Paper>
  );
};

const useStyles = makeStyles({
  root: {
    marginTop: 10,
    marginRight: 30,
    marginLeft: 30
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginTop: 12
  }
});

export default withRouter(ChangeSemester);
