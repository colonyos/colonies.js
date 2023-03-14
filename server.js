var express = require('express');
var app = express();

app.use(express.static('public'));

console.log("starting")
var server = app.listen(1111);
