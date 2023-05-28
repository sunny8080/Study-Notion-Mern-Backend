const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
    default: null // TODO - check for null default
  },
  dob: {
    type: Date,
    default: null
  },
  about: {
    type: String,
    trim: true,
    default: null
  },
  contactNumber: {
    type: String,
    trim: true,
    default: null
  }
});

module.exports = mongoose.model('Profile', profileSchema);
