const { Movies } = require('../models/movies.models');
const { Genres } = require('../models/genres.models');
const { MovieGenres } = require('../models/MovieGenres.models');
const uuid = require('uuid');

const findAllMovies = async (genreId = null) => {
    const options = {
        include: [{
            model: Genres,
            as: 'genres',
            attributes: ['id', 'name'],
            through: { attributes: [] }
        }],
        order: [['releaseYear', 'DESC']]
    };

    if (genreId) {
        options.include[0].where = { id: genreId };
    }

    const data = await Movies.findAll(options);
    return data;
};

const findMovieById = async (id) => {
    const data = await Movies.findOne({
        where: { id },
        include: [{
            model: Genres,
            as: 'genres',
            attributes: ['id', 'name'],
            through: { attributes: [] }
        }]
    });
    return data;
};

const createMovie = async (movieObj) => {
    const newMovie = {
        id: uuid.v4(),
        title: movieObj.title,
        synopsis: movieObj.synopsis || null,
        releaseYear: movieObj.releaseYear || null,
        director: movieObj.director || null,
        duration: movieObj.duration || null,
        trailerUrl: movieObj.trailerUrl || null,
        coverUrl: movieObj.coverUrl || null,
        movieUrl: movieObj.movieUrl || null,
        classification: movieObj.classification || null,
        rating: movieObj.rating || null
    };

    const data = await Movies.create(newMovie);
    
    // Add genres if provided
    if (movieObj.genres && movieObj.genres.length > 0) {
        await data.addGenres(movieObj.genres);
    }
    
    return data;
};

const updateMovie = async (id, movieObj) => {
    const [updatedRows] = await Movies.update(movieObj, {
        where: { id }
    });

    if (updatedRows > 0) {
        const data = await Movies.findByPk(id);
        
        // Update genres if provided
        if (movieObj.genres) {
            await data.setGenres(movieObj.genres);
        }
        
        return data;
    }
    return null;
};

const deleteMovie = async (id) => {
    const deletedRows = await Movies.destroy({
        where: { id }
    });
    return deletedRows;
};

const addGenreToMovie = async (movieId, genreId) => {
    const existingRelation = await MovieGenres.findOne({
        where: { movie_id: movieId, genre_id: genreId }
    });

    if (existingRelation) {
        throw new Error('This genre is already associated with the movie');
    }

    const data = await MovieGenres.create({
        id: uuid.v4(),
        movie_id: movieId,
        genre_id: genreId
    });
    return data;
};

const removeGenreFromMovie = async (movieId, genreId) => {
    const deletedRows = await MovieGenres.destroy({
        where: { movie_id: movieId, genre_id: genreId }
    });
    if (deletedRows === 0) {
        throw new Error('Genre not found in this movie');
    }
    return deletedRows;
};

module.exports = {
    findAllMovies,
    findMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    addGenreToMovie,
    removeGenreFromMovie
};