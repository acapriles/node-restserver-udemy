//======================
// Puerto
//======================
process.env.PORT = process.env.PORT || 3000;


//======================
// Entorno
//======================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


//======================
// Vencimiento del Token
//======================
process.env.CADUCIDAD_TOKEN = '30d';


//======================
// SEED de autenticación
//======================
// Esta variable se definio en Heroku a través de consola. Video 122
// heroku config:set SEED="este-es-el-seed-produccion"
// Listar las variables creadas --> heroku config
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//======================
// Base de datos
//======================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI //Esta variable se definio en Heroku a través de consola
}

process.env.URL_DB = urlDB;


//======================
// Google Client ID
//======================
process.env.CLIENT_ID = process.env.CLIENT_ID || '195893416810-g4l2fdphe01e79nogn72nbicfc91gghp.apps.googleusercontent.com'