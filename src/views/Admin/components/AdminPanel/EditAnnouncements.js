import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  Typography,
  TextField
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import RichTextEditor from 'react-rte';
import { useGlobal } from 'reactn';
import { unsanitize, clean } from '../../../functions';

const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(theme => ({
  padded: {
    padding: theme.spacing(4)
  }
}));

const EditAnnouncements = props => {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [curr, setCurr] = useState(-1);
  const [text, setText] = useState(RichTextEditor.createEmptyValue());
  const [title, setTitle] = useState('');
  const [global] = useGlobal();

  useEffect(() => {
    getAnnouncements();
  }, []);

  useEffect(() => {
    if (curr === -1) {
      setText(RichTextEditor.createEmptyValue());
      setTitle('');
    } else {
      setText(
        RichTextEditor.createValueFromString(
          unsanitize(data[curr].text),
          'html'
        )
      );
      setTitle(data[curr].title);
    }
  }, [curr]);

  const getAnnouncements = async () => {
    await axios
      .get(`${API_URL}/general/announcements/`, {
        params: {}
      })
      .then(response => {
        setData(response.data);
      });
  };

  const postAnnouncement = async () => {
    if (curr === -1) {
      await axios
        .post(
          `${API_URL}/admin/addAnnouncement`,
          {
            userId: global.userId,
            text: text.toString('html'),
            title: title,
            API_SECRET
          },
          {
            headers: { 'content-type': 'application/x-www-form-urlencoded' }
          }
        )
        .then(res => {
          alert('Announcement Published!');
          window.location.reload();
        });
    } else {
      await axios
        .post(
          `${API_URL}/admin/updateAnnouncement`,
          {
            id: data[curr].id,
            text: text.toString('html'),
            title: title,
            API_SECRET
          },
          {
            headers: { 'content-type': 'application/x-www-form-urlencoded' }
          }
        )
        .then(res => {
          alert('Announcement Updated!');
          window.location.reload();
        });
    }
  };

  const deleteAnnouncement = async () => {
    await axios
      .post(
        `${API_URL}/admin/deleteAnnouncement`,
        { id: data[curr].id, API_SECRET },
        {
          headers: { 'content-type': 'application/x-www-form-urlencoded' }
        }
      )
      .then(res => {
        alert('Announcement Deleted!');
        window.location.reload();
      });
  };

  return (
    <div>
      <div align="center">
        <Select
          value={curr}
          onChange={e => {
            setCurr(e.target.value);
          }}>
          <MenuItem value={-1} key={'addNew'}>
            Add New Announcement
          </MenuItem>
          {data.map((o, i) => {
            return (
              <MenuItem value={i} key={'dropdown ' + o.title}>
                {o.title}
              </MenuItem>
            );
          })}
        </Select>
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
        <div style={{ width: '50%' }}>
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            startIcon={<SaveIcon />}
            style={{ float: 'left' }}
            onClick={postAnnouncement}>
            Save
          </Button>
          {curr !== -1 && (
            <Button
              variant="contained"
              className={classes.button}
              startIcon={<DeleteIcon />}
              style={{ float: 'right', color: 'white', backgroundColor: 'red' }}
              onClick={deleteAnnouncement}>
              Delete
            </Button>
          )}
        </div>
        <TextField
          label="Title"
          value={title}
          style={{ marginBottom: 10, width: '75%' }}
          onChange={e => {
            setTitle(e.target.value);
          }}
        />
        <RichTextEditor value={text} onChange={v => setText(v)} />
      </div>
    </div>
  );
};

export default EditAnnouncements;
