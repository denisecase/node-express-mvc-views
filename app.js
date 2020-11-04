/**
 * @file app.js
 * The starting point of the application.
 * Express allows us to configure our app and use
 * dependency injection to add it to the http server.
 *
 * The server-side app starts and begins listening for events.
 *
 *  @requires express
 * */
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const engines = require('consolidate');
const expressLayouts = require('express-ejs-layouts');

const LOG = require('./utils/logger');

// env variables
const hostname = process.env.HOSTNAME;
const isProduction = process.env.NODE_ENV === 'production';
LOG.info('Environment isProduction = ', isProduction);

// create an Express app
const app = express();
LOG.info('app created');

// Helper functions defined first ...................................

/**
 * Normalize a port into a number, string, or false.
 */
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
};

/**
 * Load environment variables from .env file,
 *  where API keys and passwords can be configured.
 */
const vars = dotenv.config({ path: '.env' });
if (vars.error) {
  throw vars.error;
}
LOG.info(`Environment variables loaded: ${vars.parsed}`);

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT);
app.set('port', port);
LOG.info(`Server Launch at port: ${port}`);

// By default, Express does not serve static files.
// use middleware to define a static assets folder 'public'
app.use(express.static('public'));

// Helmet helps you secure Express apps by setting various HTTP headers.
// It's not a silver bullet, but it can help!
// https://github.com/helmetjs/helmet
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', engines.ejs);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressLayouts);

// load seed data
require('./utils/seeder.js')(app);

// Use Express middleware to configure routing
const routing = require('./routes/router.js');

app.use('/', routing);

app.listen(port, hostname, () => {
  console.log(
    `App running at http://${hostname}:${port}/ in ${process.env.NODE_ENV}`,
  );
  console.log('Hit CTRL-C CTRL-C to stop\n');
});
