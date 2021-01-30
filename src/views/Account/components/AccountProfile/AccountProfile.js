import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardActions,
  CardContent,
  Avatar,
  Grid,
  Typography,
  Divider,
  Button,
  TextareaAutosize,
  TextField
} from '@material-ui/core';
import {unsanitize, clean, avatarSearch} from '../../../functions'
import axios from 'axios';
const API_SECRET = process.env.REACT_APP_SECRET;const API_URL = process.env.REACT_APP_SERVER;

const face_folder = process.env.REACT_APP_FACES;

const AccountProfile = props => {
  const { className, userdata, viewerid, ...rest } = props;
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');

  useEffect(() => {
    setDescription(userdata.description || 'No Description Provided')
  }, [userdata])

  const classes = useStyles();

  const editDescription = async () => {
    await axios
        .post(
          `${API_URL}/people/updateDescription/`,
          {
            userId: viewerid,
            description: clean(description),
            API_SECRET
          },
          { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
        )
        .then(response => {
          alert('description updated!')
        });
  }

  const doPasswordUpdate = async() => {
    await axios.get(`${API_URL}/people/loginId/`, 
    {params: {userId: viewerid, oldPass}}).then(res => {
      if (res.data.length > 0) changePassword()
      else alert('Password Incorrect!')
    })
  }
  const changePassword = async () => {
    await axios
        .post(
          `${API_URL}/people/changePassVerify/`,
          {
            userId: viewerid,
            newPass, oldPass,
            API_SECRET
          },
          { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
        )
        .then(response => {alert('Password Updated!');
        });
  }

  const upload = async (e) => {
    // console.log(e.target.files[0])
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('pathTo', face_folder);
    formData.append('userId', viewerid);
    formData.append('API_SECRET', API_SECRET);
    axios.post(`${API_URL}/people/uploadPFP/`, 
    formData,
    {
      headers: {
          'content-type': 'multipart/form-data'
      }
  }).then(res => {
    // console.log(res.data);
    if (res.data.length > 0) {
      alert('Image Upload Failed');
    } else {
      alert('Upload Succeeded!');
      window.location.reload(false); 
    }
  })
  alert('Please Wait While the File is Processed!');
  }

  let mine = viewerid===userdata.user_id;

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardContent>
        <div className={classes.details}>
          <div>
            <Typography gutterBottom variant="h2">
              {userdata.firstname || ''} {userdata.lastname || ''}
            </Typography>
            <Typography
              className={classes.locationText}
              color="textSecondary"
              variant="body1">
              {userdata.dynasty || ''} Dynasty
            </Typography>
            <Typography
              className={classes.locationText}
              color="textSecondary"
              variant="body1">
              {userdata.pledgeclass || ''} Pledge Class
            </Typography>
            {mine && 
            <div>
            <div>
            <TextField
              label="Old Password"
              value={oldPass}
              onChange={(e) => {setOldPass(e.target.value)}}
              size='small'
              type="password"
              style={{marginLeft: 5}}
            />
            <TextField
              label="New Password"
              value={newPass}
              onChange={(e) => {setNewPass(e.target.value)}}
              size='small'
              type='password'
              style={{marginLeft: 5}}
            /></div>
            <div style={{textAlign: 'center'}}><Button onClick={doPasswordUpdate}>Change Password</Button></div>
            </div>}
          </div>
          <Grid  className={classes.avatarContainer} >
          <Grid item><Avatar className={classes.avatar} src={avatarSearch(userdata)} /></Grid>
          {mine && 
          <Grid item className={classes.uploadButton}>
            <Button size='small' component="label">
             Upload Pic
             <input
              accept="image/png, image/jpeg, image/jpg"
              type="file"
              onChange={upload}
              hidden
            /> </Button></Grid>}
          </Grid>
        </div>
      </CardContent>
      <Divider />
				<CardContent style={{ textAlign: "center" }}>
          {editing ? 
          <TextareaAutosize  style={{ width: '80%'}} rowsMin={3} value={unsanitize(description)} onChange={e => {setDescription(e.target.value)}} /> :
					<Typography
						dangerouslySetInnerHTML={{
							__html: unsanitize(description)
						}}
					/>}
          <div />
          {mine && 
          <Button className={classes.uploadButton} size='small'
          onClick={() => {
            if (editing){
              editDescription();
              setEditing(false);
            } else {
              setEditing(true);
            }
          }}> 
          {editing ? 'Upload Description' : 'Edit Description'} </Button>}
				</CardContent>
    </Card>
  );
};

const useStyles = makeStyles(theme => ({
  root: {},
  details: {
    display: 'flex'
  },
  avatar: {
    height: 130,
    width: 130,
    flexShrink: 0,
    flexGrow: 0
  },
  avatarContainer: {
    marginLeft: 'auto'
  },
  progress: {
    marginTop: theme.spacing(2)
  },
  uploadButton: {
    textAlign: 'center',
    marginTop: theme.spacing(1),
    marginRight: 'auto',
    marginLeft: 'auto'
  }
}));
export default AccountProfile;
