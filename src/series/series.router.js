const router = require('express').Router()
const seriesServices = require('./series.services')
const passportJwt = require('../middlewares/auth.middleware')
const upload = require('../utils/multer').uploadSingleImage('coverUrl')

// Main routes
router.route('/')
  .get(seriesServices.getAllSeries)
  .post(
    passportJwt, 
    upload, // Middleware para subir la imagen de portada
    seriesServices.postNewSerie
  )

// Routes with ID parameter
router.route('/:id')
  .get(seriesServices.getSerieById)
  .patch(
    passportJwt, 
    upload, // Middleware para actualizar la imagen de portada
    seriesServices.patchSerie
  )
  .delete(passportJwt, seriesServices.deleteSerie)

// Genre management routes
router.route('/:id/genres')
  .post(passportJwt, seriesServices.postGenreToSerie)

router.route('/:id/genres/:genreId')
  .delete(passportJwt, seriesServices.deleteGenreFromSerie)

module.exports = router