import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  TextField
} from '@material-ui/core';
import { SearchUser } from '../../components';
import { positionTypes } from './PosTypes';
import { default as WikiComponent } from './WikiTableComponent';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { unsanitize, clean } from '../functions';
import { useGlobal } from 'reactn';
import axios from 'axios';

const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4),
    textAlign: 'center'
  }
}));

const Wiki = props => {
  const classes = useStyles();
  const { history } = props;
  const [global] = useGlobal();

  const [data, setData] = useState([]);
  const [sem, setSem] = useState(0);
  const [year, setYear] = useState(2022);
  const [posName, setPosName] = useState('');
  const [posParent, setPosParent] = useState('');
  const [newUser, setNewUser] = useState({
    uid: null,
    firstname: '',
    lastname: ''
  });
  const [posType, setPosType] = useState(positionTypes[4]);
  const [posIdx, setPosIdx] = useState(4);
  const [updated, setUpdated] = useState(1);
  const [adminPermission, setAdminPermission] = useState(false);

  useEffect(() => {
    if (global.userId) getAdmin();
  }, [global]);

  const getAdmin = async () => {
    await axios
      .get(`${API_URL}/people/wiki/`, {
        params: { userId: global.userId, token: global.token }
      })
      .then(response => {
        if (response.data[0]) setAdminPermission(true);
      });
  };

  const getPositions = async e => {
    axios
      .get(`${API_URL}/wiki/positions`, {
        params: { year, sem, posType: posType.id }
      })
      .then(response => {
        setData(response.data);
      });
  };

  const submitPosition = async () => {
    var myPosName = posType.setTitle ? posType.title : posName;
    var myPosParent = posType.setParent ? posType.parent : posParent;
    if (!newUser.uid) {
      alert('Please select a user');
      return;
    }
    if (!myPosName) {
      alert('Please enter a valid position name');
      return;
    }
    axios
      .post(
        `${API_URL}/wiki/addPosition`,
        {
          userId: global.userId,
          token: global.token,
          targetId: newUser.uid,
          title: clean(myPosName),
          parent: clean(myPosParent),
          sem,
          year,
          posType: posType.id,
          API_SECRET
        },
        {
          headers: { 'content-type': 'application/x-www-form-urlencoded' }
        }
      )
      .then(res => {
        setUpdated(updated + 1);
      });
  };

  useEffect(() => {
    getPositions();
  }, [updated, sem, year, posType]);

  useEffect(() => {
    setPosType(positionTypes[posIdx]);
  }, [posIdx]);

  useEffect(() => {
    setPosName(posType.setTitle ? posType.title : '');
    setPosParent(posType.setParent ? posType.parent : '');
  }, [posType]);

  if (!global.userId || !adminPermission) {
    return (
      <div className={classes.root}>
        <Paper className={classes.root} />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.root}>
        <Typography
          variant="h1"
          style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          Add / Edit Positions Here
        </Typography>

        <form style={{ paddingTop: 30, paddingBottom: 30 }}>
          <div align="center" style={{ alignItems: 'center' }}>
            <TextField
              label={!posType.setTitle && (posType.title || 'Position Name')}
              value={posName}
              style={{ marginRight: 5 }}
              placeholder={posType.titlePlaceholder}
              disabled={posType.setTitle}
              variant="outlined"
              onChange={e => {
                setPosName(e.target.value);
              }}
            />
            <TextField
              label={
                !posType.setParent && (posType.parent || 'Position Parent')
              }
              value={posParent}
              style={{ marginRight: 5 }}
              placeholder={posType.parentPlaceholder}
              disabled={posType.setParent}
              variant="outlined"
              onChange={e => {
                setPosParent(e.target.value);
              }}
            />
            <TextField
              label={'Year'}
              value={year}
              style={{ marginRight: 5, width: 75 }}
              type="number"
              variant="outlined"
              onChange={e => {
                setYear(e.target.value);
              }}
            />
            <FormControl variant="outlined" style={{ marginRight: 5 }}>
              <InputLabel id="position-type-select">Position Type</InputLabel>
              <Select
                labelId="position-type-select"
                id="position-type-select"
                value={posIdx}
                label="Position Type"
                onChange={e => {
                  setPosIdx(e.target.value);
                }}>
                {positionTypes.map((item, i) => {
                  return (
                    <MenuItem key={'select-postype' + i} value={i}>
                      {item.type}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl variant="outlined" style={{ marginRight: 5 }}>
              <InputLabel id="sem-select-label">Semester</InputLabel>
              <Select
                labelId="sem-select-label"
                id="sem-select"
                value={sem}
                label="Semester"
                onChange={e => setSem(e.target.value)}>
                <MenuItem value={0}>Spring</MenuItem>
                <MenuItem value={1}>Fall</MenuItem>
              </Select>
            </FormControl>
            <Button
              style={{ marginTop: 5, marginLeft: 5 }}
              onClick={() => {
                submitPosition();
              }}
              size="large"
              variant="outlined">
              Submit
            </Button>
          </div>
          <SearchUser toAdd={setNewUser} />
        </form>

        <WikiComponent
          posIdx={posIdx}
          year={year}
          sem={sem}
          updated={updated}
          showDelete
        />
      </Paper>
    </div>
  );
};

export default withRouter(Wiki);
