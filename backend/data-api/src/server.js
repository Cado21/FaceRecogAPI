const environments = require('custom-env').env();
environments.env(process.env.NODE_ENV || 'local', 'Environments/');

const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
let http = require('http');
const useragent = require('express-useragent');
const errorMiddleware = require('./middlewares/middlewareError');
const ENV = require('./helpers/env');

const Routes = require('./routes');

const app = express();
http = http.Server(app);

app.enable('trust proxy');
const connectMongo = require('./database/mongo/connections');

app.use(useragent.express());
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(cookieParser());
app.use(compression({level: 9}));
app.use(cors());

connectMongo.connectMongo()
  .then((mongoConnection) => {
    global.rootPath = __dirname;
    console.log(mongoConnection);

    app.use('/', Routes);

    app.use(errorMiddleware);

    http.listen(process.env.NODE_SERVER_PORT, () => {
      console.log(`Environtment TZ => ${process.env.TZ}`);
      console.log(`Successfully load config on => ${process.env.NODE_ENV}`);
      console.log(`Successfully connecting server on port => ${process.env.NODE_SERVER_PORT}`);
    });
  });
