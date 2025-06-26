const seasonsControllers = require('./seasons.controllers')
const responses = require('../utils/handleResponses')

const getAllSeasons = (req, res) => {
    const serieId = req.query.serieId // Optional filter by serieId
    
    seasonsControllers.findAllSeasons(serieId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: data.length ? 'Seasons retrieved successfully' : 'No seasons found',
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

const getSeasonById = (req, res) => {
    const id = req.params.id
    
    seasonsControllers.findSeasonById(id)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: `Season with id: ${id}`,
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 404,
                message: err.message,
                res
            })
        })
}

const postNewSeason = (req, res) => {
    const serieId = req.params.serieId
    const seasonObj = req.body
    
    seasonsControllers.createSeason(serieId, seasonObj)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: 'Season created successfully',
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res,
                fields: {
                    title: 'String (1-255 chars)',
                    seasonNumber: 'Integer (min: 1)',
                    releaseYear: 'Integer (optional, min: 1878)',
                    coverUrl: 'Valid URL (optional)',
                    trailerUrl: 'Valid URL (optional)'
                }
            })
        })
}

const patchSeason = (req, res) => {
    const id = req.params.id
    const seasonObj = req.body
    
    seasonsControllers.updateSeason(id, seasonObj)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: 'Season updated successfully',
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res,
                fields: {
                    title: 'String (1-255 chars)',
                    seasonNumber: 'Integer (min: 1)',
                    releaseYear: 'Integer (optional, min: 1878)',
                    coverUrl: 'Valid URL (optional)',
                    trailerUrl: 'Valid URL (optional)'
                }
            })
        })
}

const deleteSeason = (req, res) => {
    const id = req.params.id
    
    seasonsControllers.deleteSeason(id)
        .then(() => {
            responses.success({
                status: 200,
                message: 'Season deleted successfully',
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

const getSeasonsBySerie = (req, res) => {
    const serieId = req.params.serieId
    
    seasonsControllers.findSeasonsBySerie(serieId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: data.length ? 'Seasons retrieved successfully' : 'No seasons found for this series',
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
    getAllSeasons,
    getSeasonById,
    postNewSeason,
    patchSeason,
    deleteSeason,
    getSeasonsBySerie
}