const express = require('express');
const { getSavedColleges, saveCollege, removeSavedCollege } = require('../controllers/savedController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
    .get(getSavedColleges)
    .post(saveCollege);

router.route('/:id')
    .delete(removeSavedCollege);

module.exports = router;
