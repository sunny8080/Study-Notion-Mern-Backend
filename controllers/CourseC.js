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
// @access    Public // VERIFIED
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'instructor',
        populate: {
          path: 'profile',
        },
      })
      .populate('category')
      .populate('reviews')
      .populate({
        path: 'sections',
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
    const course = await Course.findById(req.params.courseId).populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'firstName lastName email avatar',
      },
    });

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

// TODO - deal with array of tags, whatYouWillLearn, and instructions
// @desc      Create Course
// @route     POST /api/v1/courses
// @access    Private/instructor
exports.createCourse = async (req, res, next) => {
  try {
    const instructorId = req.user.id;
    const { title, description, whatYouWillLearn, price, category, instructions } = req.body;

    if (!(title && description && whatYouWillLearn && instructorId && price && category && instructions && req.files && req.files.file && req.body.tags)) {
      return next(new ErrorResponse('All fields are mandatory', 404));
    }

    const thumbnail = req.files.file;
    const tags = req.body.tags.split(', ');

    // check if category is a valid category
    const categoryDetails = await Category.findOne({ name: category });
    if (!categoryDetails) {
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
    const image = await cloudUploader(thumbnail, process.env.THUMBNAIL_FOLDER_NAME, 200, 80);

    // create course
    const courseDetails = await Course.create({
      title,
      description,
      instructor: instructorId,
      whatYouWillLearn,
      price,
      category: categoryDetails._id,
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
      categoryDetails._id,
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

// TODO - verify working
// @desc      Create Course
// @route     PUT /api/v1/courses/publishcourse/:courseId
// @access    Private/instructor
exports.publishCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.courseId);
    if (!course) {
      return next(new ErrorResponse('No such course found', 404));
    }

    if (course.instructor.toString() !== req.user.id) {
      return next(new ErrorResponse('User not authorized', 403));
    }

    course = await Course.findByIdAndUpdate(
      course._id,
      {
        status: 'Published',
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to publish course', 500));
  }
};
