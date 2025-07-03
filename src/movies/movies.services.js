const moviesControllers = require('./movies.controllers');
const responses = require('../utils/handleResponses');
const { uploadMovieFiles } = require('../utils/multer'); // Importar el middleware específico para películas

const getAllMovies = (req, res) => {
    const genreId = req.query.genreId; // Optional filter by genre
    
    moviesControllers.findAllMovies(genreId)
        .then(data => {
            responses.success({
                status: 200,
                data,
                message: data.length ? 'All movies retrieved successfully' : 'No movies found',
                res
            });
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res
            });
        });
};

const getMovieById = (req, res) => {
    const id = req.params.id;
    
    moviesControllers.findMovieById(id)
        .then(data => {
            if (data) {
                responses.success({
                    status: 200,
                    data,
                    message: `Movie with id: ${id}`,
                    res
                });
            } else {
                responses.error({
                    status: 404,
                    message: 'Movie not found',
                    res
                });
            }
        })
        .catch(err => {
            responses.error({
                status: 400,
                message: err.message,
                res
            });
        });
};

const postNewMovie = (req, res) => {
    // Extraer datos del body y los archivos
    const movieObj = req.body;
    const files = req.files || {};
    
    // Convertir genres de string a array si es necesario
    if (typeof movieObj.genres === 'string') {
        try {
            movieObj.genres = JSON.parse(movieObj.genres);
        } catch (e) {
            movieObj.genres = movieObj.genres.split(',').map(id => parseInt(id.trim()));
        }
    }
    
    moviesControllers.createMovie(movieObj, files)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: 'Movie created successfully',
                res
            });
        })
        .catch(err => {
            console.error('Error creating movie:', err);
            responses.error({
                status: 400,
                message: err.message || 'Error creating movie',
                res,
                fields: {
                    title: 'String (1-255 chars) - REQUIRED',
                    synopsis: 'Text (optional)',
                    releaseYear: 'Integer (optional, min: 1878)',
                    director: 'String (optional, 2-100 chars)',
                    duration: 'Integer in minutes (optional, min: 1)',
                    classification: 'String (optional, 1-50 chars)',
                    rating: 'Float (optional, 0-10)',
                    genres: 'Array of genre IDs (optional)',
                    coverUrl: 'Image file (optional)',
                    trailerUrl: 'Video file (optional)',
                    movieUrl: 'Video file (optional)'
                }
            });
        });
};

const patchMovie = (req, res) => {
    const id = req.params.id;
    const movieObj = req.body;
    const files = req.files || {};
    
    // Convertir genres de string a array si es necesario
    if (typeof movieObj.genres === 'string') {
        try {
            movieObj.genres = JSON.parse(movieObj.genres);
        } catch (e) {
            movieObj.genres = movieObj.genres.split(',').map(id => parseInt(id.trim()));
        }
    }
    
    moviesControllers.updateMovie(id, movieObj, files)
        .then(data => {
            if (data) {
                responses.success({
                    status: 200,
                    data,
                    message: 'Movie updated successfully',
                    res
                });
            } else {
                responses.error({
                    status: 404,
                    message: 'Movie not found',
                    res
                });
            }
        })
        .catch(err => {
            console.error('Error updating movie:', err);
            responses.error({
                status: 400,
                message: err.message || 'Error updating movie',
                res,
                fields: {
                    title: 'String (1-255 chars)',
                    synopsis: 'Text (optional)',
                    releaseYear: 'Integer (optional, min: 1878)',
                    director: 'String (optional, 2-100 chars)',
                    duration: 'Integer in minutes (optional, min: 1)',
                    classification: 'String (optional, 1-50 chars)',
                    rating: 'Float (optional, 0-10)',
                    genres: 'Array of genre IDs (optional)',
                    coverUrl: 'Image file (optional)',
                    trailerUrl: 'Video file (optional)',
                    movieUrl: 'Video file (optional)'
                }
            });
        });
};

const deleteMovie = (req, res) => {
    const id = req.params.id;
    
    moviesControllers.deleteMovie(id)
        .then(deletedRows => {
            if (deletedRows > 0) {
                responses.success({
                    status: 200,
                    message: 'Movie deleted successfully',
                    res
                });
            } else {
                responses.error({
                    status: 404,
                    message: 'Movie not found',
                    res
                });
            }
        })
        .catch(err => {
            console.error('Error deleting movie:', err);
            responses.error({
                status: 400,
                message: err.message,
                res
            });
        });
};

const postGenreToMovie = (req, res) => {
    const movieId = req.params.id;
    const { genreId } = req.body;
    
    if (!genreId) {
        return responses.error({
            status: 400,
            message: 'genreId is required',
            res,
            fields: {
                genreId: 'Integer - REQUIRED'
            }
        });
    }
    
    moviesControllers.addGenreToMovie(movieId, genreId)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: 'Genre added to movie successfully',
                res
            });
        })
        .catch(err => {
            console.error('Error adding genre to movie:', err);
            responses.error({
                status: 400,
                message: err.message,
                res,
                fields: {
                    genreId: 'Integer - REQUIRED'
                }
            });
        });
};

const deleteGenreFromMovie = (req, res) => {
    const movieId = req.params.id;
    const genreId = req.params.genreId;
    
    moviesControllers.removeGenreFromMovie(movieId, genreId)
        .then(deletedRows => {
            if (deletedRows > 0) {
                responses.success({
                    status: 200,
                    message: 'Genre removed from movie successfully',
                    res
                });
            } else {
                responses.error({
                    status: 404,
                    message: 'Genre not found in this movie',
                    res
                });
            }
        })
        .catch(err => {
            console.error('Error removing genre from movie:', err);
            responses.error({
                status: 400,
                message: err.message,
                res
            });
        });
};

module.exports = {
    getAllMovies,
    getMovieById,
    postNewMovie,
    patchMovie,
    deleteMovie,
    postGenreToMovie,
    deleteGenreFromMovie
};