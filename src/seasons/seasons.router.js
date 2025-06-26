const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const seasonsServices = require('./seasons.services')

// Main routes
router.route('/')
  .get(seasonsServices.getAllSeasons) // Get all seasons (optional ?serieId=)

// Season-specific routes
router.route('/:id')
  .get(seasonsServices.getSeasonById) // Get specific season
  .patch(passportJwt, seasonsServices.patchSeason) // Update season
  .delete(passportJwt, seasonsServices.deleteSeason) // Delete season

// Series-related season routes
router.route('/series/:serieId/seasons')
  .get(seasonsServices.getSeasonsBySerie) // Get all seasons for a series
  .post(passportJwt, seasonsServices.postNewSeason) // Create new season for series

module.exports = router