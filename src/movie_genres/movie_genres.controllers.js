const { MovieGenres } = require('../models/MovieGenres.models');
const { Movies } = require('../models/movies.models');
const { Genres } = require('../models/genres.models');
const uuid = require('uuid');

const findMovieGenres = async (movieId) => {
    const data = await MovieGenres.findAll({
        where: { movieId },
        include: [
            {
                model: Genres,
                attributes: ['id', 'name']
            }
        ],
        attributes: ['id']
    });
    return data.map(item => item.genre);
};

const addGenreToMovie = async (movieId, genreId) => {
    // Verify if movie exists
    const movie = await Movies.findByPk(movieId);
    if (!movie) throw new Error('Movie not found');

    // Verify if genre exists
    const genre = await Genres.findByPk(genreId);
    if (!genre) throw new Error('Genre not found');

    // Check if relationship already exists
    const existingRelation = await MovieGenres.findOne({
        where: { movieId, genreId }
    });
    if (existingRelation) {
        throw new Error('This genre is already associated with the movie');
    }

    const data = await MovieGenres.create({
        id: uuid.v4(),
        movieId,
        genreId
    });
    return data;
};

const removeGenreFromMovie = async (movieId, genreId) => {
    const deletedRows = await MovieGenres.destroy({
        where: { movieId, genreId }
    });
    if (deletedRows === 0) {
        throw new Error('Genre not found in this movie');
    }
    return deletedRows;
};

const findMoviesByGenre = async (genreId) => {
    const data = await MovieGenres.findAll({
        where: { genreId },
        include: [
            {
                model: Movies,
                attributes: ['id', 'title', 'synopsis']
            }
        ],
        attributes: ['id']
    });
    return data.map(item => item.movie);
};

module.exports = {
    findMovieGenres,
    addGenreToMovie,
    removeGenreFromMovie,
    findMoviesByGenre
};