const router = require('express').Router();
const adminController = require('../controllers/admin.controller.js');
const auth = require('../middlewares/admin.middleware.js');

router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.get('/getProfile', auth, adminController.getProfile);
router.patch('/updatePaymentDetails', auth, adminController.updatePaymentDetails);
router.post('/addSlots', auth, adminController.createSlot);
router.get('/getSlots', auth, adminController.getSlots);
router.post('/getSlot/:id', auth, adminController.getSlot);
router.patch('/updateSlot', auth, adminController.updateSlot);
router.delete('/deleteSlot', auth, adminController.deleteSlot);
router.get('/getUsers', auth, adminController.allUsers);
router.get('/getUser', auth, adminController.getUser);

module.exports = router;