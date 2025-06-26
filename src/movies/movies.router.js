const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const moviesServices = require('./movies.services')
const upload = require('../utils/multer') // Para manejar subida de archivos

// Rutas principales de películas
router.route('/')
  .get(moviesServices.getAllMovies) // Obtener todas las películas
  .post(
    passportJwt,
    upload.fields([
      { name: 'coverUrl', maxCount: 1 },
      { name: 'trailerUrl', maxCount: 1 },
      { name: 'movieUrl', maxCount: 1 }
    ]),
    moviesServices.postNewMovie
  ) // Crear nueva película

// Rutas para película específica
router.route('/:id')
  .get(moviesServices.getMovieById) // Obtener película por ID
  .patch(
    passportJwt,
    upload.fields([
      { name: 'coverUrl', maxCount: 1 },
      { name: 'trailerUrl', maxCount: 1 },
      { name: 'movieUrl', maxCount: 1 }
    ]),
    moviesServices.patchMovie
  ) // Actualizar película
  .delete(passportJwt, moviesServices.deleteMovie) // Eliminar película

// Rutas para gestión de géneros
router.route('/:id/genres')
  .post(passportJwt, moviesServices.postGenreToMovie) // Añadir género a película

router.route('/:id/genres/:genreId')
  .delete(passportJwt, moviesServices.deleteGenreFromMovie) // Eliminar género de película

module.exports = router