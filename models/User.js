const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ["Admin", "Student", "Instructor"],
      required: true
    },
    avatar: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    },
    approved: {
      type: Boolean,
      default: true
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: [] // TODO - check for default
      },
    ],
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseProgress'
      }
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
      }
    ],
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    token: String, // TODO - check if we can remove these 5 fields
    resetPasswordToken: String,
    resetPasswordExpire: String,
    confirmEmailToken: String,
    confirmEmailExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
