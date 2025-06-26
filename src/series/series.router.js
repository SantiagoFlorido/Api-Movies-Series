const router = require('express').Router()
const seriesServices = require('./series.services')
const passportJwt = require('../middlewares/auth.middleware')

// Main routes
router.route('/')
  .get(seriesServices.getAllSeries)
  .post(passportJwt, seriesServices.postNewSerie)

// Routes with ID parameter
router.route('/:id')
  .get(seriesServices.getSerieById)
  .patch(passportJwt, seriesServices.patchSerie)
  .delete(passportJwt, seriesServices.deleteSerie)

// Genre management routes
router.route('/:id/genres')
  .post(passportJwt, seriesServices.postGenreToSerie)

router.route('/:id/genres/:genreId')
  .delete(passportJwt, seriesServices.deleteGenreFromSerie)

module.exports = router