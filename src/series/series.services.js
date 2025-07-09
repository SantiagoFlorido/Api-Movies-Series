const seriesControllers = require('./series.controllers')
const responses = require('../utils/handleResponses')
const upload = require('../utils/multer').uploadSingleImage('coverUrl')

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
            console.error('Error in getAllSeries:', err)
            responses.error({
                status: 500,
                data: err,
                message: 'Internal server error while getting all series',
                res
            })
        })
}

const getSerieById = (req, res) => {
    const id = req.params.id
    
    // Validación básica del ID
    if (!id || typeof id !== 'string') {
        return responses.error({
            status: 400,
            message: 'Invalid serie ID provided',
            res
        })
    }

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
            console.error(`Error in getSerieById for id ${id}:`, err)
            responses.error({
                status: 500,
                message: 'Internal server error while getting the serie',
                res
            })
        })
}

const postNewSerie = (req, res) => {
    // Convertir géneros a números si existen
    let genres = [];
    if (req.body.genres) {
        if (Array.isArray(req.body.genres)) {
            genres = req.body.genres.map(id => Number(id));
        } else if (typeof req.body.genres === 'string') {
            genres = [Number(req.body.genres)];
        }
    }

    const serieObj = {
        ...req.body,
        genres: genres.length > 0 ? genres : undefined,
        coverUrl: req.file // Añadimos el archivo subido por multer
    }

    // Validación básica de campos requeridos
    if (!serieObj.title) {
        return responses.error({
            status: 400,
            message: 'Title is required',
            res,
            fields: {
                title: 'String (1-255 chars)',
                synopsis: 'String (optional)',
                releaseYear: 'Integer (optional, min 1878)',
                director: 'String (optional, 2-100 chars)',
                classification: 'String (optional, 1-50 chars)',
                rating: 'Float (optional, 0-10)',
                coverUrl: 'File (image, optional)',
                genres: 'Array of genre IDs (optional)'
            }
        })
    }

    // Validación de tipos de datos
    if (serieObj.releaseYear && isNaN(serieObj.releaseYear)) {
        return responses.error({
            status: 400,
            message: 'releaseYear must be a number',
            res
        })
    }

    if (serieObj.rating && (isNaN(serieObj.rating) || serieObj.rating < 0 || serieObj.rating > 10)) {
        return responses.error({
            status: 400,
            message: 'rating must be a number between 0 and 10',
            res
        })
    }

    // Validación de géneros
    if (serieObj.genres && !serieObj.genres.every(g => Number.isInteger(g))) {
        return responses.error({
            status: 400,
            message: 'All genre IDs must be integers',
            res
        })
    }

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
            console.error('Error in postNewSerie:', err)
            
            let errorMessage = 'Error occurred creating a new serie'
            if (err.message.includes('upload cover')) {
                errorMessage = 'Error uploading cover image'
            } else if (err.message.includes('genres')) {
                errorMessage = 'Invalid genre IDs provided'
            }

            responses.error({
                status: 400,
                data: err,
                message: errorMessage,
                res,
                fields: {
                    title: 'String (1-255 chars)',
                    synopsis: 'String (optional)',
                    releaseYear: 'Integer (optional, min 1878)',
                    director: 'String (optional, 2-100 chars)',
                    classification: 'String (optional, 1-50 chars)',
                    rating: 'Float (optional, 0-10)',
                    coverUrl: 'File (image, optional)',
                    genres: 'Array of genre IDs (optional)'
                }
            })
        })
}

const patchSerie = (req, res) => {
    const id = req.params.id
    
    // Convertir géneros a números si existen
    let genres;
    if (req.body.genres) {
        if (Array.isArray(req.body.genres)) {
            genres = req.body.genres.map(id => Number(id));
        } else if (typeof req.body.genres === 'string') {
            genres = [Number(req.body.genres)];
        }
    }

    const serieObj = {
        ...req.body,
        genres: genres,
        coverUrl: req.file // Añadimos el archivo subido por multer si existe
    }

    // Validación básica del ID
    if (!id || typeof id !== 'string') {
        return responses.error({
            status: 400,
            message: 'Invalid serie ID provided',
            res
        })
    }

    // Validación de tipos de datos
    if (serieObj.releaseYear && isNaN(serieObj.releaseYear)) {
        return responses.error({
            status: 400,
            message: 'releaseYear must be a number',
            res
        })
    }

    if (serieObj.rating && (isNaN(serieObj.rating) || serieObj.rating < 0 || serieObj.rating > 10)) {
        return responses.error({
            status: 400,
            message: 'rating must be a number between 0 and 10',
            res
        })
    }

    // Validación de géneros
    if (serieObj.genres && !serieObj.genres.every(g => Number.isInteger(g))) {
        return responses.error({
            status: 400,
            message: 'All genre IDs must be integers',
            res
        })
    }

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
            console.error(`Error in patchSerie for id ${id}:`, err)
            
            let errorMessage = 'Error occurred updating the serie'
            if (err.message.includes('upload cover')) {
                errorMessage = 'Error uploading cover image'
            } else if (err.message.includes('genres')) {
                errorMessage = 'Invalid genre IDs provided'
            }

            responses.error({
                status: 400,
                data: err,
                message: errorMessage,
                res,
                fields: {
                    title: 'String (1-255 chars)',
                    synopsis: 'String (optional)',
                    releaseYear: 'Integer (optional, min 1878)',
                    director: 'String (optional, 2-100 chars)',
                    classification: 'String (optional, 1-50 chars)',
                    rating: 'Float (optional, 0-10)',
                    coverUrl: 'File (image, optional)',
                    genres: 'Array of genre IDs (optional)'
                }
            })
        })
}

const deleteSerie = (req, res) => {
    const id = req.params.id

    // Validación básica del ID
    if (!id || typeof id !== 'string') {
        return responses.error({
            status: 400,
            message: 'Invalid serie ID provided',
            res
        })
    }

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
            console.error(`Error in deleteSerie for id ${id}:`, err)
            responses.error({
                status: 500,
                data: err,
                message: 'Internal server error while deleting the serie',
                res
            })
        })
}

const postGenreToSerie = (req, res) => {
    const serieId = req.params.id
    const { genreId } = req.body

    // Validaciones básicas
    if (!serieId || typeof serieId !== 'string') {
        return responses.error({
            status: 400,
            message: 'Invalid serie ID provided',
            res
        })
    }

    if (!genreId || isNaN(Number(genreId))) {
        return responses.error({
            status: 400,
            message: 'Invalid genre ID provided',
            res,
            fields: {
                genreId: 'Integer'
            }
        })
    }

    const numericGenreId = Number(genreId);

    seriesControllers.addGenreToSerie(serieId, numericGenreId)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: `Genre added to serie successfully`,
                res
            })
        })
        .catch(err => {
            console.error(`Error in postGenreToSerie for serie ${serieId} and genre ${numericGenreId}:`, err)
            
            let errorMessage = 'Error occurred adding genre to serie'
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                errorMessage = 'Invalid serie or genre ID'
            }

            responses.error({
                status: 400,
                data: err,
                message: errorMessage,
                res,
                fields: {
                    genreId: 'Integer'
                }
            })
        })
}

const deleteGenreFromSerie = (req, res) => {
    const serieId = req.params.id
    const genreId = req.params.genreId

    // Validaciones básicas
    if (!serieId || typeof serieId !== 'string') {
        return responses.error({
            status: 400,
            message: 'Invalid serie ID provided',
            res
        })
    }

    if (!genreId || isNaN(Number(genreId))) {
        return responses.error({
            status: 400,
            message: 'Invalid genre ID provided',
            res
        })
    }

    const numericGenreId = Number(genreId);

    seriesControllers.removeGenreFromSerie(serieId, numericGenreId)
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
            console.error(`Error in deleteGenreFromSerie for serie ${serieId} and genre ${numericGenreId}:`, err)
            responses.error({
                status: 500,
                data: err,
                message: 'Internal server error while removing genre from serie',
                res
            })
        })
}

module.exports = {
    getAllSeries,
    getSerieById,
    postNewSerie: [upload, postNewSerie],
    patchSerie: [upload, patchSerie],
    deleteSerie,
    postGenreToSerie,
    deleteGenreFromSerie
}