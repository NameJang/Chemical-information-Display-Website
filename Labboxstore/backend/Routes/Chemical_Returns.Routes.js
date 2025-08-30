const express = require ('express')
const Chemical_ReturnsConTrollers = require('../Controllers/Chemical_Returns.Controllers')
const router = express.Router()
router.get('/',Chemical_ReturnsConTrollers.GetAllData);
router.post('/Borrow', Chemical_ReturnsConTrollers.Borrow);
router.post('/Return', Chemical_ReturnsConTrollers.Return);
router.delete('/:name', Chemical_ReturnsConTrollers.deleteByname);
module.exports = router;