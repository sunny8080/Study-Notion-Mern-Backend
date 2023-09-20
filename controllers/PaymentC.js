const Course = require('../models/Course');
const User = require('../models/User');
const clgDev = require('../utils/clgDev');
const ErrorResponse = require('../utils/ErrorResponse');
const emailSender = require('../utils/emailSender');
const courseEnrollmentEmailTemplate = require('../mail/templates/courseEnrollmentEmailTemplate');
const mongoose = require('mongoose');
const razorpayInstance = require('../config/razorpay');
const cryptos = require('crypto');
const CourseProgress = require('../models/CourseProgress');

// TODO - All payments related routes, controllers are not sure, it will done in later time

// @desc      Capture the payment and create the Razorpay order
// @route     POST /api/v1/payments/capturepayment
// @access    Private/Student
exports.capturePayment = async (req, res, next) => {
  try {
    const { courseId } = req.user.id;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (!courseId) {
      return next(new ErrorResponse('Please enter a valid course ID', 404));
    }

    // check if course exist or not
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new ErrorResponse('Could not find the course, please enter vaild course details', 404));
    }

    // check if user already paid for this course
    if (course.studentsEnrolled.includes(userId)) {
      return next(new ErrorResponse('Student is already enrolled', 404));
    }

    // Create order
    try {
      const options = {
        amount: course.price * 100,
        currency: 'INR',
        receipt: `${userId}.${Date.now()}`,
        notes: {
          courseId,
          userId,
        },
      };

      // Initiate the payment using razorpay
      const paymentResponse = await razorpayInstance.orders.create(options);

      return res.status(200).json({
        success: true,
        courseTitle: course.title,
        courseDescription: course.description,
        courseThumbnail: course.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (err) {
      return next(new ErrorResponse('Could not create order. Please try again', 500));
    }
  } catch (err) {
    next(new ErrorResponse('Failed to create order. Please try again', 500));
  }
};

// @desc      Verify signature of Razorpay and server
// @route     POST /api/v1/payments/verifysignature
// @access    Private/Student
exports.verifySignature = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return next(new ErrorResponse('Some fields are missing', 404));
    }

    const shasum = crypto.createHmace('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    // verify signature
    if (signature !== digest) {
      return next(new ErrorResponse('Invalid request', 400));
    }

    // Fulfill the action
    const { courseId, userId } = req.body.payload.payment.entity.notes;
    addCourse(res, courseId, userId);
  } catch (err) {
    next(new ErrorResponse('Failed to verify signature', 500));
  }
};


// Add a course to Student courses array
const addCourse = async (res, courseId, userId) => {
  // Find the course and enroll the student in it
  if (!(courseId && userId)) {
    return next(new ErrorResponse('Invalid request', 404));
  }

  // update course
  const enrolledCourse = await Course.findOneAndUpdate(
    { _id: courseId },
    {
      $push: { studentsEnrolled: userId },
      $inc: { numberOfEnrolledStudents: 1 },
    },
    { new: true }
  );

  if (!enrolledCourse) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // update student - enroll the student
  const enrolledUser = await User.findOneAndUpdate(
    { _id: userId },
    {
      $push: { courses: courseId },
    },
    { new: true }
  );

  if (!enrolledUser) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Create a courseProgress 
  const courseProgress = await CourseProgress.create({
    courseId,
    userId
  })

  // Send course enrollment mail to user
  try {
    const emailResponse = await emailSender(enrolledUser.email, 'Congratulations for buying new course from StudyNotion', courseEnrollmentEmailTemplate(enrolledCourse.title, enrolledUser.firstName));

    res.status(200).json({
      success: true,
      data: 'Course added to user',
    });
  } catch (err) {
    res.status(200).json({
      success: true,
      data: 'Course added to user, but failed to send course enrollment email',
    });
  }
};





// TODO - remove it
// @desc      Add a course to Student courses array
// @route     POST /api/v1/payments/adddirectcourse
// @access    Private/Student
exports.addDirectCourse = async (req, res, next) => {
  const { courseId, userId } = req.body;

  // Find the course and enroll the student in it
  if (!(courseId && userId)) {
    return next(new ErrorResponse('Invalid request', 404));
  }

  // update course
  const enrolledCourse = await Course.findOneAndUpdate(
    { _id: courseId },
    {
      $push: { studentsEnrolled: userId },
      $inc: { numberOfEnrolledStudents: 1 },
    },
    { new: true }
  );

  if (!enrolledCourse) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // update student - enroll the student
  const enrolledUser = await User.findOneAndUpdate(
    { _id: userId },
    {
      $push: { courses: courseId },
    },
    { new: true }
  );

  if (!enrolledUser) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Create a courseProgress 
  const courseProgress = await CourseProgress.create({
    courseId,
    userId
  })

  // Send course enrollment mail to user
  try {
    const emailResponse = await emailSender(enrolledUser.email, 'Congratulations for buying new course from StudyNotion', courseEnrollmentEmailTemplate(enrolledCourse.title, enrolledUser.firstName));

    res.status(200).json({
      success: true,
      data: 'Course added to user',
    });
  } catch (err) {
    res.status(200).json({
      success: true,
      data: 'Course added to user, but failed to send course enrollment email',
    });
  }
};
