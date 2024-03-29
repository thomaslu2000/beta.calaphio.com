import moment from 'moment';
import sanitizeHtml from 'sanitize-html';
import { decode } from 'html-entities';
import DOMPurify from 'dompurify';

const CLIENT_ID = process.env.REACT_APP_G_CLIENT_ID;
const API_KEY = process.env.REACT_APP_G_API_KEY;

const face_folder = process.env.REACT_APP_FACES;

const extensions = ['jpg', 'png', 'jpeg'];

export function imageExists(image_url) {
  var http = new XMLHttpRequest();

  http.open('HEAD', image_url, false);
  http.send();

  return http.status !== 404;
}

export function clean(str) {
  return escape(sanitizeHtml(str));
}

export function avatarSearch(userdata) {
  var pic_path =
    'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg';
  if (userdata) {
    if (userdata.profile_pic) {
      if (imageExists(userdata.profile_pic)) return userdata.profile_pic;
      return pic_path;
    }

    let id = userdata.user_id;
    if (id)
      for (let i = 0; i < 3; i++) {
        let r = `${face_folder}${id}.${extensions[i]}`;
        if (imageExists(r)) {
          pic_path = r;
          break;
        }
      }
  }
  return pic_path;
}

export function unsanitize(str) {
  if (!str || typeof str !== 'string') return '';
  str = DOMPurify.sanitize(str);
  return unescape(decode(str.replace(/%26/g, '&').replace(/%3B/g, ';')));
}

export function dayToObj(item) {
  item.startDate = moment
    .utc(item.start_at.replace(' ', 'T'))
    .local()
    .toDate();
  item.endDate = moment
    .utc(item.end_at.replace(' ', 'T'))
    .local()
    .toDate();
  if (item.endDate < item.startDate) {
    item.endDate = moment(item.startDate)
      .add(2, 'hours')
      .toDate();
  }
  if (item.time_allday == 1) {
    item.allDay = true;
  }
  item.title = unsanitize(item.title);
  item.location = unsanitize(item.location || '');
  item.description = unsanitize(item.description || '');
  item.notes = item.description;
  item.id = item.event_id;
  item.typeId =
    item.type_service_chapter === '1'
      ? 1
      : item.type_service_campus === '1'
      ? 2
      : item.type_service_community === '1'
      ? 3
      : item.type_service_country === '1'
      ? 4
      : item.type_fellowship === '1'
      ? 5
      : 6;
  return item;
}

export function gCalAdd(events) {
  var gapi = window.gapi;
  var DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
  ];
  var SCOPES = 'https://www.googleapis.com/auth/calendar.events';
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    });
    gapi.client.load('calendar', 'v3', () => {
      gapi.auth2
        .getAuthInstance()
        .signIn()
        .then(() => {
          events.map(event => {
            event.summary = event.title;
            if (event.allDay) {
              event.start = {
                date: event.startDate.toISOString().split('T')[0]
              };
              event.end = { date: event.end_at.substring(0, 10) };
            } else {
              event.start = { dateTime: event.startDate };
              event.end = { dateTime: event.endDate };
            }
            var request = gapi.client.calendar.events.insert({
              calendarId: 'primary',
              resource: event
            });
            request.execute(event => {
              if (event.htmlLink)
                alert(
                  `Event ${event.summary} created. \nlink:\n${event.htmlLink}`
                );
            });
          });
        });
    });
  });
}
