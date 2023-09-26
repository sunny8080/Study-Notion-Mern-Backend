const express = require('express');
const router = express.Router();
const { protect, authorize, isSiteOwner } = require('../middlewares/auth');

// import controllers
const { getAllCategories, getAllCategoryCourses, createCategory } = require('../controllers/CategoryC');

router.get('/', getAllCategories);
router.post('/getcategorycourses', getAllCategoryCourses);
router.post('/', protect, authorize('Admin'), createCategory);

module.exports = router;
