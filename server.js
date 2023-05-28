const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const clgDev = require('./utils/clgDev');

dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 4000;
const app = express();
connectDB();


// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.get('/', (req, res) => {
  res.send("Hello ji");
})

app.listen(PORT, (err) => {
  if (err) {
    clgDev("Error occurred creating server");
    process.exit();
  }
  clgDev(`Server in running on ${PORT}`.yellow.underline.bold);
})

