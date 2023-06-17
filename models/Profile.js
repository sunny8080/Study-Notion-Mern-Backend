const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
    enum: ['male', 'female', 'others', null],
    default: null,
  },
  dob: {
    type: Date,
    default: null,
  },
  about: {
    type: String,
    trim: true,
    default: null,
  },
  contactNumber: {
    type: String,
    minLength: [10, 'Please provide a valid 10 digit phone number'],
    trim: true,
  },
});

module.exports = mongoose.model('Profile', profileSchema);
