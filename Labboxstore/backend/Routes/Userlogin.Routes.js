const express = require('express');
const { verify , updatePassword} = require('../Controllers/Userlogin.Controllers');
const router = express.Router();

router.post('/', verify);
router.put('/', updatePassword);

module.exports = router;