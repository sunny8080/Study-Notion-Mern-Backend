const Category = require('../models/Category');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}, { name: true, description: true });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to fetching all categories', 500));
  }
};

// @desc      Get all courses of a category [+ other courses + top 10 selling courses]
// @route     GET /api/v1/categories/:categoryId/courses
// @access    Public
exports.getAllCategoryCourses = async (req, res, next) => {
  try {
    // Get request category courses
    const categoryId = req.params.categoryId;
    const requestedCategory = await Category.findById(categoryId).populate('courses').exec();

    if (!requestedCategory) {
      return next(new ErrorResponse('No such category found', 404));
    }

    // Get courses for other categories
    const otherCategory = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate('courses')
      .exec();

    // Get top 10 selling courses
    const topSellingCourses = await Course.find({})
      .sort({
        numberOfEnrolledStudents: 'desc',
      })
      .populate({
        path: 'Category',
        select: 'name',
      })
      .limit(10);

    res.status(200).json({
      success: true,
      data: [requestedCategory, otherCategory, topSellingCourses],
    });
  } catch (err) {
    next(new ErrorResponse('Failed to fetching all category courses. Please try again', 500));
  }
};

// @desc      Create a category
// @route     POST /api/v1/categories
// @access    Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return next(new ErrorResponse('Please add category name', 400));
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to create category', 500));
  }
};
