var http = require('http');
const path = process.cwd();
const express = require('express');
const mongoose = require('mongoose');

var app = express();
require('dotenv').load();

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
  if(validateUrl(req.params['url'] + req.params[0])) {
  const urlToBeSaved = new Url({ original_url: req.params['url'] + req.params[0], short_url: short });
  urlToBeSaved.save(function (err, url) {
    if (err) return console.error(err);
    if(url) {
      console.log(url.short_url);
      const finalPrint = {original_url: url.original_url, short_url: url.short_url};
      res.send(finalPrint);
    }
  });
  } else {
    res.send({error: "Wrong url format, make sure you have a valid protocol and real site."});
  }
}); 


const validateUrl = (url) => {
  const regex = /^http(s)?:\/\/(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
  return regex.test(url);
};

const func = (short_url, callback) => {
    Url.findOne({'short_url': short_url}, (err, doc) => {
      if(err) console.log(err);
      if (doc !== null) {
       callback(null, doc);
      }
    });
}

app.get('/:url', (req, res) => {
  const currentUrl = `https://${req.headers.host}/${req.params.url}`;
  func(currentUrl, (err, url) => {
    if(err) return err;
    res.redirect(url.original_url);
  });
});
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log('Running on port ' + app.port)
});
