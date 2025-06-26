const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const genresServices = require('./genres.services')

// Main genres routes
router.route('/')
  .get(genresServices.getAllGenres) // GET /api/v1/genres
  .post(passportJwt, genresServices.postNewGenre) // POST /api/v1/genres

// Single genre routes
router.route('/:id')
  .get(genresServices.getGenreById) // GET /api/v1/genres/:id
  .patch(passportJwt, genresServices.patchGenre) // PATCH /api/v1/genres/:id
  .delete(passportJwt, genresServices.deleteGenre) // DELETE /api/v1/genres/:id

// Genre relationships routes
router.route('/:genreId/movies')
  .get(genresServices.getMoviesByGenre) // GET /api/v1/genres/:genreId/movies

router.route('/:genreId/series')
  .get(genresServices.getSeriesByGenre) // GET /api/v1/genres/:genreId/series

module.exports = router