import axios from 'axios';
import moment from 'moment';
import sanitizeHtml from 'sanitize-html';
const API_SECRET = process.env.REACT_APP_SECRET;
const API_URL = process.env.REACT_APP_SERVER;

export function makeTypes() {
  return [
    {
      text: 'Service to Chapter',
      id: 1,
      color: '#FF0053',
      type: 'type_service_chapter'
    },
    {
      text: 'Service to Campus',
      id: 2,
      color: '#de1616',
      type: 'type_service_campus'
    },
    {
      text: 'Service to Community',
      id: 3,
      color: '#de4116',
      type: 'type_service_community'
    },
    {
      text: 'Service to Country',
      id: 4,
      color: '#ff8052',
      type: 'type_service_country'
    },
    {
      text: 'Fellowship',
      id: 5,
      color: '#16c441',
      type: 'type_fellowship'
    },
    {
      text: 'Other',
      id: 6,
      color: '#7E57C2',
      type: 'none'
    }
  ];
}

const makeParams = (data, uid) => {
  var params;
  if (data.typeId) {
    let type = data.typeId && typesa.find(x => x.id === data.typeId).type;
    params = {
      creator_id: uid,
      type_service_campus: 0,
      type_service_chapter: 0,
      type_service_community: 0,
      type_service_country: 0,
      type_fellowship: 0
    };
    params[type] = 1;
  } else {
    params = {
      creator_id: uid
    };
  }
  params.API_SECRET = API_SECRET;
  if (data.title) params.title = escape(sanitizeHtml(data.title));
  if (data.location) params.location = escape(sanitizeHtml(data.location));
  if (data.notes) params.description = escape(sanitizeHtml(data.notes));
  if (data.allDay) params.time_allday = data.allDay ? 1 : 0;
  if (data.interchapter) params.type_interchapter = data.interchapter ? 1 : 0;
  if (data.fundraiser) params.type_fundraiser = data.fundraiser ? 1 : 0;
  if (data.startDate) {
    let s = moment.utc(data.startDate).format('YYYY-MM-DD HH:mm:ss');
    params.date = s.slice(0, 10);
    params.time_start = s.slice(11, 19);
    params.start_at = s.slice(0, 19);
  }
  if (data.endDate) {
    let s = moment.utc(data.endDate).format('YYYY-MM-DD HH:mm:ss');
    params.time_end = s.slice(11, 19);
    params.end_at = s.slice(0, 19);
  }
  return params;
};

const typesa = makeTypes();
export function makeCommitChanges(f, uid) {
  async function commitChanges({ added, changed, deleted }) {
    if (added) {
      if (added.startDate > added.endDate) {
        alert('Error: Start Date is After the End Date');
        return;
      }
      if (added.rRule) alert('Recurring Events Not Yet Implemented');
      let params = makeParams(added, uid);
      if (!params.title) params.title = 'Untitled Event';
      if (!params.location) params.location = 'No Location Given';
      if (!params.description) params.description = '';
      if (!params.time_allday) params.time_allday = 0;
      await axios
        .post(`${API_URL}/events/create`, params, {
          headers: { 'content-type': 'application/x-www-form-urlencoded' }
        })
        .then(res => {
          f({ added, changed, deleted });
        });
    } else if (changed) {
      for (const [eventId, data] of Object.entries(changed)) {
        let params = makeParams(data, uid);
        if (data.startDate && data.endDate && data.startDate > data.endDate) {
          alert('Error: Start Date is After the End Date');
          return;
        }
        params.eventId = eventId;
        await axios
          .get(`${API_URL}/people/adminOrChair`, {
            params: { userId: uid, eventId: eventId}
          })
          .then(response => {
            if (response.data.length > 0) {
              axios
                .post(`${API_URL}/events/edit`, params, {
                  headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                  }
                })
                .then(res => {
                  f({ added, changed, deleted });
                });
            } else {
              alert('Only Admins and Chairs May Edit Events');
            }
          });
      }
    } else if (deleted) {
      await axios
        .get(`${API_URL}/people/adminOrChair`, {
          params: { userId: uid, eventId: deleted }
        })
        .then(response => {
          if (response.data.length > 0) {
            axios
              .post(
                `${API_URL}/events/delete`,
                {
                  eventId: deleted,
                  userId: uid,
                  API_SECRET
                },
                {
                  headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                  }
                }
              )
              .then(res => {
                f({ added, changed, deleted });
              });
          } else {
            alert('Only Admins and Chairs May Delete Events');
          }
        });
    }
  }
  return commitChanges;
}
