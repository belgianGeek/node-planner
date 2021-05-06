const fs = require('fs-extra');
const randomBytes = require('crypto').randomBytes;
const express = require('express');
const app = express();
const ip = require('ip');
const cp = require('child_process').exec;
const path = require('path');
const os = require('os');

const server = require('http').Server(app);
const io = require('socket.io')(server);

const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const methodOverride = require('method-override');

server.listen(8000);

const Pool = require('pg').Pool;

let config = {
  user: 'postgres',
  database: 'postgres',
  host: 'localhost'
};
const initClient = new Pool(config);

// Define a variable to store the settings retrieved from the DB
let settings = {};

app.tag = '0.1.0';

const exportDB = require('./modules/exportDB');
const getUsers = require('./modules/getUsers');
const existPath = require('./modules/existPath');

const i18n = require('i18n');
i18n.configure({
  autoReload: true,
  locales: ['en', 'fr'],
  directory: path.join(__dirname, '/locales'),
  defaultLocale: 'fr',
  objectNotation: true,
  queryParameter: 'lang',
  updateFiles: false
});

const createLocationsTable = require('./modules/createLocationsTable');
const createSessionTable = require('./modules/createSessionTable');
const createTasksTable = require('./modules/createTasksTable');
const createUsersTable = require('./modules/createUsersTable');

const createDB = (config, DBname = 'planner') => {
  const createTables = () => {
    console.log(`Base de données ${DBname} créée avec succès, création des tables en cours...`);
    app.pool = new Pool(config);

    // Tables have to be created in this exact order to avoid errors when assigning foreign key constraints
    app.pool.connect()
      .then(() => {
        createLocationsTable(app.pool)
        .then(res => {
          console.log(res);

          createUsersTable(app.pool)
          .then(res => {
            console.log(res);

            getUsers(app, passport);

            createTasksTable(app.pool)
            .then(res => {
              console.log(res);
              console.log(`Tu peux te connecter à Open Planner ici : http://${ip.address()}:8000.`);
            });
          })
          .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
      })
      .catch(err => {
        console.trace(`Pool connection error : ${err}`);
      });
  }

  const reconnect = () => {
    // Disconnect from the 'postgres' DB and connect to the newly created 'node-planner' DB
    config.database = 'planner';

    initClient
      .end()
      .catch(err => console.error('Une erreur est survenue lors de la tentative de reconnexion à la base de données', err));
  }

  console.log(`Création de la base de données ${DBname}...`);
  initClient.query(`CREATE DATABASE ${DBname} WITH ENCODING = 'UTF-8'`)
    .then(res => {
      reconnect();

      createTables();
    })
    .catch(err => {
      if (!err.message.match('exist')) {
        console.error(`Erreur lors de la création de la base de données ${DBname} : ${err}`);
      } else {
        console.log(`La base de données ${DBname} existe déjà !`);
        reconnect();
        createTables();
      }
    });
}

existPath('./backups/');
existPath('./exports/');
existPath('./templates/');

// Exporter une sauvegarde de la DB toutes les douze heures
setInterval(() => {
  console.log('DB backup on ' + Date.now());
  exportDB(`./backups/planner_${Date.now()}.pgsql`);
}, 12 * 60 * 60 * 1000);


// Define a variable to store a file to download when exporting DB
app.file2download = {};

initClient.connect()
  .then(() => {
    if (!ip.address().match(/169.254/) || !ip.address().match(/127.0/)) {
      // Check if the 'session' table exist before doing anything else
      createSessionTable(initClient);

      createDB(config);
    } else {
      console.log(`Désolé, il semble que tu n'aies pas accès à Internet... Rétablis ta connexion et réessaie :-)`);
    }
  })
  .catch(err => {
    console.log(`Initial Pool connection error : ${err}`);
    if (err.code === 'ECONNREFUSED') {
      console.log('Désolé, la connexion à la base de données n\'a pas pu être établie...\n' +
        'Vérifie que le service PostgreSQL est bien démarré et relance Node Planner.');
    }
    return;
  });

app.set('view engine', 'ejs');
app.use("/locales", express.static(__dirname + "/locales"));
app.use("/src", express.static(__dirname + "/src"));
app.use(express.urlencoded({
  extended: false
}));
app.use(flash());
app.use(session({
  store: new pgSession({
    pool: app.pool,
    conString: `postgresql://${config.user}@${config.host}:5432/${config.database}`
  }),
  secret: randomBytes(256).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 30 * 30 // Set the session lifetime to thirty minutes
  }
}));

app.use(i18n.init);

app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));

require('./routes/createDB')(app, io);
require('./routes/download')(app, io);
require('./routes/home')(app, io);
require('./routes/login')(app, io);
require('./routes/logout')(app, io);
require('./routes/search')(app, io);
require('./routes/template')(app, io);
require('./routes/upload')(app, io);
require('./routes/notFound')(app, io);

module.exports = app;
