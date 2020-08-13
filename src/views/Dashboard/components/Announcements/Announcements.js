import React from 'react';
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

  const data = [
    {
      firstname: 'Bill',
      lastname: 'Wells',
      title: 'annoucement1',
      text:
        'Here is some text that might have <b> html </b> and &amp; special characters, use the unsanitize function imported above',
      publish_time: '2020-05-06 12:00:00'
    },
    {
      firstname: 'Jon',
      lastname: 'Tosd',
      title: 'annoucement1',
      text: 'Also try to use moment.js, imported above',
      publish_time: '2020-05-06 12:00:00'
    }
  ];

  const classes = useStyles();

  return (
    <div {...rest} className={clsx(classes.root, className)}>
      {data.map((item, i) => {
        return (
          <Card className={classes.card} key={item.publish_time}>
            <Typography gutterBottom variant="h3" component="h2" align="center">
              {item.title}
            </Typography>
            <Divider />
            <CardContent>
              <ShowMoreText
                lines={3}
                more="Show more"
                less="Show less"
                anchorClass=""
                onClick={() => {
                  console.log('clicky');
                }}
                expanded={false}>
                {item.text}
              </ShowMoreText>
              <Typography className={classes.name} color="textSecondary">
                - {item.firstname} {item.lastname}
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
