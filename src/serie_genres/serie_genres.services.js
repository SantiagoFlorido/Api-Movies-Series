const serieGenresControllers = require('./serie_genres.controllers')
const responses = require('../utils/handleResponses')

const getGenresBySerie = (req, res) => {
    const serieId = req.params.id

    serieGenresControllers.findSerieGenres(serieId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: `Getting all genres for serie with id: ${serieId}`,
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

const addGenre = (req, res) => {
    const serieId = req.params.id
    const { genreId } = req.body

    serieGenresControllers.addGenreToSerie(serieId, genreId)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: `Genre added to serie successfully`,
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res,
                fields: {
                    genreId: 'integer (required)'
                }
            })
        })
}

const removeGenre = (req, res) => {
    const serieId = req.params.id
    const genreId = req.params.genreId

    serieGenresControllers.removeGenreFromSerie(serieId, genreId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: `Genre removed from serie successfully`,
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

const getSeriesByGenre = (req, res) => {
    const genreId = req.params.genreId

    serieGenresControllers.findSeriesByGenre(genreId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: `Getting all series for genre with id: ${genreId}`,
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
    getGenresBySerie,
    addGenre,
    removeGenre,
    getSeriesByGenre
}