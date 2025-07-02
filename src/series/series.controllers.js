const Series = require('../models/series.models');
const Genres = require('../models/genres.models');
const  SerieGenres  = require('../models/SerieGenres.models');
const uuid = require('uuid');

const findAllSeries = async () => {
    const data = await Series.findAll({
        include: [{
            model: Genres,
            as: 'genres',
            attributes: ['id', 'name'],
            through: { attributes: [] }
        }]
    });
    return data;
};

const findSerieById = async (id) => {
    const data = await Series.findOne({
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

const createSerie = async (serieObj) => {
    const newSerie = {
        id: uuid.v4(),
        title: serieObj.title,
        synopsis: serieObj.synopsis || null,
        releaseYear: serieObj.releaseYear || null,
        director: serieObj.director || null,
        classification: serieObj.classification || null,
        rating: serieObj.rating || null
    };

    const data = await Series.create(newSerie);
    
    // Add genres if provided
    if (serieObj.genres && serieObj.genres.length > 0) {
        await data.addGenres(serieObj.genres);
    }
    
    return data;
};

const updateSerie = async (id, serieObj) => {
    const [updatedRows] = await Series.update(serieObj, {
        where: { id }
    });

    if (updatedRows > 0) {
        const data = await Series.findByPk(id);
        
        // Update genres if provided
        if (serieObj.genres) {
            await data.setGenres(serieObj.genres);
        }
        
        return data;
    }
    return null;
};

const deleteSerie = async (id) => {
    const deletedRows = await Series.destroy({
        where: { id }
    });
    return deletedRows;
};

const addGenreToSerie = async (serieId, genreId) => {
    const data = await SerieGenres.create({
        id: uuid.v4(),
        serie_id: serieId,
        genre_id: genreId
    });
    return data;
};

const removeGenreFromSerie = async (serieId, genreId) => {
    const deletedRows = await SerieGenres.destroy({
        where: {
            serie_id: serieId,
            genre_id: genreId
        }
    });
    return deletedRows;
};

module.exports = {
    findAllSeries,
    findSerieById,
    createSerie,
    updateSerie,
    deleteSerie,
    addGenreToSerie,
    removeGenreFromSerie
};