import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Paper,
  Button,
  Typography
} from '@material-ui/core';
import { unsanitize } from '../../../functions';
import moment from 'moment';
import ShowMoreText from 'react-show-more-text';
import axios from 'axios';
const API_URL = process.env.REACT_APP_SERVER;

const useStyles = makeStyles(() => ({
  root: {},
  card: { marginBottom: 20, paddingTop: 20 },
  chartContainer: {
    height: 400,
    position: 'relative'
  },
  actions: {
    justifyContent: 'flex-end'
  },
  name: {
    paddingTop: 10
  }
}));

const Announcements = props => {
  const { className, ...rest } = props;

  const [data, setData] = useState([]);

  useEffect(() => {
    getAnnouncements();
  }, []);

  const getAnnouncements = async () => {
    await axios
      .get(`${API_URL}/general/announcements/`, {
        params: {}
      })
      .then(response => {
        setData(response.data);
      });
  };

  const classes = useStyles();

  return (
    <div {...rest} className={clsx(classes.root, className)}>
      {data.map((item, i) => {
        // console.log(unsanitize(item.text))
        return (
          <Card className={classes.card} key={item.publish_time}>
            <Typography gutterBottom variant="h3" component="h2" align="center">
              {item.title}
            </Typography>
            <Divider />
            <CardContent>
                <Typography
                  gutterBottom
                  variant="h4"
                  component="h4"
                  dangerouslySetInnerHTML={{
                    __html: unsanitize(item.text)
                  }}
                />
              <Typography className={classes.name} color="textSecondary">
                - {item.firstname} {item.lastname} ({item.pledgeclass}),{' '}
                {moment(item.publish_time).fromNow()}
              </Typography>
            </CardContent>
            <Divider />
          </Card>
        );
      })}
    </div>
  );
};

Announcements.propTypes = {
  className: PropTypes.string
};

export default Announcements;

// ...

// class Foo extends Component {

//     executeOnClick(isExpanded) {
//         console.log(isExpanded);
//     }

//     render() {
//         return (
// <ShowMoreText
//     /* Default options */
//     lines={3}
//     more='Show more'
//     less='Show less'
//     anchorClass=''
//     onClick={this.executeOnClick}
//     expanded={false}
//     width={280}
// >
//     Lorem ipsum dolor sit amet, consectetur <a href="https://www.yahoo.com/" target="_blank">yahoo.com</a> adipiscing elit, sed do eiusmod tempor incididunt
//     <a href="https://www.google.bg/" title="Google" rel="nofollow" target="_blank">www.google.bg</a> ut labore et dolore magna amet, consectetur adipiscing elit,
//     sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
//     minim veniam, quis nostrud exercitation ullamco laboris nisi
//     ut aliquip ex Lorem ipsum dolor sit amet, consectetur
//     adipiscing elit, sed do eiusmod tempor incididunt ut labore

//     et dolore magna aliqua. Ut enim ad minim veniam, quis
//     nostrud exercitation ullamco laboris nisi ut aliquip ex
//     Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
//     do eiusmod tempor incididunt ut labore et dolore magna
//     aliqua. Ut enim ad minim veniam, quis nostrud exercitation
// </ShowMoreText>
//         );
//     }
// }
