var express = require('express')
// const data = require("./model/videos"); //llamamos a Express
var app = express();
const axios = require('axios');
const bodyParser = require('body-parser'),    
      jwt = require('jsonwebtoken'),
      config = require('./configs/config');
var api_key_youtube = 'AIzaSyDhkPErWyr2ABBy_OeqjMhasYXIVKnLXHY';

//enable CORS for request verbs
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access-token");
    res.header("Access-Control-Allow-Methods","POST, GET, PUT, DELETE, OPTIONS");
    res.header("Cache-Control: no-cache, no-store, must-revalidate");
    res.header("Pragma: no-cache");
    next();
});

app.set('llave', config.llave);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.post('/autenticar', (req, res) => {
    if(req.body.usuario === "asfo" && req.body.contrasena === "holamundo") {
  const payload = {
   check:  true
  };
  const token = jwt.sign(payload, app.get('llave'), {
   expiresIn: 1440
  });
  res.json({
   mensaje: 'Autenticación correcta',
   token: token
  });
    } else {
        res.json({ mensaje: "Usuario o contraseña incorrectos"})
    }
})

const rutasProtegidas = express.Router(); 
rutasProtegidas.use((req, res, next) => {
    const token = req.headers['access-token'];
 
    if (token) {
      jwt.verify(token, app.get('llave'), (err, decoded) => {      
        if (err) {
          return res.json({ mensaje: 'Token inválida' });    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      res.send({ 
          mensaje: 'Token no proveída.' 
      });
    }
 });

app.use(express.static(__dirname+'/public'));

app.get('/videos', rutasProtegidas, function(req, res) {
    let busqueda = req.query.busqueda;
    if(busqueda!=''){
      var uri = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q='+busqueda+'&key='+api_key_youtube
    }else{
      var uri = 'https://www.googleapis.com/youtube/v3/search?part=snippet&key='+api_key_youtube
    }
    axios.get(uri)
      .then(response => {
        if(response.data.items){
            let data = response.data.items;
            // console.log(data);
            // const filters = busqueda;
            // const filteredUsers = data.filter(user => {
            // let isValid = true;
            // for (key in filters) {
            //     console.log(key, user[key], filters[key]);
            //     isValid = isValid && user[key] == filters[key];
            // }
            // return isValid;
        // });
          console.log(response.data);
          res.send(data);
        }else{
          console.log(data.error);
          res.send(data.error);
        }
      })
      .catch(error => {
          console.log(error);
      });
    
    

})
var port = process.env.PORT || 8080  // establecemos nuestro puerto

// iniciamos nuestro servidor
app.listen(port)
console.log('API escuchando en el puerto ' + port)