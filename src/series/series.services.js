const seriesControllers = require('./series.controllers')
const responses = require('../utils/handleResponses')

const getAllSeries = (req, res) => {
    seriesControllers.findAllSeries()
        .then(data => {
            responses.success({
                status: 200,
                data: data,
                message: 'Getting all Series',
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                data: err,
                message: 'Something went wrong getting all series',
                res
            })
        })
}

const getSerieById = (req, res) => {
    const id = req.params.id
    seriesControllers.findSerieById(id)
        .then(data => {
            if(data) {
                responses.success({
                    status: 200,
                    data,
                    message: `Getting Serie with id: ${id}`,
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: `Serie with ID: ${id}, not found`,
                    res
                })
            }
        })
        .catch(err => {
            responses.error({
                status: 400,
                data: err,
                message: 'Something went wrong getting the serie',
                res
            })
        })
}

const postNewSerie = (req, res) => {
    const serieObj = req.body
    seriesControllers.createSerie(serieObj)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: 'Serie created successfully',
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                data: err,
                message: 'Error occurred creating a new serie',
                res,
                fields: {
                    title: 'String (1-255 chars)',
                    synopsis: 'String (optional)',
                    releaseYear: 'Integer (optional, min 1878)',
                    director: 'String (optional, 2-100 chars)',
                    classification: 'String (optional, 1-50 chars)',
                    rating: 'Float (optional, 0-10)',
                    genres: 'Array of genre IDs (optional)'
                }
            })
        })
}

const patchSerie = (req, res) => {
    const id = req.params.id
    const serieObj = req.body

    seriesControllers.updateSerie(id, serieObj)
        .then(data => {
            if(data) {
                responses.success({
                    status: 200,
                    data,
                    message: `Serie with id: ${id} updated successfully`,
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: `Serie with ID: ${id}, not found`,
                    res
                })
            }
        })
        .catch(err => {
            responses.error({
                status: 400,
                data: err,
                message: 'Error occurred updating the serie',
                res,
                fields: {
                    title: 'String (1-255 chars)',
                    synopsis: 'String (optional)',
                    releaseYear: 'Integer (optional, min 1878)',
                    director: 'String (optional, 2-100 chars)',
                    classification: 'String (optional, 1-50 chars)',
                    rating: 'Float (optional, 0-10)',
                    genres: 'Array of genre IDs (optional)'
                }
            })
        })
}

const deleteSerie = (req, res) => {
    const id = req.params.id

    seriesControllers.deleteSerie(id)
        .then(data => {
            if(data) {
                responses.success({
                    status: 200,
                    data,
                    message: `Serie with id: ${id} deleted successfully`,
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: `Serie with ID: ${id}, not found`,
                    res
                })
            }
        })
        .catch(err => {
            responses.error({
                status: 400,
                data: err,
                message: 'Error occurred deleting the serie',
                res
            })
        })
}

const postGenreToSerie = (req, res) => {
    const serieId = req.params.id
    const { genreId } = req.body

    seriesControllers.addGenreToSerie(serieId, genreId)
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
                data: err,
                message: 'Error occurred adding genre to serie',
                res,
                fields: {
                    genreId: 'UUID'
                }
            })
        })
}

const deleteGenreFromSerie = (req, res) => {
    const serieId = req.params.id
    const genreId = req.params.genreId

    seriesControllers.removeGenreFromSerie(serieId, genreId)
        .then(data => {
            if(data) {
                responses.success({
                    status: 200,
                    data,
                    message: `Genre removed from serie successfully`,
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: `Genre not found in this serie`,
                    res
                })
            }
        })
        .catch(err => {
            responses.error({
                status: 400,
                data: err,
                message: 'Error occurred removing genre from serie',
                res
            })
        })
}

module.exports = {
    getAllSeries,
    getSerieById,
    postNewSerie,
    patchSerie,
    deleteSerie,
    postGenreToSerie,
    deleteGenreFromSerie
}