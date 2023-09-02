const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/index');

const app = express();
const port = parseInt(process.env.PORT, 10) || 5000;

app.use(bodyParser());
app.use(router);

app.listen(port, 'localhost', () => {
  console.log(`server running on port ${port}`);
});
