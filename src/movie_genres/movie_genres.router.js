const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const movieGenresServices = require('./movie_genres.services')

// Movie-Genre Relationship Routes
router.route('/movies/:id/genres')
  .get(movieGenresServices.getGenresByMovie) // GET /api/v1/movies/:id/genres
  .post(passportJwt, movieGenresServices.postGenreToMovie) // POST /api/v1/movies/:id/genres

router.route('/movies/:id/genres/:genreId')
  .delete(passportJwt, movieGenresServices.deleteGenreFromMovie) // DELETE /api/v1/movies/:id/genres/:genreId

// Genre-Movie Relationship Routes
router.route('/genres/:genreId/movies')
  .get(movieGenresServices.getMoviesByGenre) // GET /api/v1/genres/:genreId/movies

module.exports = router