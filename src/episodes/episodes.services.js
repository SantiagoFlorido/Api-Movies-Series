const episodesControllers = require('./episodes.controllers')
const responses = require('../utils/handleResponses')
const upload = require('../utils/multer') // Para manejar subida de archivos

const getAllEpisodes = (req, res) => {
    const seasonId = req.query.seasonId // Optional filter
    
    episodesControllers.findAllEpisodes(seasonId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: data.length ? 'All episodes retrieved successfully' : 'No episodes found',
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res
            })
        })
}

const getEpisodeById = (req, res) => {
    const id = req.params.id
    
    episodesControllers.findEpisodeById(id)
        .then(data => {
            if (data) {
                responses.success({
                    status: 200,
                    data,
                    message: `Episode with id: ${id}`,
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: 'Episode not found',
                    res
                })
            }
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res
            })
        })
}

const postNewEpisode = (req, res) => {
    const seasonId = req.params.seasonId
    const episodeObj = {
        ...req.body,
        coverUrl: req.files?.coverUrl?.[0]?.path,
        episodeUrl: req.files?.episodeUrl?.[0]?.path
    }
    
    episodesControllers.createEpisode(seasonId, episodeObj)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: 'Episode created successfully',
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res,
                fields: {
                    title: 'String (1-255 chars) - REQUIRED',
                    synopsis: 'String (optional)',
                    episodeNumber: 'Integer (min: 1) - REQUIRED',
                    duration: 'Integer in minutes (optional, min: 1)',
                    episodeUrl: 'File/URL (optional)',
                    coverUrl: 'File/URL (optional)'
                }
            })
        })
}

const patchEpisode = (req, res) => {
    const id = req.params.id
    const episodeObj = {
        ...req.body,
        coverUrl: req.files?.coverUrl?.[0]?.path,
        episodeUrl: req.files?.episodeUrl?.[0]?.path
    }
    
    episodesControllers.updateEpisode(id, episodeObj)
        .then(data => {
            if (data) {
                responses.success({
                    status: 200,
                    data,
                    message: 'Episode updated successfully',
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: 'Episode not found',
                    res
                })
            }
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res,
                fields: {
                    title: 'String (1-255 chars)',
                    synopsis: 'String (optional)',
                    episodeNumber: 'Integer (min: 1)',
                    duration: 'Integer in minutes (optional, min: 1)',
                    episodeUrl: 'File/URL (optional)',
                    coverUrl: 'File/URL (optional)'
                }
            })
        })
}

const deleteEpisode = (req, res) => {
    const id = req.params.id
    
    episodesControllers.deleteEpisode(id)
        .then(() => {
            responses.success({
                status: 200,
                message: 'Episode deleted successfully',
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res
            })
        })
}

const getEpisodesBySeason = (req, res) => {
    const seasonId = req.params.seasonId
    
    episodesControllers.findEpisodesBySeason(seasonId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: data.length ? 'Episodes retrieved successfully' : 'No episodes found for this season',
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res
            })
        })
}

module.exports = {
    getAllEpisodes,
    getEpisodeById,
    postNewEpisode,
    patchEpisode,
    deleteEpisode,
    getEpisodesBySeason
}