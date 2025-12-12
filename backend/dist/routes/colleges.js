"use strict";
const express = require('express');
const { getColleges, getCollege } = require('../controllers/collegeController');
const router = express.Router();
router.route('/')
    .get(getColleges);
router.route('/:id')
    .get(getCollege);
module.exports = router;
