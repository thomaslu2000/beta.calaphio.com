<?php
$production = true;


if ($production) {
    require('/home/calaphio/configs/members.calaphio.com/Settings.php');
} else {
    require('env-example.php');
    header("Access-Control-Allow-Origin: *");
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$secret = hash('sha256', DB_USER.DB_PASSWORD);
$con = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);

?>