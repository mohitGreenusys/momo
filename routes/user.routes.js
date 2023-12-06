const router = require('express').Router();
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/user.middleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);
router.get('/slots', auth, userController.getSlots);
router.post('/bookSlot', auth, userController.bookSlot);
router.post('/confirm', auth, userController.confirmSlot);
router.post('/cancel', auth, userController.cancelSlot);
router.get('/myBookings', auth, userController.myBookings);

module.exports = router;