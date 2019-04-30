var hbs          = require('express-hbs');
const express    = require('express')
var path         = require('path');
const mongoose = require('mongoose');
var helmet = require('helmet')
var csrf = require('csurf')
var csrfProtection = csrf()
var bodyParser   = require('body-parser')
const expressValidator = require('express-validator')
const expSanitizer = require('express-sanitizer')
var filter = require('content-filter')
var session = require('express-session');
var app          = express()
var route       = require( path.resolve( __dirname, "./routes/route.js" ) );
var api      = require( path.resolve( __dirname, "./routes/api.js" ) );
var db;

const hostname = '0.0.0.0'
const port = 3000

mongoose.connect('mongodb://localhost/users', function (err) {
   if (err) throw err;
   console.log('Successfully connected');
});
db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(session({
  secret: 'flatscreen',
  resave: false,
  saveUninitialized: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(filter());
app.use(csrfProtection);
app.use(helmet())
app.use(expSanitizer())
app.use(expressValidator());

app.engine('hbs', hbs.express4({}));
app.set('view engine','hbs');
app.set('views', __dirname+"/views");


// Serving React app as static file
app.use('/static',express.static(__dirname + '/client'));
// Routing normal requests
app.use('/',route)
// Routing api requests.
app.use('/api',api)


  


app.use(function(req, res,next) {
  if (!req.session.user) {
    res.render('login',{csrfToken: req.csrfToken()});
  } else {
    next()
  }
});


app.listen(port, () => console.log(`Server running at http://${hostname}:${port}/`))
