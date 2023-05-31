const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const cloudUploader = require('../utils/cloudUploader');
const clgDev = require('../utils/clgDev');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc      Get all published courses
// @route     GET /api/v1/courses
// @access    Public
exports.getAllPublishedCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ status: 'Published' }).populate('instructor').exec();

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to fetch all published courses', 500));
  }
};

// @desc      Get single courses
// @route     GET /api/v1/courses/:id
// @access    Public
exports.getCourse = async (req, res, next) => {
  try {
    // TODO - verify double populate
    const course = await Course.findById(id)
      .populate({
        path: 'instructor',
        populate: {
          path: 'profile',
        },
      })
      .populate('category')
      .populate('reviews')
      .populate({
        path: 'section',
        populate: {
          path: 'subSection',
        },
      })
      .exec();

    if (!course) {
      return next(new ErrorResponse('No such course found', 404));
    }

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to fetching course', 500));
  }
};

// @desc      Get all reviews of a course
// @route     GET /api/v1/courses/:courseId/reviews
// @access    Public
exports.getReviewsOfCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate({
        path: 'reviews', // TODO - verify
        populate: {
          path: 'user',
          select: 'firstName lastName email avatar',
        },
      })
      .populate('course');

    if (!course) {
      return next(new ErrorResponse('No such course found', 404));
    }

    return res.status(200).json({
      success: true,
      count: course.reviews.length,
      data: course.reviews,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to fetching Reviews. Please try again'));
  }
};

// @desc      Create Course
// @route     POST /api/v1/courses
// @access    Private/instructor
exports.createCourse = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const { title, description, whatYouWillLearn, price, category, instructions } = req.body;

    const thumbnail = req.files.file;
    const tags = req.body.tags.split(',');

    if (!(title && description && whatYouWillLearn && instructorId && price && tags && thumbnail && category)) {
      return next(new ErrorResponse('All fields are mandatory', 404));
    }

    // check if category is a valid category
    if (!(await Category.findById(category))) {
      return next(new ErrorResponse('No such category found', 404));
    }

    // valid and upload thumbnail
    if (thumbnail.size > process.env.THUMBNAIL_MAX_SIZE) {
      return next(new ErrorResponse(`Please upload a image less than ${process.env.THUMBNAIL_MAX_SIZE / 1024} KB`, 400));
    }

    if (!thumbnail.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload a image file', 400));
    }

    const allowedFileType = ['jpeg', 'jpg'];
    const thumbnailType = thumbnail.mimetype.split('/')[1];

    if (!allowedFileType.includes(thumbnailType)) {
      return next(new ErrorResponse('Please upload a valid image file', 400));
    }

    thumbnail.name = `thumbnail_${instructorId}_${Date.now()}`;
    const image = await cloudUploader(thumbnail, process.env.THUMBNAIL_FOLDER_NAME, 1000, 80);

    // create course
    const courseDetails = await Course.create({
      title,
      description,
      instructor: instructorId,
      whatYouWillLearn,
      price,
      category,
      instructions,
      thumbnail: image.secure_url,
      tags,
    });

    // update user
    await User.findByIdAndUpdate(
      instructorId,
      {
        $push: { courses: courseDetails._id },
      },
      { new: true }
    );

    // update category
    await Category.findByIdAndUpdate(
      category,
      {
        $push: { courses: courseDetails._id },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: courseDetails,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to create course', 500));
  }
};
