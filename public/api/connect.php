<?php

header("Access-Control-Allow-Headers: *");
header("Cache-Control: no-cache");
require("make_con.php");

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));

if (!$con) {
  die("Connection failed: " . mysqli_connect_error());
}

if ($method == "POST") {
  $data = json_decode(file_get_contents('php://input'), true);
  foreach ($data as $k => $v) {
    $data[$k] = mysqli_real_escape_string($con, str_replace('apo_', 'ap o_', $v));
  }
  if ($data['API_SECRET'] !== $secret && $_REQUEST['API_SECRET'] !== $secret){ die("Connection failed: fuck you"); return;}
  unset($data['API_SECRET']);
} else {
  foreach ($_GET as $k => $v) {
    $_GET[$k] = mysqli_real_escape_string($con, str_replace('apo_', 'ap o_', $v));
  }
  if ($_GET['API_SECRET'] !== $secret){ die("Connection failed: don't do this"); return;}
  unset($_GET['API_SECRET']);
}
$multi = FALSE;

switch ($request[0]) {
    case 'admin':
      //security stuff here
      switch($request[1]) {
        case 'pledge_stats':
          $sql = sprintf("SELECT user_id, firstname, lastname, SUM(a.attended * a.hours * (e.type_service_chapter = 1 OR e.type_service_campus=1 OR e.type_service_community = 1 OR e.type_service_country = 1)) AS service_hours_attended, 
          SUM(a.flaked*a.hours * (e.type_service_chapter = 1 OR e.type_service_campus=1 OR e.type_service_community = 1 OR e.type_service_country = 1)) as service_hours_flaked, 
          SUM(a.attended * e.type_fellowship) as fellowships_attended, SUM(a.flaked * e.type_fellowship) as fellowships_flaked, SUM(a.chair * a.attended) AS events_chaired, 
          SUM(a.attended * e.type_fundraiser) as fundraisers_attended FROM apo_pledges LEFT JOIN apo_calendar_attend a USING (user_id) JOIN apo_users u USING(user_id) JOIN apo_calendar_event e USING (event_id) JOIN (SELECT * FROM apo_semesters ORDER BY id DESC LIMIT 1) ls
          WHERE ls.start <e.date AND e.date< CURRENT_TIMESTAMP
          GROUP BY user_id");
          break;
        case 'unevaluated':
          $sql = sprintf("SELECT event_id, title, date, COUNT(user_id) as num_attending 
          FROM apo_calendar_event LEFT JOIN apo_calendar_attend USING (event_id) 
          WHERE evaluated=0 AND start_at > '%s' AND date <= '%s' AND deleted=0 
          GROUP BY event_id ORDER BY start_at ASC", $_GET['startDate'], $_GET['endDate']);
          break;
        case 'superstars':
          $sql = sprintf("SELECT *, attendedTime + COALESCE(flakedTime, 0 ) as totalTime 
          from (SELECT firstname, lastname, user_id, pledgeclass, sum(hours) as attendedTime 
          FROM (apo_calendar_event JOIN apo_calendar_attend USING (event_id)) Join apo_users USING (user_id)  
          WHERE (type_service_chapter=TRUE OR type_service_campus=TRUE OR type_service_community=TRUE OR type_service_country=TRUE OR type_fundraiser=TRUE) 
          AND attended = TRUE AND deleted=FALSE AND date BETWEEN '%s' AND '%s' AND disabled = 0 Group By user_id) as attendedHours left join 
          (SELECT user_id, sum(hours) * -1 as flakedTime FROM (apo_calendar_event JOIN apo_calendar_attend USING (event_id)) Join apo_users USING (user_id)  
          WHERE (type_service_chapter=TRUE OR type_service_campus=TRUE OR type_service_community=TRUE OR type_service_country=TRUE OR type_fundraiser=TRUE) 
          AND flaked = TRUE AND deleted=FALSE AND date BETWEEN '%s' AND '%s' AND disabled = 0 Group By user_id) as flakedHours using (user_id) group by user_id order by totalTime DESC
          ", $_GET['start'], $_GET['end'], $_GET['start'], $_GET['end']);
          break;
        case 'getPledges':
          $sql = sprintf("SELECT user_id, firstname, lastname, pledgeclass FROM apo_pledges LEFT JOIN apo_users USING(user_id)");
          break;
        case 'updatePledges':
          $toDepledge = explode(',', $data["depledge"]);
          $toCross = explode(',', $data["cross"]);
          $queries = array();
          foreach($toDepledge as $p) if($p) $queries[] = sprintf("UPDATE apo_users SET depledged=1, disabled=1 WHERE user_id=%s", $p);
          if (count($toDepledge) + count($toCross) > 0) {
            $deletes = array();
            foreach(array_merge($toDepledge, $toCross) as $id) if ($id) $deletes[] = sprintf("user_id=%s", $id);
            $queries[] = sprintf("DELETE FROM apo_pledges WHERE %s", implode(' OR ', $deletes));
          }
          $multi = TRUE;
          $sql = implode('; ', $queries);
          break;
        case 'addPledges':
          $d = explode('%&^%', $data['data']);
          $keys = $data['keys'];
          $indivKeys = explode(',', $keys);

          $sid = array_search( "sid" , $indivKeys );
          if ($sid === false) {
            $sql = "SELECT 1/0 FROM apo_users;";
            break;
          }

          $extra = sprintf(",'%s', CURRENT_TIMESTAMP, %s", $data['pledgeclass'], $data['uid']);
          $toAdd = array();

          foreach($d as $datum){
            $salt = substr(md5(uniqid(rand(), true)), 0, 32);
            $datum = explode(',', $datum);
            $datum[] = $salt; $datum[] = sha1($salt . $datum[$sid]);
            $datum = array_map(function($x) {return '"'.$x.'"';}, $datum);
            $toAdd[] = implode(',', $datum) . $extra;
          } 

          $sql = "INSERT INTO apo_users (".$keys.", salt, passphrase, pledgeclass, registration_timestamp, registration_user) 
          VALUES (".implode('), (', $toAdd) . "); SET @firstid := LAST_INSERT_ID(); 
          INSERT INTO apo_pledges (user_id)
          SELECT user_id
          FROM (SELECT user_id from apo_users where user_id>=@firstid) as p;
          ";
          $multi = TRUE;
          break;
        case 'get':
          $sql = "SELECT user_id, firstname, lastname FROM apo_permissions_groups LEFT JOIN apo_users USING(user_id) WHERE group_id=1";
          break;
        case 'remove':
          $sql = sprintf("DELETE FROM apo_permissions_groups WHERE user_id=%s", $data['userId']);
          break;
        case 'add':
          $sql = sprintf("INSERT INTO apo_permissions_groups (user_id, group_id) VALUES(%s, 1)", $data['userId']);
          break;
        case 'addAnnouncement':
          $sql = sprintf("INSERT INTO apo_announcements (user_id, text, publish_time, title) 
          VALUES (%s, '%s', CURRENT_TIME, '%s')", $data['userId'], $data['text'], $data['title']);
          break;
        case 'updateAnnouncement':
          $sql = sprintf("UPDATE apo_announcements SET text='%s', title='%s' WHERE id=%s", $data['text'], $data['title'], $data['id']);
          break;
        case 'deleteAnnouncement':
          $sql = sprintf("DELETE FROM apo_announcements WHERE id=%s", $data['id']);
          break;
      }
      break;
    case 'people':
      switch($request[1]) {
        case 'changePassVerify':
          $sql = sprintf("UPDATE apo_users SET passphrase=sha1(concat(salt, '%s')) 
          where user_id=%s and passphrase=sha1(concat(salt,'%s'));", $data['newPass'], $data['userId'], $data['oldPass']);
          break;
        case 'loginId':
          $sql = sprintf("SELECT user_id FROM apo_users WHERE user_id=%s AND passphrase=sha1(concat(salt, '%s')) LIMIT 1", $_GET['userId'], $_GET['oldPass']);
          break;
        case 'login':
          $sql = sprintf("SELECT user_id, firstname, disabled FROM apo_users 
          WHERE email='%s' AND passphrase=sha1(concat(salt, '%s')) LIMIT 1", $data['email'], $data['passphrase']);
          break;
        case 'admin':
          $sql = sprintf("SELECT 1 FROM apo_permissions_groups 
          WHERE user_id=%s AND group_id=1", $_GET['userId']);
          break;
        case 'adminOrChair':
          $sql = sprintf("SELECT 1 FROM apo_permissions_groups 
          WHERE user_id=%s AND group_id=1 
          UNION SELECT 1 from apo_calendar_attend 
          WHERE user_id=%s AND event_id=%s AND chair=1", $_GET['userId'], $_GET['userId'], $_GET['eventId']);
          break;
        case 'stats':
          $sql = sprintf("SELECT SUM(a.attended * a.hours * (e.type_service_chapter = 1 OR e.type_service_campus=1 OR e.type_service_community = 1 OR e.type_service_country = 1)) AS service_hours_attended, 
          SUM(a.flaked*a.hours * (e.type_service_chapter = 1 OR e.type_service_campus=1 OR e.type_service_community = 1 OR e.type_service_country = 1)) as service_hours_flaked, 
          SUM(a.attended * e.type_fellowship) as fellowships_attended, SUM(a.flaked * e.type_fellowship) as fellowships_flaked, SUM(a.chair * a.attended) AS events_chaired, 
          SUM(a.attended * e.type_fundraiser) as fundraisers_attended FROM apo_calendar_event e JOIN apo_calendar_attend a USING (event_id) 
          WHERE '%s'<e.date AND e.date<'%s' AND user_id=%s", $_GET['startDate'], $_GET['endDate'], $_GET['userId']);
          break;
        case 'toEval':
          $sql = sprintf("SELECT event_id, title 
          FROM apo_calendar_attend JOIN apo_calendar_event USING (event_id) 
          WHERE user_id=%s AND chair=1 AND evaluated=0 AND start_at < CURRENT_TIMESTAMP AND deleted=0 
          ORDER BY start_at ASC", $_GET['userId']);
          break;
        case 'next3':
          $sql = sprintf("SELECT event_id, title, location, start_at, end_at, time_allday FROM apo_calendar_event JOIN apo_calendar_attend USING (event_id) 
          WHERE user_id = %s AND end_at > CURRENT_TIMESTAMP AND deleted = 0 ORDER BY start_at LIMIT 3 ", $_GET['userId']);
          break;
        case 'upcoming':
          $sql = sprintf("SELECT event_id, title, location, start_at, end_at, time_allday FROM apo_calendar_event JOIN apo_calendar_attend USING (event_id) 
          WHERE user_id = %s AND end_at > CURRENT_TIMESTAMP AND deleted = 0 ORDER BY start_at", $_GET['userId']);
          break;
        case 'search':
          $sql = sprintf("SELECT user_id, firstname, lastname, pledgeclass, email, phone, dynasty FROM apo_users 
          WHERE CONCAT(firstname, ' ', lastname) LIKE '%s%%' AND disabled=0 ORDER BY user_id DESC", $_GET['query']);
          break;
        case 'userData':
          $sql = sprintf("SELECT user_id, firstname, lastname, pledgeclass, email, dynasty, 
          phone, cellphone, address, city, zipcode, profile_pic, description FROM apo_users LEFT JOIN apo_wiki_user_description USING(user_id)
          WHERE user_id=%s", $_GET['userId']);
          break;
        case 'changePass':
          $sql = sprintf("UPDATE apo_users SET passphrase=sha1(concat(salt, '%s')) where user_id=%s", $data['pass'], $data['userId']);
          break;
        case 'updateDescription':
          $sql = sprintf("INSERT INTO apo_wiki_user_description (user_id, description) VALUES(%s, '%s') ON DUPLICATE KEY UPDATE    
          description='%s'", $data['userId'], $data['description'], $data['description']);
          break;
        case 'updateProfile':
          $sql = sprintf("UPDATE apo_users SET firstname='%s', lastname='%s', email='%s', cellphone='%s', 
          phone='%s', address='%s', city='%s', zipcode='%s' WHERE user_id=%s", $data['firstname'], $data['lastname'], $data['email'], 
          $data['cellphone'], $data['phone'], $data['address'], $data['city'], $data['zipcode'], $data['userId']);
          break;
        case 'uploadPFP':
          if ($_REQUEST['API_SECRET'] !== $secret){ die("Connection failed: don't do this"); return;}
          $path = $_REQUEST['pathTo'];
          $uid = $_REQUEST['userId'];
          $ext = strtolower(pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION));
          $new_path = $path . $uid . '.';
          array_map('unlink', glob('../' . $new_path . '*'));
          $new_path .= $ext;
          if (($ext == 'jpg' || $ext == 'jpeg' || $ext == 'png') && 
            move_uploaded_file($_FILES["file"]["tmp_name"], '../' . $new_path)) {
            $sql = sprintf("UPDATE apo_users SET profile_pic='%s' WHERE user_id=%s", $new_path, $uid);
          } else {
            $sql = sprintf("SELECT 'failed' FROM apo_users LIMIT 1");
          }
          break;
      }
      break;
    case 'events': 
      if (count($request) == 1) $sql = sprintf("SELECT title, location, description, time_start, time_end, time_allday, 
        type_interchapter, type_service_chapter, type_service_campus, type_service_community, type_service_country, type_fellowship, 
        type_fundraiser, creator_id, start_at, end_at, evaluated FROM apo_calendar_event 
        WHERE event_id=%s", $_GET['eventId']);
      else {
        switch($request[1]) {
          case 'day':
            $sql = sprintf("SELECT event_id, title, location, description, time_start, time_end, time_allday, 
            type_interchapter, type_service_chapter, type_service_campus, type_service_community, type_service_country, type_fellowship, 
            type_fundraiser, creator_id, start_at, end_at, evaluated FROM apo_calendar_event 
            WHERE deleted=0 AND end_at>'%s' AND start_at<'%s'", $_GET['startDate'], $_GET['endDate']);
            break;
          case 'month':
            $sql = sprintf("SELECT event_id, start_at, end_at, title, (type_service_chapter | type_service_campus | type_service_community | type_service_country) as service, 
            type_fellowship as fellowship FROM apo_calendar_event 
            WHERE date >= '%s' AND date <= '%s' AND deleted=0", $_GET['startDate'], $_GET['endDate']);
            break;
          case 'counts':
            $sql = sprintf("SELECT date, SUM(type_service_chapter | type_service_campus | type_service_community | type_service_country) as service, 
            SUM(type_fellowship) as fellowships, COUNT(*) as total FROM apo_calendar_event 
            WHERE date >= '%s' AND date <= '%s' AND deleted=0 GROUP BY date", $_GET['startDate'], $_GET['endDate']);
            break;
          case 'attending':
            $sql = sprintf("SELECT a.user_id as uid, signup_time, chair, firstname, lastname, phone FROM apo_calendar_attend as a 
            JOIN apo_users as u USING (user_id) WHERE event_id = %s ORDER BY signup_time ASC", $_GET['eventId']);
            break;
          case 'signUp':
            $sql = sprintf("INSERT INTO apo_calendar_attend (event_id, user_id, signup_time) 
            VALUES (%s, %s, '%s')", $data['eventId'], $data['userId'], $data['timestamp']);
            break;
          case 'signOff':
            $sql = sprintf("DELETE FROM apo_calendar_attend 
            WHERE event_id=%s AND user_id=%s", $data['eventId'], $data['userId']);
            break;
          case 'changeChair':
            $sql = sprintf("UPDATE apo_calendar_attend SET chair=%s 
            WHERE event_id=%s AND user_id=%s", $data['setting'], $data['eventId'], $data['userId']);
            break;
          case 'create':
            $sql = sprintf("INSERT INTO apo_calendar_event (title, location, description, date, time_start, time_end, time_allday, 
            type_interchapter, type_service_chapter, type_service_campus, type_service_community, type_service_country, type_fellowship, type_fundraiser, creator_id, start_at, end_at) 
            VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')", 
            $data['title'], $data['location'], $data['description'], $data['date'], $data['time_start'], $data['time_end'], $data['time_allday'] ? 1 : 0, 
            $data['type_interchapter'] ? 1 : 0, $data['type_service_chapter'] ? 1 : 0,  $data['type_service_campus'] ? 1 : 0,  $data['type_service_community'] ? 1 : 0,
            $data['type_service_country'] ? 1 : 0,  $data['type_fellowship'] ? 1 : 0,  $data['type_fundraiser'] ? 1 : 0, $data['creator_id'], $data['start_at'], $data['end_at']);
            break;
          case 'delete':
            $sql = sprintf("UPDATE apo_calendar_event SET deleted=1, 
            creator_id=%s WHERE event_id=%s", $data['userId'], $data['eventId']);
            break;
          case 'edit':
            $things = array();
            $eid = $data['eventId'];
            unset($data['eventId']);
            foreach ($data as $k => $v) $things[] = sprintf("%s='%s'", $k, $v);
            $sql = sprintf("UPDATE apo_calendar_event SET %s WHERE event_id=%s", implode(', ', $things), $eid);
            break;
          case 'evaluate':
            $queries = array(sprintf("UPDATE apo_calendar_event SET evaluated=1 WHERE event_id=%s", $data['eventId']));
            foreach($data['attend'] as $p) $queries[] = sprintf("UPDATE apo_calendar_attend SET attended=%s, chair=%s, flaked=%s, hours=%s WHERE event_id=%s AND user_id=%s", $p->attended, $p->chair, $p->flaked, $p->hours, $data['eventId'], $p->userId);
            if (count($data['delete']) > 0) {
              $deletes = array();
              foreach($data['delete'] as $id) $deletes[] = sprintf("user_id=%s", $id);
              $queries[] = sprintf("DELETE FROM apo_calendar_attend WHERE event_id=%s AND (%s)", $data['eventId'], implode(' OR ', $deletes));
            }
            $multi = TRUE;
            $sql = implode('; ', $queries);
            break;
        }
      }
      break;
    case 'general':
      switch($request[1]) {
        case 'lastSem':
          $sql = "SELECT * FROM apo_semesters ORDER BY id DESC LIMIT 1";
          break;
        case 'announcements':
          $sql = "SELECT a.id, a.user_id, a.text, a.publish_time, a.title, u.firstname, u.lastname, u.pledgeclass, e.start 
          FROM apo_announcements a JOIN apo_users u 
          USING (user_id) JOIN (SELECT MAX(start) as start FROM apo_semesters) as e 
          WHERE a.publish_time > e.start 
          ORDER BY `a`.`publish_time` DESC";
          break;
      }
      break;
    default:
      echo("oops");
}

// run SQL statement
if ($multi) $result = mysqli_multi_query($con, $sql);
else $result = mysqli_query($con, $sql);

// die if SQL statement failed
if (!$result) {
  http_response_code(404);
  die(mysqli_error($con));
}

echo '[';
for ($i=0 ; $i<mysqli_num_rows($result) ; $i++) {
  echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
}
echo ']';

$con->close();