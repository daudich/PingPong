<?php
error_reporting(E_ALL);

/* Allow the script to hang around waiting for connections. */
set_time_limit(0);

/* Turn on implicit output flushing so we see what we're getting
 * as it comes in. */
ob_implicit_flush();

$address = 'localhost';
$port = 10000;
$handshake = false;

if (($sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false) {
    echo "socket_create() failed: reason: " . socket_strerror(socket_last_error()) . "\n";
}

if (socket_bind($sock, $address, $port) === false) {
    echo "socket_bind() failed: reason: " . socket_strerror(socket_last_error($sock)) . "\n";
}

if (socket_listen($sock, 20) === false) {
    echo "socket_listen() failed: reason: " . socket_strerror(socket_last_error($sock)) . "\n";
}

do {
    if (($msgsock = socket_accept($sock)) === false) {
        echo "socket_accept() failed: reason: " . socket_strerror(socket_last_error($sock)) . "\n";
        break;
    }
    /* Send instructions. */
    $msg = "\nWelcome to the PHP Test Server. \n" .
        "To quit, type 'quit'. To shut down the server type 'shutdown'.\n";
    socket_write($msgsock, $msg, strlen($msg));

    do {
        if (false === ($buf = socket_read($msgsock, 2048, PHP_NORMAL_READ))) {
            echo "socket_read() failed: reason: " . socket_strerror(socket_last_error($msgsock)) . "\n";
            break 2;
        }
        if(!$handshake){
			dohandshake($buf);
		}
        if (!$buf = trim($buf)) {
            continue;
        }
        if ($buf == 'quit') {
            break;
        }
        if ($buf == 'shutdown') {
            socket_close($msgsock);
            break 2;
        }
        $talkback = "PHP: You said '$buf'.\n";
        socket_write($msgsock, $talkback, strlen($talkback));
        echo "$buf\n";
    } while (true);
    socket_close($msgsock);
} while (true);

socket_close($sock);

function dohandshake($buffer){
	
	global $handshake;
  echo("\nRequesting handshake...");
  echo($buffer);
  list($resource,$host,$origin,$strkey1,$strkey2,$data) = getheaders($buffer);
  echo("Handshaking...");

  $pattern = '/[^\d]*/';
  $replacement = '';
  $numkey1 = preg_replace($pattern, $replacement, $strkey1);
  $numkey2 = preg_replace($pattern, $replacement, $strkey2);

  $pattern = '/[^ ]*/';
  $replacement = '';
  $spaces1 = strlen(preg_replace($pattern, $replacement, $strkey1));
  $spaces2 = strlen(preg_replace($pattern, $replacement, $strkey2));

  if ($spaces1 == 0 || $spaces2 == 0 || $numkey1 % $spaces1 != 0 || $numkey2 % $spaces2 != 0) {
        socket_close($sock);
        echo('failed');
        return false;
  }

  $ctx = hash_init('md5');
  hash_update($ctx, pack("N", $numkey1/$spaces1));
  hash_update($ctx, pack("N", $numkey2/$spaces2));
  hash_update($ctx, $data);
  $hash_data = hash_final($ctx,true);

  $upgrade  = "HTTP/1.1 101 WebSocket Protocol Handshake\r\n" .
              "Upgrade: WebSocket\r\n" .
              "Connection: Upgrade\r\n" .
              "Sec-WebSocket-Origin: " . $origin . "\r\n" .
              "Sec-WebSocket-Location: ws://" . $host . $resource . "\r\n" .
              "\r\n" .
              $hash_data;

  socket_write($user->socket,$upgrade.chr(0),strlen($upgrade.chr(0)));
  $handshake=true;
  echo($upgrade);
  echo("Done handshaking...");
  return true;
}

function getheaders($req){
  $key2=$key1=$r=$h=$o=$data=null;
  
  if(preg_match("/GET (.*) HTTP/"   ,$req,$match)){ $r=$match[1]; }
  if(preg_match("/Host: (.*)\r\n/"  ,$req,$match)){ $h=$match[1]; }
  if(preg_match("/Origin: (.*)\r\n/",$req,$match)){ $o=$match[1]; }
  if(preg_match("/Sec-WebSocket-Key2: (.*)\r\n/",$req,$match)){ $key2=$match[1]; }
  if(preg_match("/Sec-WebSocket-Key1: (.*)\r\n/",$req,$match)){ $key1=$match[1]; }
  if(preg_match("/\r\n(.*?)\$/",$req,$match)){ $data=$match[1]; }
  return array($r,$h,$o,$key1,$key2,$data);
}

?>
