"use strict";
const express = require('express');
const { createPlan, getMyPlan } = require('../controllers/prepController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.route('/plans')
    .post(createPlan);
router.route('/plans/my')
    .get(getMyPlan);
module.exports = router;
