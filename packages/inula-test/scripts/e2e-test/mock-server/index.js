const express = require('express');
const app = express();
const path = require('path');

const rootFolder = `../build`;
app.use(express.static(path.join(__dirname, rootFolder)));

app.get('/', function (req, res) {
  if (req.path === '/') {
    res.status(200).end();
  }
  res.sendFile(path.join(__dirname, rootFolder));
});

const port = 3000;
app.listen(port, () => {
  console.log(`mock server listening on port ${port}.`);
  console.log(`visit http://localhost:${port}/react.html for test cases create`);
  console.log(`visit http://localhost:${port}/horizon.html for horizon e2e test`);
});
