import React, { useState, useEffect } from 'react';
import {
  Card,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField
} from '@material-ui/core';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { clean, unsanitize } from '../../views/functions';
import SearchIcon from '@material-ui/icons/Search';
import axios from 'axios';

const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const SearchUser = props => {
  const { toAdd, extraData, ...rest } = props;
  const [data, setData] = useState([]);
  const [name, setName] = useState('');
  const [bold, setBold] = useState(false);

  return (
    <Card
      style={{
        marginLeft: 20,
        marginRight: 20,
        marginTop: 20,
        marginBottom: 20
      }}>
      <div style={{ width: '75%', marginLeft: 'auto', marginRight: 'auto' }}>
        <TextField
          fullWidth
          label="Search Name Here"
          style={{ marginTop: 30, marginBottom: 30 }}
          value={name}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          onChange={async e => {
            setName(e.target.value);
            setBold(false);
            if (e.target.value.length > 1)
              await axios
                .get(`${API_URL}/people/search`, {
                  params: {
                    query: e.target.value
                  }
                })
                .then(response => {
                  setData(response.data);
                });
            else await setData([]);
          }}
          variant={bold ? 'filled' : 'outlined'}
        />
      </div>
      <TableContainer style={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={extraData ? '' : '70%'} align="left">
                Name
              </TableCell>
              <TableCell align="left">Pledge Class</TableCell>
              {extraData && (
                <React.Fragment>
                  <TableCell align="left">How to Reach Me</TableCell>
                  <TableCell align="left">Email</TableCell>
                  <TableCell align="left">Dynasty</TableCell>
                </React.Fragment>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((entry, i) => {
              return (
                <TableRow key={'row' + entry.user_id}>
                  <TableCell align="left">
                    <IconButton
                      onClick={() => {
                        setName(`${entry.firstname} ${entry.lastname}`);
                        setBold(true);
                        setData([]);
                        if (toAdd)
                          toAdd({
                            uid: entry.user_id,
                            firstname: entry.firstname,
                            lastname: entry.lastname
                          });
                      }}>
                      <Typography color="primary" gutterBottom variant="h5">
                        {entry.firstname} {entry.lastname}
                      </Typography>
                    </IconButton>
                  </TableCell>
                  <TableCell align="left">
                    <Typography gutterBottom variant="h5">
                      {entry.pledgeclass}
                    </Typography>
                  </TableCell>
                  {extraData && (
                    <React.Fragment>
                      <TableCell align="left">
                        <Typography gutterBottom variant="h5">
                          {unsanitize(entry.phone)}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        <Typography gutterBottom variant="h5">
                          {entry.email}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        <Typography gutterBottom variant="h5">
                          {entry.dynasty}
                        </Typography>
                      </TableCell>
                    </React.Fragment>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default SearchUser;
