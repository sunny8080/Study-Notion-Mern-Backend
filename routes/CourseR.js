const express = require('express');
const router = express.Router();
const { protect, authorize, isSiteOwner } = require('../middlewares/auth');

// import controllers
const { getAllPublishedCourses, getCourse, getReviewsOfCourse, createCourse, publishCourse } = require('../controllers/CourseC');

router.route('/').get(getAllPublishedCourses).post(protect, authorize('Instructor'), createCourse);

router.get('/:id', getCourse);
router.get('/:courseId/reviews', getReviewsOfCourse);

router.put('/publishcourse/:courseId', protect, authorize('Instructor'), publishCourse);

module.exports = router;
