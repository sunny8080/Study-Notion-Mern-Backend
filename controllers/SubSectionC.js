const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const ErrorResponse = require('../utils/ErrorResponse');
const clgDev = require('../utils/clgDev');
const cloudUploader = require('../utils/cloudUploader');

// @desc      Create a subsection
// @route     POST /api/v1/subsections
// @access    Private/instructor
exports.createSubSection = async (req, res, next) => {
  try {
    const { title, timeDuration, description, section } = req.body;
    const userId = req.user.id;

    if (!(title && timeDuration && section && req.files && req.files.file)) {
      return next(new ErrorResponse('Some fields are missing', 404));
    }

    const video = req.files.file;

    // check section is present or not
    if (!(await Section.findById(section))) {
      return next(new ErrorResponse('No such section found', 404));
    }

    // upload video
    if (video.size > process.env.VIDEO_MAX_SIZE) {
      return next(new ErrorResponse(`Please upload a video less than ${process.env.VIDEO_MAX_SIZE / (1024 * 1024)} MB`, 400));
    }

    if (!video.mimetype.startsWith('video')) {
      return next(new ErrorResponse('Please upload a video file', 400));
    }

    const allowedFileType = ['mp4', 'mkv'];
    const videoType = video.mimetype.split('/')[1];

    if (!allowedFileType.includes(videoType)) {
      return next(new ErrorResponse('Please upload a valid image file', 400));
    }

    video.name = `vid_${req.user.id}_${Date.now()}.${videoType}`;
    const videoDetails = await cloudUploader(video, process.env.VIDEO_FOLDER_NAME, undefined, 75);

    // create sub section
    const subSection = await SubSection.create({
      title,
      timeDuration,
      description,
      section,
      user: userId,
      videoUrl: videoDetails.secure_url,
    });

    // update section
    await Section.findByIdAndUpdate(
      section,
      {
        $push: { subSections: subSection._id },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: subSection,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to create sub section. Please try again', 500));
  }
};

// @desc      Update a subsection
// @route     PUT /api/v1/subsections/:id
// @access    Private/instructor
exports.updateSubSection = async (req, res, next) => {
  try {
    const subSection = await SubSection.findById(req.params.id);

    if (!subSection) {
      return next(new ErrorResponse('No such subsection found', 404));
    }

    if (subSection.user.toString() !== req.user.id) {
      return next(new ErrorResponse('User is not allowed for this task', 404));
    }

    // update sub section
    const { title, timeDuration, description } = req.body;
    // TODO - we can provide features to update video

    // TODO - What will happen if title is undefined
    subSection = await Section.findByIdAndUpdate(
      subSection._id,
      {
        title,
        timeDuration,
        description,
      },
      { new: true }
    );

    // TODO - can we do it by subSection.save()

    res.status(200).json({
      success: true,
      data: subSection,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to update sub section', 500));
  }
};

// @desc      Delete a subsection
// @route     DELETE /api/v1/subsections/:id
// @access    Private/instructor
exports.deleteSubSection = async (req, res, next) => {
  try {
    const subSection = await SubSection.findById(req.params.id);

    if (!subSection) {
      return next(new ErrorResponse('No such subsection found', 404));
    }

    if (subSection.user.toString() !== req.user.id) {
      return next(new ErrorResponse('User is not allowed for this task', 404));
    }

    // update section
    await Section.findByIdAndUpdate(
      subSection.section,
      {
        $pull: { subSections: subSection._id },
      },
      { new: true }
    );

    subSection.deleteOne();

    res.status(200).json({
      success: true,
      data: 'Sub section deleted successfully',
    });
  } catch (err) {
    next(new ErrorResponse('Failed to delete sub section. Please try again', 500));
  }
};
