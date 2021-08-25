const express = require('express'); //Framework de node para el Backend 
const app = express(); 
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const flash = require('connect-flash');
const mongoose = require('mongoose');


var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));



//IMPORT VARIBLES DE ENTORNO
require('dotenv').config({path : 'desarrollo.env'});
console.log(process.env.DB_URL);


var session = require('express-session'),
    bodyParser = require('body-parser');

// DATABASE SETTINGS.
mongoose.set('useFindAndModify', false);
const uri = process.env.DB_URL;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

//Settings 
app.set('port',  process.env.PORT || 3000); //Elige un puerto automatico o me asigna el puerto 3000 si esta disponible
app.set('host',  process.env.HOST || '0.0.0.0'); //Elige un puerto automatico o me asigna el puerto 3000 si esta disponible


//Middlewares 
app.use(morgan('dev')); //Con esto podemos ver las peticiones HTTP por la consola (GET, POST, PUT...);
app.use(express.json()); //permitimos que el servidor pueda entender todos los datos que vengan en formato Json, ya que MongoDb y Angular va a trabajar con JSON 

app.use(cors({origin:'http://localhost:3001'}));  //Sincronizamos el servidor del back en este caso 3000 de Node con el del front en este caso 4200 de Angular

//Middlewares para Passport
app.use(express.static("public"));
app.use(session({
    secret: "amine",
    resave: false,
    saveUninitialized:false
}));
app.use(bodyParser.urlencoded({extended:false}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next) => {
    app.locals.signUpError = req.flash('signUpError');
    next();
});
require('./config/passport');

//ROUTES 
app.use('/api/user', require('./routes/authenticateRoutes/athenticate.user.routes'));
app.use('/api/user', require('./routes/userRoutes/user.routes'));
app.use('/api/comunidades', require('./routes/accionesRoutes/comunidad.routes'));
app.use('/api/jugadores',require('./routes/accionesRoutes/jugador.routes'));
app.use('/api/equipo',require('./routes/teamRoutes/team.routes'));
app.use('/api/offers',require('./routes/offersRoutes/offer.routes'));
app.use('/api/notice',require('./routes/noticeRoutes/notice.routes'));
app.use('/api/admin',require('./routes/adminRoutes/admin.routes'));

app.get('/', (req,res) => {
    res.send('La aplicacion de Backend se ha arrancado correctamente');
})

//Starting the Server


app.listen(process.env.PORT || 3000, () => {
    console.log(`Server Working`);

})