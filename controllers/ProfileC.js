const Profile = require('../models/Profile');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc      Update profile of a user
// @route     PUT /api/v1/profiles
// @access    Private
exports.updateProfile = async (req, res) => {
  try {
    const { gender, dob, about, contactNumber } = req.body;
    const user = await User.findById(req.user.id);
    const profile = await Profile.findByIdAndUpdate(
      user.profile,
      {
        gender,
        dob,
        about,
        contactNumber,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(new ErrorResponse('Failed to update profile', 500));
  }
};
