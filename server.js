const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const connectDB = require('./config/database');
const clgDev = require('./utils/clgDev');
const errorHandler = require('./middlewares/errorHandler');
const path = require('path');


dotenv.config({ path: './config/config.env' });
const PORT = process.env.PORT || 4000;
const app = express();
connectDB();


// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(errorHandler);
app.use(express.json());
app.use(fileUpload());
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


// Mount routes


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


// TODO : check for these, what it is
/**
 * // handle unhandled promise rejection
 * process.on("unhandledRejection", (err, promise) => {
 *  clgDev(`Error : ${err.message}`.red);
 *  // close server & exit process
 *  server.close(()=>process.exit(1));
 * });
 */
