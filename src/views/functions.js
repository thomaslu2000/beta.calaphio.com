
import moment from 'moment';

export function unsanitize(str) {
  if (!str) return '';
  return unescape(
    str
      .replace(/%26/g, '&')
      .replace(/%3B/g, ';')
      .replace(/&amp;/g, '&')
      .replace(/&#039;/g, "'")
      .replace(/&rsquo;/g, '’')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&Phi;/g, 'Φ')
      .replace(/&Omega;/g, 'Ω')
  );
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

var CLIENT_ID = "840091936666-fvlmpju2955ch09beafj1fucm2tn8gtv.apps.googleusercontent.com";
var API_KEY = "AIzaSyBsjwigdMsuckox6oxvyXAu4-QRQdtE4Yg";
export function gCalAdd(events) {
  var gapi = window.gapi;
  var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
  var SCOPES = "https://www.googleapis.com/auth/calendar.events";
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    });
    gapi.client.load('calendar', 'v3', ()=>{
      
      gapi.auth2.getAuthInstance().signIn().then(
        () => {
          events.map(event => {
            event.summary = event.title
            if (event.allDay){
              event.start = {date: event.startDate.toISOString().split('T')[0]};
              event.end = {date: event.endDate.toISOString().split('T')[0]};
            } else {
              event.start = {dateTime: event.startDate};
              event.end = {dateTime: event.endDate};
            }
            var request = gapi.client.calendar.events.insert({
              'calendarId': 'primary',
              'resource': event
            })
            request.execute((event) => {
              if (event.htmlLink)
                alert(`Event ${event.summary} created. \nlink:\n${event.htmlLink}`);
            });
          })
        }
      );
    
    });

  
  })
}
