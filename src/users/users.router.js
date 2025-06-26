const router = require('express').Router()
const userServices = require('./users.services')
const passportJwt = require('../middlewares/auth.middleware')
const upload = require('../utils/multer') // Assuming you have a multer configuration file

router.get('/', userServices.getAllUsers)
router.post('/', upload.single('profileImage'), userServices.postNewUser)

// Protected routes (require authentication)
router.get('/me', passportJwt, userServices.getMyUser)
router.patch('/me', passportJwt, upload.single('profileImage'), userServices.patchMyUser)
router.delete('/me', passportJwt, userServices.deleteMyUser)

// Admin routes (could add admin middleware later)
router.get('/:id', passportJwt, userServices.getUserById)
router.patch('/:id', passportJwt, upload.single('profileImage'), userServices.patchUser)
router.delete('/:id', passportJwt, userServices.deleteUser)

module.exports = router