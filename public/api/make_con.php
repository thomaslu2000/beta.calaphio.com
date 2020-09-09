<?php
$production = false;


if ($production) {
    require('/home/calaphio/configs/members.calaphio.com/Settings.php');
} else {
    require('env-example.php');
    header("Access-Control-Allow-Origin: *");
}


$con = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);

?>