const  Genres  = require('../models/genres.models');
const  Movies  = require('../models/movies.models');
const  Series  = require('../models/series.models');

const findAllGenres = async () => {
    const data = await Genres.findAll({
        order: [['name', 'ASC']]
    });
    return data;
};

const findGenreById = async (id) => {
    const data = await Genres.findByPk(id);
    return data;
};

const createGenre = async (name) => {
    const data = await Genres.create({
        name
    });
    return data;
};

const updateGenre = async (id, name) => {
    const [updatedRows] = await Genres.update({ name }, {
        where: { id }
    });

    if (updatedRows > 0) {
        return await Genres.findByPk(id);
    }
    return null;
};

const deleteGenre = async (id) => {
    // Check if genre is associated with any movies or series
    const moviesCount = await Movies.count({
        include: {
            model: Genres,
            where: { id },
            through: { attributes: [] }
        }
    });

    const seriesCount = await Series.count({
        include: {
            model: Genres,
            where: { id },
            through: { attributes: [] }
        }
    });

    if (moviesCount > 0 || seriesCount > 0) {
        throw new Error('Cannot delete genre: it is associated with movies or series');
    }

    const deletedRows = await Genres.destroy({
        where: { id }
    });
    return deletedRows;
};

const findMoviesByGenre = async (genreId) => {
    const genre = await Genres.findByPk(genreId, {
        include: {
            model: Movies,
            as: 'movies',
            through: { attributes: [] },
            attributes: ['id', 'title', 'coverUrl']
        }
    });

    return genre ? genre.movies : [];
};

const findSeriesByGenre = async (genreId) => {
    const genre = await Genres.findByPk(genreId, {
        include: {
            model: Series,
            as: 'series',
            through: { attributes: [] },
            attributes: ['id', 'title', 'coverUrl']
        }
    });

    return genre ? genre.series : [];
};

module.exports = {
    findAllGenres,
    findGenreById,
    createGenre,
    updateGenre,
    deleteGenre,
    findMoviesByGenre,
    findSeriesByGenre
};