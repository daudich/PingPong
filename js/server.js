var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html', 'utf8',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html' + err);
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
	
	console.log("connected\n");
 
});
