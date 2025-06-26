const movieGenresControllers = require('./movie_genres.controllers')
const responses = require('../utils/handleResponses')

const getGenresByMovie = (req, res) => {
    const movieId = req.params.id

    movieGenresControllers.findMovieGenres(movieId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: data.length ? 'Genres retrieved successfully' : 'No genres found for this movie',
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

const postGenreToMovie = (req, res) => {
    const movieId = req.params.id
    const { genreId } = req.body

    if (!genreId) {
        return responses.error({
            status: 400,
            message: 'genreId is required',
            res,
            fields: { genreId: 'integer (required)' }
        })
    }

    movieGenresControllers.addGenreToMovie(movieId, genreId)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: 'Genre added to movie successfully',
                res
            })
        })
        .catch(err => {
            const status = err.message.includes('not found') ? 404 : 400
            responses.error({
                status,
                message: err.message,
                res,
                fields: { genreId: 'integer (required)' }
            })
        })
}

const deleteGenreFromMovie = (req, res) => {
    const movieId = req.params.id
    const genreId = req.params.genreId

    movieGenresControllers.removeGenreFromMovie(movieId, genreId)
        .then(() => {
            responses.success({
                status: 200,
                message: 'Genre removed from movie successfully',
                res
            })
        })
        .catch(err => {
            const status = err.message.includes('not found') ? 404 : 400
            responses.error({
                status,
                message: err.message,
                res
            })
        })
}

const getMoviesByGenre = (req, res) => {
    const genreId = req.params.genreId

    movieGenresControllers.findMoviesByGenre(genreId)
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

module.exports = {
    getGenresByMovie,
    postGenreToMovie,
    deleteGenreFromMovie,
    getMoviesByGenre
}