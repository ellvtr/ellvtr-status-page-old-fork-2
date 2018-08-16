const fs = require('fs'),
      express = require('express'),
      cors = require('cors');

const app = express(),
      port = 4567;

const app2 = express(),
      port2 = 3000;

// Allow all cors (cross domain requests):
app.use(cors());
app.get('/info', (req, res) => {
  res.sendFile('network-info.json', { root: __dirname + '/data/' });
});
app.listen(port, f=>{ console.log(`app listening on path '/info' on port ${port}`) });
/*
// Create another mock endpoint at this port and path:
app2.use(cors());
// app2.get('/data', (req, res) => {
app2.all('/data', (req, res) => {
  res.sendFile('graphics-data.json', { root: __dirname + '/data/' });
});
app2.listen(port2, f=>{ console.log(`app listening on path '/data' on port ${port2}`) });
*/