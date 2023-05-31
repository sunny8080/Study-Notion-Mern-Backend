const express = require('express');
const router = express.Router();
const { protect, authorize, isSiteOwner } = require('../middlewares/auth');

// import controllers
const { getAllCategories, getAllCategoryCourses, createCategory } = require('../controllers/CategoryC');

router.get('/', getAllCategories);
router.get('/:categoryId/courses', getAllCategoryCourses);
router.post('/', authorize('Admin'), createCategory);

module.exports = router;
