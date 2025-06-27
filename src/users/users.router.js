const router = require('express').Router();
const userServices = require('./users.services');
const passportJwt = require('../middlewares/auth.middleware');
const upload = require('../utils/multer');
const multerErrorHandler = require('../middlewares/multerErrorHandler');
const { uploadImage } = require('../utils/cloudinary');

// Rutas públicas
router.route('/')
  .get(userServices.getAllUsers)
  .post(
    upload.single('profileImage'),
    async (req, res) => {
      try {
        const file = req.file;
        let profileImageUrl = null;
        
        if (file) {
          const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          profileImageUrl = await uploadImage(fileStr);
        }

        const newUser = await userServices.postNewUser({ 
          ...req.body,
          profileImage: profileImageUrl
        }, req.file);
        
        res.status(201).json(newUser);
      } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ 
          message: error.message || 'Error al procesar la solicitud'
        });
      }
    }
  );

// Rutas protegidas (requieren autenticación JWT)
router.use(passportJwt);

router.route('/me')
  .get(userServices.getMyUser)
  .patch(
    upload.single('profileImage'),
    multerErrorHandler,
    userServices.patchMyUser
  )
  .delete(userServices.deleteMyUser);

// Rutas de administración (requieren autenticación)
router.route('/:id')
  .get(userServices.getUserById)
  .patch(
    upload.single('profileImage'),
    multerErrorHandler,
    userServices.patchUser
  )
  .delete(userServices.deleteUser);

module.exports = router;