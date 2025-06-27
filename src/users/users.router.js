const router = require('express').Router();
const userServices = require('./users.services');
const passportJwt = require('../middlewares/auth.middleware');
const upload = require('../utils/multer');
const multerErrorHandler = require('../middlewares/multerErrorHandler'); // Nuevo middleware para errores

const multer = require('multer');





// Rutas públicas
router.route('/')
  .get(userServices.getAllUsers)
  .post(
    upload.single('profileImage'), // Middleware Multer modificado
  async (req, res) => {
    try {
      // Verificar si hay archivo
      const file = req.file;
      let profileImageUrl = null;
      
      if (file) {
        // Convertir buffer a formato que Cloudinary pueda procesar
        const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        profileImageUrl = await uploadImage(fileStr); // Usa tu función Cloudinary
      }

      const newUser = await usersControllers.createNewUser({
        ...req.body,
        profileImage: profileImageUrl
      });
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error:', error);
      res.status(400).json({ 
        message: error.message || 'Error al procesar la solicitud'
      });
    }
  }       // Controlador
  );

// Rutas protegidas (requieren autenticación JWT)
router.use(passportJwt); // Aplica autenticación JWT a todas las rutas siguientes

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