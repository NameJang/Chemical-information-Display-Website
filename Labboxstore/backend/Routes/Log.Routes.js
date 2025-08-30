const express = require ('express')
const LogConTrollers = require('../Controllers/Log.Controllers')
const router = express.Router()
router.get('/',LogConTrollers.GetAllData);
router.post('/', LogConTrollers.InsertData);
router.delete('/:name', LogConTrollers.DeleteByname);

module.exports = router;