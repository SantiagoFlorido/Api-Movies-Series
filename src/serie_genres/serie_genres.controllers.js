const  SerieGenres  = require('../models/SerieGenres.models');
const Series = require('../models/series.models');
const Genres = require('../models/genres.models');
const uuid = require('uuid');

const findSerieGenres = async (serieId) => {
    const data = await SerieGenres.findAll({
        where: { serieId },
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

const addGenreToSerie = async (serieId, genreId) => {
    // Verify if the relationship already exists
    const existingRelation = await SerieGenres.findOne({
        where: { serieId, genreId }
    });

    if (existingRelation) {
        throw new Error('This genre is already associated with the series');
    }

    const data = await SerieGenres.create({
        id: uuid.v4(),
        serieId,
        genreId
    });
    return data;
};

const removeGenreFromSerie = async (serieId, genreId) => {
    const deletedRows = await SerieGenres.destroy({
        where: { serieId, genreId }
    });
    if (deletedRows === 0) {
        throw new Error('Genre not found in this series');
    }
    return deletedRows;
};

const findSeriesByGenre = async (genreId) => {
    const data = await SerieGenres.findAll({
        where: { genreId },
        include: [
            {
                model: Series,
                attributes: ['id', 'title', 'synopsis']
            }
        ],
        attributes: ['id']
    });
    return data.map(item => item.serie);
};

module.exports = {
    findSerieGenres,
    addGenreToSerie,
    removeGenreFromSerie,
    findSeriesByGenre
};