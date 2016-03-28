
var fs = require('fs');
var cookieSession = require('cookie-session')

function hook_writestream(stream, callback) {
	var old_write = stream.write;

	stream.write = (function(write) {
		return function(string, encoding, fd) {
			write.apply(stream, arguments);
			callback(string, encoding, fd);
		};
	})(stream.write);

	return function() {
		stream.write = old_write;
	};
}

process.argv.forEach(function (val, index, array) {
  if (index == 2) {
    console.log("Changing directory to " + val);
    process.chdir(val);
  }
  else if (index == 3 && val == "true") {    
    console.log("Redirecting logs to file node.log");
	var stdoutFS = fs.createWriteStream('node.log', {
      encoding: 'utf8',
      flags   : 'a+'
    });
    hook_writestream(process.stdout, function(string, encoding, fd) {
      stdoutFS.write(string, encoding || 'utf8');
    });
  }
});

var express = require('express'),
    config = require('config').Settings,
    path = require('path');
var app = express();

app.configure(function () {

    //these are equivalent to express.bodyParser(), but we don't need file upload, so we'll remove multi-part

    //app.use(express.multipart());

    app.use(express.cookieParser());
    app.use(cookieSession({
        name: 'see.session',
        secret: 'DSMJN5XAgysYllVfjgYGZ08X',
        httpOnly: false
    }));
    app.use('/see/api', require('./routes/api.js'));  
    app.use('/see/inbound', require('./routes/inbound.js'));  

    app.use('/see', express.static(path.join(__dirname, 'client')));

    app.get('/', function (req, res) {
        res.redirect('/see');
    });
});

    
//log.http('', "listening on http://localhost:" + config.appPort);
app.listen(config.appPort);

app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'origin, x-csrftoken, content-type, accept');
    next();
});

app.options('*', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'origin, x-csrftoken, content-type, accept');
    res.send();
});