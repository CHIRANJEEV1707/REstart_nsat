const express = require('express');
const { getExams, getExam } = require('../controllers/examController');

const router = express.Router();

router.route('/')
    .get(getExams);

router.route('/:id')
    .get(getExam);

module.exports = router;
