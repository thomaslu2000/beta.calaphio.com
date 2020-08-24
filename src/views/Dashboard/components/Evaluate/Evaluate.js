import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Divider
} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import { unsanitize } from '../../../functions';
import axios from 'axios';
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  content: {
    alignItems: 'center',
    display: 'flex'
  },
  title: {
    fontWeight: 700
  },
  space: {
    paddingTop: 5,
    paddingBottom: 5
  }
}));

const Evaluate = props => {
  const { className, ...rest } = props;
  const { history } = props;
  const [data, setData] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    getEvents();
  }, []);

  const getEvents = async () => {
    await axios
      .get(`${API_URL}/people/toEval/`, {
        params: { userId: props.userId }
      })
      .then(response => {
        setData(response.data);
      });
  };

  const goToEvaluate = eid => {
    history.push(`/evaluate/${eid}`);
  };

  return (
    <Card className={clsx(classes.root, className)}>
      <CardContent>
        <Typography
          className={classes.title}
          color="inherit"
          gutterBottom
          variant="h5">
          Evaluate Events
        </Typography>
        {data.length === 0 ? (
          <Typography color="inherit" gutterBottom variant="h6">
            No Events To Evaluate :)
          </Typography>
        ) : (
          data.map(event => {
            return (
              <React.Fragment key={event.event_id}>
                <Divider />
                <Typography
                  color="inherit"
                  variant="h4"
                  className={classes.space}>
                  {unsanitize(event.title)}
                  <IconButton
                    onClick={() => {
                      goToEvaluate(event.event_id);
                    }}>
                    <ExitToAppIcon style={{ color: 'yellow' }} size="large" />
                  </IconButton>
                </Typography>
              </React.Fragment>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

Evaluate.propTypes = {
  className: PropTypes.string
};

export default withRouter(Evaluate);
