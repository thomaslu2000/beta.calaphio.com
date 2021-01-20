import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import axios from 'axios';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Divider,
  IconButton,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField
} from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import UpdatePledge from './UpdatePledge';
import AddPledges from './AddPledges';
import EditAnnouncements from './EditAnnouncements';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { unsanitize } from '../../../functions';

const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles((theme) => ({
  padded: {
    padding: theme.spacing(4)
  }
}));

const AdminPanel = props => {
  const { userId, history, ...rest } = props;
  const [window, setWindow] = useState(0);
  const [values, setValues] = useState({});
  const [display, setDisplay] = useState();
  const classes = useStyles();

  useEffect(() => {
    if (Object.keys(adminFuncs[window].forms).length === 0) {
      handleLoad();
    }
  }, [window])

  const adminFuncs = [
    {
    title: 'Add / Edit Announcements',
    forms: {},
    type: 'none',
    callback: response => {
      setDisplay(<EditAnnouncements />);
    }
  },
  {
    title: 'Check if Admin',
    forms: {
      userId: 'User Id (number)'
    },
    url: '/people/admin/',
    type: 'GET',
    callback: response => {
      if (response.data[0]) alert('This is an Admin!'); //alert(JSON.stringify(response)); 
      else alert('Not an admin');
    }
  },
  {
    title: 'Change Password',
    forms: {
      userId: 'User Id (number)', pass: 'New Password'
    },
    url: '/people/changePass/',
    type: 'POST',
    callback: response => {
      alert('Complete! Double Check With User.');
    }
  },
  {
    title: 'View Individual Stats',
    forms: {userId: 'User Id (number)', startDate: 'Start Date (YYYY-MM-DD)', endDate: 'End Date (YYYY-MM-DD)'},
    url: '/people/stats/',
    type: 'GET',
    callback: response => {
      tablefy(response.data)
    }
  },
  {
    title: 'View Pledge Stats',
    forms: {},
    url: '/admin/pledge_stats/',
    type: 'GET',
    callback: response => {
      tablefy(response.data)
    }
  },
  {
    title: 'Search Users',
    forms: {query: 'Name (First Last)'},
    url: '/people/search/',
    type: 'GET',
    callback: response => {
      tablefy(response.data)
    }
  },
  {
    title: 'View Unevaluated Events',
    forms: {startDate: 'Start of search (YYYY-MM-DD)', endDate: 'End of search (YYYY-MM-DD)'},
    url: '/admin/unevaluated/',
    type: 'GET',
    callback: response => {
      tablefy(response.data, [['Evaluate Link', o => {
        return <IconButton
        onClick={() => {
          history.push(`/evaluate/${o.event_id}`);
        }}>
        <ExitToAppIcon style={{ color: 'blue' }} size="large" />
      </IconButton>
      }]])
    }
  },
  {
    title: 'Update Pledge Status',
    forms: {},
    url: '/admin/getPledges/',
    type: 'GET',
    callback: response => {
      setDisplay(<UpdatePledge data={response.data} />);
    }
  },
  {
    title: 'Add Pledges (xlsx)',
    forms: {},
    type: 'none',
    callback: response => {
      setDisplay(<AddPledges/>);
    }
  },
  {
    title: 'View Admins',
    forms: {},
    url: '/admin/get/',
    type: 'GET',
    callback: response => {
      tablefy(response.data);
    }
  },
  {
    title: 'Remove Admins',
    forms: {userId: 'User Id (number)'},
    url: '/admin/remove/',
    type: 'POST',
    callback: response => {
      alert("Action Performed")
    }
  },
  {
    title: 'Add Admins',
    forms: {userId: 'User Id (number)'},
    url: '/admin/add/',
    type: 'POST',
    callback: response => {
      alert("Action Performed")
    }
  }
];
  const handleLoad = async () => {
    if (adminFuncs[window].type==='GET'){
    await axios.get(`${API_URL}/${adminFuncs[window].url}`, {
      params: {...values, API_SECRET}
    })
    .then(adminFuncs[window].callback)
    } else if (adminFuncs[window].type==='POST') {
      await axios.post(`${API_URL}/${adminFuncs[window].url}`, {...values, API_SECRET}, {
        headers: { 'content-type': 'application/x-www-form-urlencoded' }})
      .then(adminFuncs[window].callback)
    } else if (adminFuncs[window].type==='none') {
      adminFuncs[window].callback();
    }
  }

  const tablefy = (data, extra=[]) => {
    // this function literally just turns the list of objects into a table
    // extra is of the form: [ [cell_name1, cell_code1(entry)], [cell_name2, cell_code2(entry)]...]
    if (data.length === 0) return setDisplay("No Data Found");
    let keys = Object.keys(data[0]);
    let extra_titles = extra.map(([title, func]) => {return title});
    let codes = extra.map(([title, func]) => {return func})
    return setDisplay(
      <TableContainer style={{overflowX:'auto'}}>
      <Table
              className={classes.table}
              size="small">
              <TableHead>
                <TableRow>
                  {keys.map(k => {
                    return (<TableCell align="left" key={k}>{unsanitize(k)}</TableCell>)
                  })}
                  {extra_titles.map(k => {
                    return (<TableCell align="left" key={k}>{unsanitize(k)}</TableCell>)
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((entry, i) => {
                  return (
                  <TableRow key={'row'+i}>

                    {keys.map(k => {
                    return <TableCell align="left" key={k+i}>
                      {unsanitize(entry[k])}
                    </TableCell>
                  })}

                  {codes.map((f, j) => {
                    return <TableCell align="left" key={'extra '+extra_titles[j]}>
                      {f(entry)}
                    </TableCell>
                  })}

                  </TableRow>)
                })}
              </TableBody>
            </Table></TableContainer>
    )


  }

  return (
    <div>
    <Card>
      <CardHeader
        title={"Admin Panel"}
      />
      <Divider />
      <CardContent>
      <Typography
        color="textSecondary"
        gutterBottom>
        Note: Authorized use only! Errors and security bugs WILL NOT be caught!
      </Typography>
      <div align='center'>
        <Select
          value={window}
          onChange={e => {setDisplay(); setWindow(e.target.value)}}
        >
          {adminFuncs.map((o, i) => {
            return (<MenuItem value={i} key={'dropdown '+o.title}>{o.title}</MenuItem>)
          })}
        </Select></div>
          <div>
            <Typography variant="h1"  className={classes.padded}>
              {adminFuncs[window].title} 
            {Object.keys(adminFuncs[window].forms).length > 0 && 
            <Button
            style={{marginLeft: 30}}
            size="large"
            variant="outlined"
            
            onClick={handleLoad}>
            Run
          </Button>}
            </Typography>
          </div>
          {Object.entries(adminFuncs[window].forms).map(([param, title], idx) => {
            return (<TextField
              id={param}
              key={param}
              label={title}
              style={{marginRight:10}}
              value={values[param] || ''}
              onChange={(e) => {
                let c = {
                  ...values
                }
                c[param] = e.target.value
                setValues(c)
              }}
              variant="outlined"
            />)
       })}

       </CardContent>
       <CardContent className={classes.padded}>{display}</CardContent>
    </Card></div>
  );
};

export default withRouter(AdminPanel);
