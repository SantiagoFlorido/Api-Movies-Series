const moviesControllers = require('./movies.controllers')
const responses = require('../utils/handleResponses')

const getAllMovies = (req, res) => {
    const genreId = req.query.genreId // Optional filter by genre
    
    moviesControllers.findAllMovies(genreId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: data.length ? 'All movies retrieved successfully' : 'No movies found',
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

const getMovieById = (req, res) => {
    const id = req.params.id
    
    moviesControllers.findMovieById(id)
        .then(data => {
            if (data) {
                responses.success({
                    status: 200,
                    data,
                    message: `Movie with id: ${id}`,
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: 'Movie not found',
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

const postNewMovie = (req, res) => {
    const movieObj = req.body
    
    moviesControllers.createMovie(movieObj)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: 'Movie created successfully',
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
                    synopsis: 'Text (optional)',
                    releaseYear: 'Integer (optional, min: 1878)',
                    director: 'String (optional, 2-100 chars)',
                    duration: 'Integer in minutes (optional, min: 1)',
                    trailerUrl: 'Valid URL (optional)',
                    coverUrl: 'Valid URL (optional)',
                    movieUrl: 'Valid URL (optional)',
                    classification: 'String (optional, 1-50 chars)',
                    rating: 'Float (optional, 0-10)',
                    genres: 'Array of genre IDs (optional)'
                }
            })
        })
}

const patchMovie = (req, res) => {
    const id = req.params.id
    const movieObj = req.body
    
    moviesControllers.updateMovie(id, movieObj)
        .then(data => {
            if (data) {
                responses.success({
                    status: 200,
                    data,
                    message: 'Movie updated successfully',
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: 'Movie not found',
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
                    synopsis: 'Text (optional)',
                    releaseYear: 'Integer (optional, min: 1878)',
                    director: 'String (optional, 2-100 chars)',
                    duration: 'Integer in minutes (optional, min: 1)',
                    trailerUrl: 'Valid URL (optional)',
                    coverUrl: 'Valid URL (optional)',
                    movieUrl: 'Valid URL (optional)',
                    classification: 'String (optional, 1-50 chars)',
                    rating: 'Float (optional, 0-10)',
                    genres: 'Array of genre IDs (optional)'
                }
            })
        })
}

const deleteMovie = (req, res) => {
    const id = req.params.id
    
    moviesControllers.deleteMovie(id)
        .then(deletedRows => {
            if (deletedRows > 0) {
                responses.success({
                    status: 200,
                    message: 'Movie deleted successfully',
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: 'Movie not found',
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

const postGenreToMovie = (req, res) => {
    const movieId = req.params.id
    const { genreId } = req.body
    
    moviesControllers.addGenreToMovie(movieId, genreId)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: 'Genre added to movie successfully',
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res,
                fields: {
                    genreId: 'Integer - REQUIRED'
                }
            })
        })
}

const deleteGenreFromMovie = (req, res) => {
    const movieId = req.params.id
    const genreId = req.params.genreId
    
    moviesControllers.removeGenreFromMovie(movieId, genreId)
        .then(deletedRows => {
            if (deletedRows > 0) {
                responses.success({
                    status: 200,
                    message: 'Genre removed from movie successfully',
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: 'Genre not found in this movie',
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

module.exports = {
    getAllMovies,
    getMovieById,
    postNewMovie,
    patchMovie,
    deleteMovie,
    postGenreToMovie,
    deleteGenreFromMovie
}