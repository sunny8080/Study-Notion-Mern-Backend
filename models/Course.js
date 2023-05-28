const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  whatYouWillLearn: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  price: {
    type: Number,
    required: true
  },
  section: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    }
  ],
  review: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  thumbnail: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      default: []
    }
  ],
  instructions: [String],
  status: {
    type: String,
    enum: ["Draft", "Published"]
  }

});

module.exports = mongoose.model('Course', courseSchema);
