<?php

$db_host="localhost";
$db_user="root";
$db_password="";

$lnk=mysqli_connect($db_host,$db_user,$db_password);
if(!$lnk)
	die("Database connection failed");

mysqli_select_db($lnk,"puzzlecam") or die ("Failed to select DB");

$query="Select Name, Time FROM scores".
	" WHERE Difficulty Like 'Easy'".
	" ORDER BY Time";

$rs=mysqli_query($lnk,$query);

$results=array();
if(mysqli_num_rows($rs)>0){
	while($row=mysqli_fetch_assoc($rs)){
		array_push($results,$row);
	}
}

print_r($results);



?>