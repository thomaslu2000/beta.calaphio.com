<?php
header("Access-Control-Allow-Headers: *");
header("Cache-Control: no-cache");
require("make_con.php");

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));

$SHOW_FAMS = '1';

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
}
$multi = FALSE;
$submitted = false;

$session_token = 'none';
$auth_user = FALSE;
if (isset($data['token']) and isset($data['userId'])) {
  $session_token = $data['token'];
  $auth_user = $data['userId'];
  unset($data['token']);
} elseif (isset($_REQUEST['token']) and isset($_REQUEST['userId'])) {
  $session_token = $_REQUEST['token'];
  $auth_user = $_REQUEST['userId'];
  unset($_REQUEST['token']);
} elseif (isset($_GET['token']) and isset($_GET['userId'])) {
  $session_token = $_GET['token'];
  $auth_user = $_GET['userId'];
  unset($_GET['token']);
}
if ($auth_user) {
  $auth_result = mysqli_query($con, sprintf(
    "SELECT user_id from apo_sessions 
    WHERE user_id=%s and token_hash=SHA2(CONCAT('%s', user_id), 256)", $auth_user, $session_token));
  if (mysqli_num_rows($auth_result) === 0) {
    http_response_code(401);
    die("authentification failed");
  }
}
  

switch ($request[0]) {
    case 'adminOrChair':
      if (!$auth_user) {
        http_response_code(401);
        die("admin / chair authentification failed");
      }

      if (isset($data['eventId'])) {
        $eid = $data['eventId'];
      } elseif (isset($_REQUEST['eventId'])) {
        $eid = $_REQUEST['eventId'];
      } elseif (isset($_GET['eventId'])) {
        $eid = $_GET['eventId'];
      }

      $admin_result = mysqli_query($con, sprintf(
        "SELECT 1 FROM apo_permissions_groups 
        WHERE user_id=%s AND group_id=1 
        UNION SELECT 1 from apo_calendar_attend 
        WHERE user_id=%s AND event_id=%s AND chair=1", $auth_user, $auth_user, $eid));

      if (mysqli_num_rows($admin_result) === 0) {
        http_response_code(401);
        die("user not admin nor chair");
      }
      switch($request[1]) {
        case 'signOffTarget':
          $sql = sprintf("DELETE FROM apo_calendar_attend WHERE event_id=%s AND user_id=%s", 
          $data['eventId'], $data['targetId']);
          break;
        case 'signUpTarget':
          $sql = sprintf("INSERT INTO apo_calendar_attend (event_id, user_id, signup_time) 
          VALUES (%s, %s, '%s')", $data['eventId'], $data['targetId'], $data['timestamp']);
          break;
        case 'delete':
          $sql = sprintf("UPDATE apo_calendar_event SET deleted=1, 
          creator_id=%s WHERE event_id=%s", $data['userId'], $data['eventId']);
          break;
        case 'edit':
          $things = array();
          $eid = $data['eventId'];
          unset($data['eventId']);
          unset($data['userId']);
          foreach ($data as $k => $v) $things[] = sprintf("%s='%s'", $k, $v);
          $sql = sprintf("UPDATE apo_calendar_event SET %s WHERE event_id=%s", implode(', ', $things), $eid);
          break;
        case 'evaluate':
          $queries = array(sprintf("UPDATE apo_calendar_event SET evaluated=1 WHERE event_id=%s", $data['eventId']));
          foreach(explode('-', $data['attend']) as $p){
            $p = explode(',', $p);
            $queries[] = sprintf("UPDATE apo_calendar_attend SET attended=%s, chair=%s, flaked=%s, hours=%s WHERE event_id=%s AND user_id=%s",
            $p[0], $p[4], $p[1], $p[3], $data['eventId'], $p[2]);
          } 
          $data['delete'] = explode('-', $data['delete']);
          if (count($data['delete']) > 0) {
            $deletes = array();
            foreach($data['delete'] as $id) if ($id != "") $deletes[] = sprintf("user_id=%s", $id);
            if (count($deletes) > 0) $queries[] = sprintf("DELETE FROM apo_calendar_attend WHERE event_id=%s AND (%s)", $data['eventId'], implode(' OR ', $deletes));
          }
          $multi = TRUE;
          $sql = implode('; ', $queries);
          // echo '['.$sql.']';
          break;
        }

      break;
    case 'admin':
      //security stuff here
      if (!$auth_user) {
        http_response_code(401);
        die("admin authentification failed");
      }
      $admin_result = mysqli_query($con, sprintf(
        "SELECT 1 FROM apo_permissions_groups 
        WHERE user_id=%s AND group_id=1", $auth_user));

      if (mysqli_num_rows($admin_result) === 0) {
        http_response_code(401);
        die("user not admin");
      }
      
      switch($request[1]) {
        case 'clearSessions':
          $sql = "DELETE FROM apo_sessions WHERE CURRENT_DATE >= expires";
          break;
        case 'changePass':
          $sql = sprintf("UPDATE apo_users SET passphrase=sha1(concat(salt, '%s')) where user_id=%s", $data['pass'], $data['targetId']);
          break;
        case 'pledge_stats':
          $sql = sprintf("SELECT user_id, firstname, lastname, SUM(a.attended * a.hours * (e.type_service_chapter = 1 OR e.type_service_campus=1 OR e.type_service_community = 1 OR e.type_service_country = 1)) AS service_hours_attended, 
          SUM(a.flaked*a.hours * (e.type_service_chapter = 1 OR e.type_service_campus=1 OR e.type_service_community = 1 OR e.type_service_country = 1)) as service_hours_flaked, 
          SUM(a.attended * e.type_fellowship) as fellowships_attended, SUM(a.flaked * e.type_fellowship) as fellowships_flaked, SUM(a.chair * a.attended) AS events_chaired, 
          SUM(a.attended * e.type_fundraiser) as fundraisers_attended FROM apo_pledges LEFT JOIN apo_calendar_attend a USING (user_id) JOIN apo_users u USING(user_id) JOIN apo_calendar_event e USING (event_id) JOIN (SELECT * FROM apo_semesters ORDER BY id DESC LIMIT 1) ls
          WHERE ls.start <e.date AND e.date< CURRENT_TIMESTAMP and e.deleted=0
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
          unset($data['token']);
          $d = explode('%&^%', $data['data']);
          $keys = $data['keys'];
          $indivKeys = explode(',', $keys);

          $sid = array_search( "sid" , $indivKeys );
          if ($sid === false) {
            $sql = "SELECT 1/0 FROM apo_users;";
            break;
          }
          $extra = sprintf(",'%s', CURRENT_TIMESTAMP, %s", $data['pledgeclass'], $data['userId']);
          $toAdd = array();
          $sids = array();

          foreach($d as $datum){
            if ($datum[$sid]!=',') {
              $salt = substr(md5(uniqid(rand(), true)), 0, 32);
              $datum = explode(',', $datum);
              $sids[] = $datum[$sid];
              $datum[] = $salt; $datum[] = sha1($salt . $datum[$sid]);
              $datum = array_map(function($x) {return '"'.$x.'"';}, $datum);
              $toAdd[] = implode(',', $datum) . $extra;
            }
          } 

          $sql = "INSERT INTO apo_users (".$keys.", salt, passphrase, pledgeclass, registration_timestamp, registration_user) 
          VALUES (".implode('), (', $toAdd) . ") ON DUPLICATE KEY UPDATE disabled=0, depledged=0, pledgeclass='".$data['pledgeclass']."'; SET @firstid := LAST_INSERT_ID(); " .
          "INSERT IGNORE INTO apo_pledges (user_id)
          SELECT user_id from apo_users where sid IN (". implode(", ", $sids). ");";
          $multi = TRUE;
          break;
        case 'get':
          $sql = "SELECT user_id, firstname, lastname FROM apo_permissions_groups LEFT JOIN apo_users USING(user_id) WHERE group_id=1";
          break;
        case 'remove':
          $sql = sprintf("DELETE FROM apo_permissions_groups WHERE user_id=%s AND group_id=1", $data['targetId']);
          break;
        case 'add':
          $sql = sprintf("INSERT INTO apo_permissions_groups (user_id, group_id) VALUES(%s, 1)", $data['targetId']);
          break;
        case 'getPcomm':
          $sql = "SELECT user_id, firstname, lastname FROM apo_permissions_groups LEFT JOIN apo_users USING(user_id) WHERE group_id=3";
          break;
        case 'removePcomm':
          $sql = sprintf("DELETE FROM apo_permissions_groups WHERE user_id=%s AND group_id=3", $data['targetId']);
          break;
        case 'addPcomm':
          $sql = sprintf("INSERT INTO apo_permissions_groups (user_id, group_id) VALUES(%s,3)", $data['targetId']);
          break;
        case 'getWikiEditor':
          $sql = "SELECT user_id, firstname, lastname FROM apo_permissions_groups LEFT JOIN apo_users USING(user_id) WHERE group_id=6";
          break;
        case 'removeWikiEditor':
          $sql = sprintf("DELETE FROM apo_permissions_groups WHERE user_id=%s AND group_id=6", $data['targetId']);
          break;
        case 'addWikiEditor':
          $sql = sprintf("INSERT INTO apo_permissions_groups (user_id, group_id) VALUES(%s,6)", $data['targetId']);
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
        case 'logout':
          $sql = sprintf("DELETE FROM apo_sessions WHERE user_id=%s and token='%s'", $data['userId'], $data['token']);
          break;
        case 'login':
          $rand = bin2hex(random_bytes(20));

          $sql = sprintf("SELECT user_id, firstname, lastname, disabled, '%s' as token 
          FROM apo_users 
          WHERE email='%s' AND passphrase=sha1(concat(salt, '%s')) LIMIT 1; ", 
          $rand, $data['email'], $data['passphrase']);

          $result = mysqli_query($con, $sql);
          echo '[';
          for ($i=0 ; $i<mysqli_num_rows($result) ; $i++) {
            echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
          }
          echo ']';
          $submitted = true;

          $sql = sprintf("INSERT INTO apo_sessions (user_id, token_hash, expires) 
          SELECT user_id, SHA2(CONCAT('%s', user_id), 256), NOW() + INTERVAL 3 MONTH
          FROM apo_users
          WHERE email='%s' AND passphrase=sha1(concat(salt, '%s')) 
          LIMIT 1; ", $rand, $data['email'], $data['passphrase']);
          
          break;
        case 'admin':
          $sql = sprintf("SELECT 1 FROM apo_permissions_groups 
          WHERE user_id=%s AND group_id=1", $_GET['userId'] );
          break;
        case 'wiki':
          $sql = sprintf("SELECT 1 FROM apo_permissions_groups 
          WHERE user_id=%s AND (group_id=1 OR group_id=6)", $_GET['userId'] );
          break;
        case 'adminOrChair':
          $sql = sprintf("SELECT 1 FROM apo_permissions_groups 
          WHERE user_id=%s AND group_id=1 
          UNION SELECT 1 from apo_calendar_attend 
          WHERE user_id=%s AND event_id=%s AND chair=1", $_GET['userId'], $_GET['userId'], $_GET['eventId']);
          break;
        case 'stats':
          $sql = sprintf("SELECT SUM(a.attended * a.hours * (e.type_service_chapter | e.type_service_campus | e.type_service_community | e.type_service_country)) AS service_hours_attended, 
          SUM(a.flaked*a.hours * (e.type_service_chapter | e.type_service_campus | e.type_service_community | e.type_service_country)) as service_hours_flaked, 
          SUM(a.attended * e.type_fellowship) as fellowships_attended, SUM(a.flaked * e.type_fellowship) as fellowships_flaked, SUM(a.chair * a.attended) AS events_chaired, 
          SUM(a.attended * e.type_fundraiser) as fundraisers_attended FROM apo_calendar_event e JOIN apo_calendar_attend a USING (event_id) 
          WHERE '%s'<e.date AND e.date<'%s' AND user_id=%s AND deleted=0", $_GET['startDate'], $_GET['endDate'], $_GET['targetId']);
          break;
        case 'allCurrentEvents':
          $sql = sprintf("SELECT e.event_id as id, e.title AS title, e.start_at as date, a.chair as chair, 
          (e.type_service_chapter | e.type_service_campus | e.type_service_community | e.type_service_country) as service, 
          e.type_fellowship as fellowship, a.flaked as flake, a.hours as hours, e.evaluated as evaluated
          FROM apo_calendar_event e JOIN apo_calendar_attend a USING (event_id) JOIN 
          (SELECT start FROM apo_semesters ORDER BY start DESC LIMIT 1) f
          WHERE user_id=%s AND deleted=0 AND f.start < e.start_at ORDER BY date", $_GET['userId']);
          break;
        case 'allEvents':
          $sql = sprintf("SELECT  e.event_id as id, e.title AS title, e.start_at as date, a.chair as chair, 
          (e.type_service_chapter | e.type_service_campus | e.type_service_community | e.type_service_country) as service, 
          e.type_fellowship as fellowship, a.flaked as flake, a.hours as hours, e.evaluated as evaluated
          FROM apo_calendar_event e JOIN apo_calendar_attend a USING (event_id) 
          WHERE user_id=%s AND deleted=0 ORDER BY date", $_GET['userId']);
          break;
        case 'allPositions':
          $sql = sprintf("SELECT position_title, position_name, semester, year, bas.position_type
          FROM apo_wiki_positions as pos JOIN apo_wiki_positions_basic_info as bas USING (basic_info_id)
          WHERE user_id=%s AND (bas.position_type NOT IN (11, 12) OR 
          (user_id not in (SELECT user_id FROM apo_permissions_groups WHERE group_id=3)
               AND 1=%s))
          UNION
          SELECT position_title, position_parent as position_name, semester, year , controller_type as position_type
          FROM apo_wiki_positions_simple
          WHERE user_id=%s AND (controller_type <> 11 OR 
            (user_id not in (SELECT user_id FROM apo_permissions_groups WHERE group_id=3 )
               AND 1=%s)) 
          ORDER BY year ASC, semester ASC, position_type ASC", $_GET['userId'], $SHOW_FAMS, $_GET['userId'], $SHOW_FAMS);
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
          $sql = sprintf("SELECT user_id, firstname, lastname, pledgeclass, email, phone, dynasty, CURRENT_TIMESTAMP as time FROM apo_users 
          WHERE CONCAT(firstname, ' ', lastname) LIKE '%s%%' ORDER BY user_id DESC", $_GET['query']);
          break;
        case 'userData':
          $sql = sprintf("SELECT user_id, firstname, lastname, pledgeclass, email, dynasty, 
          phone, cellphone, address, city, zipcode, profile_pic, description FROM apo_users LEFT JOIN apo_wiki_user_description USING(user_id)
          WHERE user_id=%s", $_GET['userId']);
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
        type_fundraiser, creator_id, start_at, end_at, evaluated, signup_limit, type_dynasty_choice as color FROM apo_calendar_event 
        WHERE event_id=%s", $_GET['eventId']);
      else {
        switch($request[1]) {
          case 'postComment':
            $sql = sprintf("INSERT INTO apo_calendar_comment (user_id, body, timestamp, event_id) VALUES (%s, '%s', '%s', %s)",
          $data['userId'], $data['body'], $data['timestamp'], $data['eventId']);
            break;
          case 'deleteComment':
            $sql = sprintf("UPDATE apo_calendar_comment SET deleted=1 WHERE comment_id=%s",
          $data['commentId']);
            break;
          case 'getComments':
            $sql = sprintf("SELECT comment_id, user_id, timestamp, body, firstname, lastname, profile_pic 
            FROM apo_calendar_comment JOIN apo_users USING(user_id) WHERE deleted=0 AND event_id=%s
            ORDER BY timestamp ASC", $_GET['eventId']);
            break;
          case 'day':
            $sql = sprintf("SELECT event_id, title, location, description, time_start, time_end, time_allday, 
            type_interchapter, type_service_chapter, type_service_campus, type_service_community, type_service_country, type_fellowship, 
            type_fundraiser, creator_id, start_at, end_at, evaluated, signup_limit, type_dynasty_choice as color FROM apo_calendar_event 
            WHERE deleted=0 AND end_at>'%s' AND start_at<'%s'", $_GET['startDate'], $_GET['endDate']);
            break;
          case 'month':
            $sql = sprintf("SELECT event_id, start_at, end_at, title, (type_service_chapter | type_service_campus | type_service_community | type_service_country) as service, 
            type_fellowship as fellowship, type_dynasty_choice as color FROM apo_calendar_event 
            WHERE date >= '%s' AND date <= '%s' AND deleted=0", $_GET['startDate'], $_GET['endDate']);
            break;
          case 'counts':
            $sql = sprintf("SELECT date, SUM(type_service_chapter | type_service_campus | type_service_community | type_service_country) as service, 
            SUM(type_fellowship) as fellowships, COUNT(*) as total FROM apo_calendar_event 
            WHERE date >= '%s' AND date <= '%s' AND deleted=0 GROUP BY date", $_GET['startDate'], $_GET['endDate']);
            break;
          case 'attending':
            $sql = sprintf("SELECT a.user_id as uid, signup_time, chair, firstname, lastname, phone, flaked, attended, hours FROM apo_calendar_attend as a 
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
            $starts = explode(',', $data['rStarts']);
            $ends = explode(',', $data['rEnds']);
            $sql = "INSERT INTO apo_calendar_event (title, location, description, date, time_start, time_end, time_allday, 
            type_interchapter, type_service_chapter, type_service_campus, type_service_community, type_service_country, 
            type_fellowship, type_fundraiser, creator_id, start_at, end_at, type_dynasty_choice, signup_limit) 
            VALUES ";
            $rows = array();
            for ($i = 0; $i < count($starts); $i++) {
              $date = substr($starts[$i], 0, 10);
              $rows[] = sprintf("('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s') ", 
              $data['title'], $data['location'], $data['description'], $date, $data['time_start'], $data['time_end'], $data['time_allday'] ? 1 : 0, 
              $data['type_interchapter'] ? 1 : 0, $data['type_service_chapter'] ? 1 : 0,  $data['type_service_campus'] ? 1 : 0,  $data['type_service_community'] ? 1 : 0,
              $data['type_service_country'] ? 1 : 0,  $data['type_fellowship'] ? 1 : 0,  $data['type_fundraiser'] ? 1 : 0, $data['creator_id'], $starts[$i], $ends[$i], $data['type_dynasty_choice'],
              $data['signup_limit']);
            } 
            $sql .= implode(', ', $rows);
            break;

            // $sql = sprintf("INSERT INTO apo_calendar_event (title, location, description, date, time_start, time_end, time_allday, 
            // type_interchapter, type_service_chapter, type_service_campus, type_service_community, type_service_country, type_fellowship, type_fundraiser, creator_id, start_at, end_at) 
            // VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')", 
            // $data['title'], $data['location'], $data['description'], $data['date'], $data['time_start'], $data['time_end'], $data['time_allday'] ? 1 : 0, 
            // $data['type_interchapter'] ? 1 : 0, $data['type_service_chapter'] ? 1 : 0,  $data['type_service_campus'] ? 1 : 0,  $data['type_service_community'] ? 1 : 0,
            // $data['type_service_country'] ? 1 : 0,  $data['type_fellowship'] ? 1 : 0,  $data['type_fundraiser'] ? 1 : 0, $data['creator_id'], $data['start_at'], $data['end_at']);
            // break;
        }
      }
      break;
    case 'general':
      switch($request[1]) {
        case 'lastSem':
          $sql = "SELECT * FROM apo_semesters ORDER BY id DESC LIMIT 1";
          break;
        case 'allSems':
          $sql = "SELECT * FROM apo_semesters ORDER BY end DESC";
          break;
        case 'updateSem':
          $sql = sprintf("INSERT INTO apo_semesters (id, semester, start, end, namesake, namesake_short) 
          VALUES('%s', '%s', '%s', '%s', '%s', '%s') ON DUPLICATE KEY UPDATE    
          semester='%s', start='%s', end='%s', namesake='%s', namesake_short='%s'",
          $data['id'], $data['semester'], $data['start'], $data['end'], $data['namesake'], $data['namesake_short'],
          $data['semester'], $data['start'], $data['end'], $data['namesake'], $data['namesake_short']
          );
          break;
        case 'deleteSem':
          $sql = sprintf("DELETE FROM apo_semesters WHERE id='%s'", $data['id']);
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
      case 'wiki':
        if ($request[1] !== 'positions' && $request[1] !== 'searchParent') {
          if (!$auth_user) {
            http_response_code(401);
            die("admin / wiki editor authentification failed");
          }
    
          $admin_result = mysqli_query($con, sprintf(
            "SELECT 1 FROM apo_permissions_groups 
            WHERE user_id=%s AND (group_id=1 OR group_id=6)", $auth_user));
    
          if (mysqli_num_rows($admin_result) === 0) {
            http_response_code(401);
            die("user not admin nor chair");
          }
        }
        switch($request[1]) {
          case 'searchParent':
            $sql = sprintf("SELECT 
              user_id,
              CONCAT(firstname,' ',lastname,' (',pledgeclass,')') as name, 
              position_title as title, 
              position_name as parent,
              -1 as simple_id
            FROM apo_wiki_positions_basic_info as bas 
              JOIN  apo_wiki_positions as pos USING (basic_info_id)
              JOIN apo_users USING (user_id)
            WHERE 
              bas.year=%s
              AND bas.semester=%s 
              AND REPLACE(position_title, ' ', '') LIKE '%s' 
              AND REPLACE(position_name, ' ', '') LIKE '%s' ", 
              $_GET['year'], $_GET['sem'], $_GET['searchTitle'], $_GET['searchParent']);

            if ($_GET['posType'] == '6') {
              // Old semesters didnt pick a position type to be for pledges
              $sql .= sprintf("AND bas.position_type=13 AND position_name LIKE '%%Pledge Class' ");
            } elseif ($_GET['posType'] == '13') {
              // Filter out pledge class from this
              $sql .= sprintf("AND bas.position_type=13 AND position_name NOT LIKE '%%Pledge Class' ");
            } elseif ($_GET['posType'] == '11') {
              // Include small family AND big family
              $sql .= sprintf("AND (bas.position_type=11 OR bas.position_type=12) AND 1=%s 
              AND user_id not in (SELECT user_id FROM apo_permissions_groups WHERE group_id=3 )", $SHOW_FAMS);
            }
            else {
              $sql .= sprintf("AND bas.position_type=%s ", $_GET['posType']);
            }

            $sql .=  sprintf("
            UNION
            SELECT user_id,
                    CONCAT(firstname,' ',lastname,' (',pledgeclass,')') as name, 
                    position_title as title, 
                    position_parent as parent,
                    simple_id
            FROM apo_wiki_positions_simple JOIN apo_users USING(user_id)
            WHERE 
              year=%s
              AND semester=%s
              AND REPLACE(REPLACE(position_title, '%%20', ''), ' ', '')  LIKE '%s' 
              AND REPLACE(REPLACE(position_parent, '%%20', ''), ' ', '')  LIKE '%s' 
              AND controller_type=%s
              AND (controller_type<>11 OR 
              (user_id not in (SELECT user_id FROM apo_permissions_groups WHERE group_id=3 )
                 AND 1=%s))
            ORDER BY parent, title ASC",  
            $_GET['year'], $_GET['sem'], $_GET['searchTitle'], $_GET['searchParent'], $_GET['posType'], $SHOW_FAMS);
            break;
          case 'positions':
            $sql = sprintf("SELECT 
              user_id,
              CONCAT(firstname,' ',lastname,' (',pledgeclass,')') as name, 
              position_title as title, 
              position_name as parent,
              -1 as simple_id
            FROM apo_wiki_positions_basic_info as bas 
              JOIN  apo_wiki_positions as pos USING (basic_info_id)
              JOIN apo_users USING (user_id)
            WHERE 
              bas.year=%s
              AND bas.semester=%s ", 
              $_GET['year'], $_GET['sem']);

            if ($_GET['posType'] == '6') {
              // Old semesters didnt pick a position type to be for pledges
              $sql .= sprintf("AND bas.position_type=13 AND position_name LIKE '%%Pledge Class' ");
            } elseif ($_GET['posType'] == '13') {
              // Filter out pledge class from this
              $sql .= sprintf("AND bas.position_type=13 AND position_name NOT LIKE '%%Pledge Class' ");
            } elseif ($_GET['posType'] == '11') {
              // Include small family AND big family
              $sql .= sprintf("AND (bas.position_type=11 OR bas.position_type=12) AND 1=%s 
              AND user_id not in (SELECT user_id FROM apo_permissions_groups WHERE group_id=3 )", $SHOW_FAMS);
            }
            else {
              $sql .= sprintf("AND bas.position_type=%s ", $_GET['posType']);
            }

            $sql .=  sprintf("
            UNION
            SELECT user_id,
                    CONCAT(firstname,' ',lastname,' (',pledgeclass,')') as name, 
                    position_title as title, 
                    position_parent as parent,
                    simple_id
            FROM apo_wiki_positions_simple JOIN apo_users USING(user_id)
            WHERE 
              year=%s
              AND semester=%s
              AND controller_type=%s
              AND (controller_type<>11 OR 
              (user_id not in (SELECT user_id FROM apo_permissions_groups WHERE group_id=3 )
                 AND 1=%s))
            ORDER BY parent, title ASC",  
            $_GET['year'], $_GET['sem'], $_GET['posType'], $SHOW_FAMS);
            break;
          case 'addPosition':
            $sql = sprintf("INSERT INTO apo_wiki_positions_simple (user_id, position_title, position_parent, semester, year, controller_type) 
            VALUES (%s, '%s', '%s', %s, %s, %s)", 
            $data['targetId'], $data['title'], $data['parent'], $data['sem'], $data['year'], $data['posType']); 
            break;
          case 'deletePosition':
            $sql = sprintf("DELETE FROM apo_wiki_positions_simple WHERE simple_id=%s", 
            $data['simpleId']); 
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
if (!$submitted and !$multi) {
  echo '[';
  for ($i=0 ; $i<mysqli_num_rows($result) ; $i++) {
    echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
  }
  echo ']';  
}

$con->close();