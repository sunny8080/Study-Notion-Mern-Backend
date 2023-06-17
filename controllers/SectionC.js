const Section = require('../models/Section');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/ErrorResponse');
const clgDev = require('../utils/clgDev');

// @desc      Create a section
// @route     POST /api/v1/sections
// @access    Private/instructor  // VERIFIED
exports.createSection = async (req, res, next) => {
  try {
    const { title, course } = req.body;

    if (!(title && course)) {
      return next(new ErrorResponse('Some fields are missing', 404));
    }

    const courseDetails = await Course.findById(course);
    if (!courseDetails) {
      return next(new ErrorResponse('No such course found', 404));
    }

    // only instructor of course can add section in course
    if (req.user.id !== courseDetails.instructor.toString()) {
      return next(new ErrorResponse('User not authorized', 404));
    }

    const section = await Section.create({ title, course, user: req.user.id });

    // update course
    await Course.findByIdAndUpdate(
      course,
      {
        $push: { sections: section._id },
      },
      { new: true }
    ).exec();

    res.status(201).json({
      success: true,
      data: section,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to create section. Please try again', 500));
  }
};

// @desc      Update a section
// @route     PUT /api/v1/sections/:id
// @access    Private/instructor // VERIFIED
exports.updateSection = async (req, res, next) => {
  try {
    let section = await Section.findById(req.params.id);

    if (!section) {
      return next(new ErrorResponse('No such section found', 404));
    }

    // only section creator (instructor) can update section
    if (section.user.toString() !== req.user.id) {
      return next(new ErrorResponse('User not authorized to do this task', 404));
    }

    const { title } = req.body;
    section = await Section.findByIdAndUpdate(
      req.params.id,
      { title },
      {
        // runValidators: true,
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to update section. Please try again', 500));
  }
};

// @desc      Delete a section
// @route     DELETE /api/v1/sections/:id
// @access    Private/instructor // VERIFIED
exports.deleteSection = async (req, res, next) => {
  try {
    let section = await Section.findById(req.params.id);

    if (!section) {
      return next(new ErrorResponse('No such section found', 404));
    }

    if (section.user.toString() !== req.user.id) {
      return next(new ErrorResponse('User not authorized to do this task', 404));
    }

    // update course
    await Course.findByIdAndUpdate(
      section.course,
      {
        $pull: { sections: section._id },
      },
      { new: true }
    );

    // await Section.findByIdAndDelete(req.params.id);
    await section.deleteOne();

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to delete section. Please try again', 500));
  }
};
