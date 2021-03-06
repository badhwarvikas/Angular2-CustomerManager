var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    errorhandler = require('errorhandler'),
    csrf = require('csurf'),
    routes = require('./routes'),
    api = require('./routes/api'),
    DB = require('./lib/accessDB'),
    seeder = require('./lib/dbSeeder'),
    app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

console.log(__dirname)
app.use(express.static('./'));

app.use(session({ 
    secret: 'customermanager-angular2', 
    saveUninitialized: true,
    resave: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(errorhandler());
app.use(csrf());

app.use(function (req, res, next) {
    var csrf = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrf);
    res.locals._csrf = csrf;
    next();
});

process.on('uncaughtException', function (err) {
    if (err) console.log(err, err.stack);
});

DB.startup(function() {
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development') {
        console.log('Starting dbSeeder...');
        seeder.init();
    } 
});

// Routes
app.get('/', routes.index);

// JSON API
var baseUrl = '/api/dataservice/';

app.get(baseUrl + 'Customers', api.customers);
app.get(baseUrl + 'Customer/:id', api.customer);
app.get(baseUrl + 'CustomersSummary', api.customersSummary);
app.get(baseUrl + 'CustomerById/:id', api.customer);

app.post(baseUrl + 'PostCustomer', api.insertCustomer);
app.put(baseUrl + 'PutCustomer/:id', api.updateCustomer);
app.delete(baseUrl + 'DeleteCustomer/:id', api.deleteCustomer);

app.get(baseUrl + 'States', api.states);

app.get(baseUrl + 'CheckUnique/:id', api.checkUnique);

app.post(baseUrl + 'Login', api.login);
app.post(baseUrl + 'Logout', api.logout);


// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server

app.listen(3000, function () {
    console.log("CustMgr Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
