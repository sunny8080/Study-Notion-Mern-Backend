const express = require('express');
const router = express.Router();
const { protect, authorize, isSiteOwner } = require('../middlewares/auth');

// import controllers
const { createSubSection, updateSubSection, deleteSubSection } = require('../controllers/SubSectionC');

router.post('/', protect, authorize('Instructor'), createSubSection);
router.put('/:id', protect, authorize('Instructor'), updateSubSection);
router.delete('/:id', protect, authorize('Instructor'), deleteSubSection);

module.exports = router;
