const express = require('express');

const dataControllers = require('../controllers/data-controller');

const router = express.Router();

router.post('/wash', dataControllers.giveWashData);

router.post('/nodejieba', dataControllers.wordCloudData);

module.exports = router;
