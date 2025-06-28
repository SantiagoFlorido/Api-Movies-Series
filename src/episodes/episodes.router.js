const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const episodesServices = require('./episodes.services')
const { uploadMixedFiles } = require('../utils/multer') // Cambio importante aquí

// Main episodes routes
router.route('/')
  .get(episodesServices.getAllEpisodes) // GET /api/v1/episodes

router.route('/:id')
  .get(episodesServices.getEpisodeById) // GET /api/v1/episodes/:id
  .patch(
    passportJwt,
    uploadMixedFiles([
      { name: 'coverUrl', maxCount: 1 },
      { name: 'episodeUrl', maxCount: 1 }
    ]),
    episodesServices.patchEpisode
  ) // PATCH /api/v1/episodes/:id
  .delete(passportJwt, episodesServices.deleteEpisode) // DELETE /api/v1/episodes/:id

// Season-episodes routes
router.route('/seasons/:seasonId/episodes')
  .get(episodesServices.getEpisodesBySeason) // GET /api/v1/seasons/:seasonId/episodes
  .post(
    passportJwt,
    uploadMixedFiles([
      { name: 'coverUrl', maxCount: 1 },
      { name: 'episodeUrl', maxCount: 1 }
    ]),
    episodesServices.postNewEpisode
  ) // POST /api/v1/seasons/:seasonId/episodes

module.exports = router