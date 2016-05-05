var http = require('http');
const path = process.cwd();
const express = require('express');
const mongoose = require('mongoose');

var app = express();
var server = http.createServer(app);
require('dotenv').load();
// app.use(express.static(path.resolve(__dirname, 'client')));
mongoose.connect(process.env.MONGO_URI);
var db = mongoose.connection;

var urlSchema = mongoose.Schema({
    original_url: String,
    short_url: String
});

var Url = mongoose.model('Url', urlSchema);





app.get('/', (req, res) => {
  res.send({'GoHome': 'You are drunk?'})
});

app.get('/new/:url*', (req, res) => {
  const short = `https://${req.headers.host}/${Math.round(Math.random() * 10000)}`;
  const urlToBeSaved = new Url({ original_url: req.params['url'] + req.params[0], short_url: short });
  urlToBeSaved.save(function (err, url) {
    if (err) return console.error(err);
    if(url) {
      console.log(url.short_url);
      const finalPrint = {original_url: url.original_url, short_url: url.short_url};
      res.send(finalPrint);
    }
  });
}); 


const func = (short_url, cb) => {
  // console.log(short_url);
    db.collection('urls')
    .findOne({ 
        short_url: short_url
      }, (err, doc) => {
        if(err) console.log(err);
        if(doc) {
          console.log(doc);
          cb(doc);
          db.close();  
        }
    });
    // console.log(urlArr.original_url);
    
};

app.get('/:url', (req, res) => {
  const cb = (url) => { res.redirect(url.original_url) };
  func('https://'+req.headers.host+'/'+req.params.url, cb);
  // func(req.params.url, cb);
  // res.send(req.params.url);
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
