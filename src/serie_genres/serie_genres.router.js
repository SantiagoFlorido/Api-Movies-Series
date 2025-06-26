const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const serieGenresServices = require('./serie_genres.services')

// Main routes for serie-genre relationships
router.route('/series/:id/genres')
  .get(serieGenresServices.getGenresBySerie) // Get all genres for a serie
  .post(passportJwt, serieGenresServices.addGenre) // Add genre to serie

router.route('/series/:id/genres/:genreId')
  .delete(passportJwt, serieGenresServices.removeGenre) // Remove genre from serie

// Additional query routes
router.route('/genres/:genreId/series')
  .get(serieGenresServices.getSeriesByGenre) // Get all series for a genre

module.exports = router