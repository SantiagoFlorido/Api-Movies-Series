const genresControllers = require('./genres.controllers')
const responses = require('../utils/handleResponses')

const getAllGenres = (req, res) => {
    genresControllers.findAllGenres()
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: data.length ? 'All genres retrieved successfully' : 'No genres found',
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

const getGenreById = (req, res) => {
    const id = req.params.id

    genresControllers.findGenreById(id)
        .then(data => {
            if (data) {
                responses.success({
                    status: 200,
                    data,
                    message: `Genre with id: ${id}`,
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: 'Genre not found',
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

const postNewGenre = (req, res) => {
    const { name } = req.body

    if (!name) {
        return responses.error({
            status: 400,
            message: 'Name is required',
            res,
            fields: { name: 'string (2-100 chars)' }
        })
    }

    genresControllers.createGenre(name)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: 'Genre created successfully',
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res,
                fields: { name: 'string (2-100 chars, unique)' }
            })
        })
}

const patchGenre = (req, res) => {
    const id = req.params.id
    const { name } = req.body

    genresControllers.updateGenre(id, name)
        .then(data => {
            if (data) {
                responses.success({
                    status: 200,
                    data,
                    message: 'Genre updated successfully',
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: 'Genre not found',
                    res
                })
            }
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res,
                fields: { name: 'string (2-100 chars, unique)' }
            })
        })
}

const deleteGenre = (req, res) => {
    const id = req.params.id

    genresControllers.deleteGenre(id)
        .then(() => {
            responses.success({
                status: 200,
                message: 'Genre deleted successfully',
                res
            })
        })
        .catch(err => {
            const status = err.message.includes('associated') ? 409 : 400
            responses.error({
                status,
                message: err.message,
                res
            })
        })
}

const getMoviesByGenre = (req, res) => {
    const genreId = req.params.genreId

    genresControllers.findMoviesByGenre(genreId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: data.length ? 'Movies retrieved successfully' : 'No movies found for this genre',
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

    genresControllers.findSeriesByGenre(genreId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: data.length ? 'Series retrieved successfully' : 'No series found for this genre',
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
    getAllGenres,
    getGenreById,
    postNewGenre,
    patchGenre,
    deleteGenre,
    getMoviesByGenre,
    getSeriesByGenre
}