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
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import { SearchUser } from '../../../../components';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { unsanitize, clean } from '../../../functions';
import { useGlobal } from 'reactn';
import axios from 'axios';

const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    textAlign: 'center'
  }
}));

const SimpleUserTable = props => {
  const classes = useStyles();
  const { history, get, add, remove } = props;
  const [global] = useGlobal();

  const [data, setData] = useState([]);
  const [newUser, setNewUser] = useState({
    uid: null,
    firstname: '',
    lastname: ''
  });
  const [updated, setUpdated] = useState(1);
  const [adminPermission, setAdminPermission] = useState(false);

  useEffect(() => {
    if (global.userId) getAdmin();
  }, [global]);

  const getAdmin = async () => {
    await axios
      .get(`${API_URL}/people/admin/`, {
        params: { userId: global.userId, token: global.token }
      })
      .then(response => {
        if (response.data[0]) setAdminPermission(true);
      });
  };

  const getPositions = async e => {
    axios
      .get(`${API_URL}/${get}`, {
        params: {
          userId: global.userId,
          token: global.token
        }
      })
      .then(response => {
        setData(response.data);
      });
  };

  const deletePosition = async simpleId => {
    axios
      .post(
        `${API_URL}/${remove}`,
        {
          userId: global.userId,
          token: global.token,
          targetId: simpleId,
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

  const submitPosition = async () => {
    if (!newUser.uid) {
      alert('Please select a user');
      return;
    }
    axios
      .post(
        `${API_URL}/${add}`,
        {
          userId: global.userId,
          token: global.token,
          targetId: newUser.uid,
          API_SECRET
        },
        {
          headers: { 'content-type': 'application/x-www-form-urlencoded' }
        }
      )
      .then(res => {
        alert('Added!');
        setUpdated(updated + 1);
      });
  };

  useEffect(() => {
    getPositions();
  }, [updated]);

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

        <TableContainer style={{ overflowX: 'auto', backgroundColor: 'white' }}>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left">Name</TableCell>
                <TableCell align="left">User ID</TableCell>
                <TableCell align="left">Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((entry, i) => {
                return (
                  <TableRow key={'row' + i}>
                    <TableCell align="left">
                      <IconButton
                        onClick={() => {
                          window.open(
                            `https://beta.calaphio.com/#/account/${entry.user_id}`,
                            '_blank'
                          );
                          // history.push(`/account/${entry.user_id}`);
                        }}>
                        <Typography color="primary" gutterBottom variant="h5">
                          {entry.firstname} {entry.lastname}
                        </Typography>
                      </IconButton>
                    </TableCell>
                    <TableCell align="left">
                      <Typography gutterBottom variant="h5">
                        {entry.user_id}
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      <IconButton
                        onClick={() => {
                          if (
                            window.confirm(
                              `Remove ${unsanitize(
                                entry.firstname
                              )} ${unsanitize(entry.lastname)}?`
                            )
                          ) {
                            deletePosition(entry.user_id);
                          }
                        }}>
                        <Typography color="primary" gutterBottom variant="h5">
                          ❌
                        </Typography>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default withRouter(SimpleUserTable);
