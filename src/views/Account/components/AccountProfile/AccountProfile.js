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
  TextareaAutosize
} from '@material-ui/core';
import {unsanitize, clean, imageExists} from '../../../functions'
import axios from 'axios';
const API_URL = process.env.REACT_APP_SERVER;

const face_folder = process.env.REACT_APP_FACES;
const extensions = ['jpg', 'png', 'jpeg']

const avatarSearch = userdata => {
  var pic_path = 'https://icon-library.net/images/default-profile-icon/default-profile-icon-17.jpg' 
  if (userdata) {
    if (userdata.profile_pic) {
      return userdata.profile_pic;
    }
    let id = userdata.user_id;
    if (id)
      for (let i = 0; i< 3; i++){
        let r = `${face_folder}${id}.${extensions[i]}`
        if (imageExists(r)){ pic_path = r; break; }
      }
  }
  return pic_path;
}

const AccountProfile = props => {
  const { className, userdata, viewerid, ...rest } = props;
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState('')

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
            description: clean(description)
          },
          { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
        )
        .then(response => {
          alert('description updated!')
        });
  }

  const upload = async (e) => {
    // console.log(e.target.files[0])
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('pathTo', face_folder);
    formData.append('userId', viewerid);
    axios.post(`${API_URL}/people/uploadPFP/`, 
    formData,
    {
      headers: {
          'content-type': 'multipart/form-data'
      }
  }).then(res => {
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
