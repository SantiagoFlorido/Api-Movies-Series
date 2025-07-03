const router = require('express').Router();
const passportJwt = require('../middlewares/auth.middleware');
const moviesServices = require('./movies.services');
const { uploadMovieFiles } = require('../utils/multer'); // Importar el middleware específico para películas

// Rutas principales de películas
router.route('/')
  .get(moviesServices.getAllMovies) // Obtener todas las películas
  .post(
    passportJwt,
    uploadMovieFiles(), // Usar el middleware específico para películas
    moviesServices.postNewMovie
  ); // Crear nueva película

// Rutas para película específica
router.route('/:id')
  .get(moviesServices.getMovieById) // Obtener película por ID
  .patch(
    passportJwt,
    uploadMovieFiles(), // Usar el mismo middleware para actualizar
    moviesServices.patchMovie
  ) // Actualizar película
  .delete(passportJwt, moviesServices.deleteMovie); // Eliminar película

// Rutas para gestión de géneros
router.route('/:id/genres')
  .post(passportJwt, moviesServices.postGenreToMovie); // Añadir género a película

router.route('/:id/genres/:genreId')
  .delete(passportJwt, moviesServices.deleteGenreFromMovie); // Eliminar género de película

module.exports = router;