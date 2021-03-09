import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Avatar,
  Typography,
  TextField
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import {unsanitize, clean, avatarSearch} from '../../../functions';
import moment from 'moment';
import axios from 'axios';
import { useGlobal } from 'reactn';

const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(theme => ({
  root: {
      textAlign: 'center'
  }
}));

const Comments = props => {
    const classes = useStyles();
    const { history, eventId } = props;
    const [comments, setComments] = useState([]);
    const [comm, setComm] = useState("");
    const [global] = useGlobal();

    useEffect(() => {
        if (eventId) getComments();
      }, [eventId]);
    
    const getComments= async () => {
    await axios
        .get(`${API_URL}/events/getComments/`, {
        params: {
            eventId
        }
        })
        .then(response => {
        setComments(response.data);
        });
    };
    
    const submitComment = async() => {
        if (comm !== "") {
            let item = {
                    body: clean(comm),
                    userId: global.userId,
                    timestamp: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
                    eventId,
                    API_SECRET
                }
                await axios.post(`${API_URL}/events/postComment/`, item, 
                { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
                .then(response => {
                    if (response.data.length===0)
                setComments([...comments, {firstname:"Me", ...item}]);
                setComm('')
                });
        } 
    }
    const deleteComment = async(id) => {
        await axios.post(`${API_URL}/events/deleteComment/`, {commentId: id, API_SECRET}, 
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
        .then(response => {
            console.log(response.data)
            setComments(comments.filter(c => c.comment_id !== id));
        });
    }

  return <div className={classes.root}>
 <List >
      {comments.map(comment => {return <div key={comment.comment_id}>
        <ListItem alignItems="flex-start">
    <ListItemAvatar>
      <Avatar alt={comment.firstname} src={avatarSearch(comment)} />
    </ListItemAvatar>
    <ListItemText
      primary={unsanitize(comment.body)}
      secondary={
        <React.Fragment>
          
        <IconButton
        onClick={() => {
          history.push(`/account/${comment.user_id}`);
        }}>
          <Typography
        component="span"
        variant="body2"
        className={classes.inline}
        color="textPrimary"
      >{comment.firstname} {comment.lastname} 
      </Typography> </IconButton>
          {'   --'} {moment.utc(comment.timestamp).fromNow()} {comment.comment_id && comment.user_id===global.userId && 
          <IconButton size='small' style={{ color: 'Crimson' }} onClick={()=>deleteComment(comment.comment_id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>}
        </React.Fragment>
      }
    />
    </ListItem>
    <Divider variant="inset" component="li" />
      </div>
      })}
    </List>
    <TextField
    label="Add Comment"
    style={{
        marginRight: 'auto', 
        marginLeft: 'auto',
        marginBottom: 20
    }}
    value={comm}
    onChange={(e) => {
    setComm(e.target.value)
    }}
    InputProps={{endAdornment: <Button onClick={submitComment}>Submit</Button>}}
    />
    
</div>
};

export default withRouter(Comments);
