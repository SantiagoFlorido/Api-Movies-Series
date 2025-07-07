const Series = require('../models/series.models');
const Genres = require('../models/genres.models');
const SerieGenres = require('../models/SerieGenres.models');
const { uploadFile, deleteFile } = require('../utils/supabase');
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
    let coverUrl = null;
    
    // Subir imagen a Supabase si existe
    if (serieObj.coverUrl) {
        try {
            coverUrl = await uploadFile(serieObj.coverUrl, {
                folder: 'series-covers',
                contentType: serieObj.coverUrl.mimetype
            });
        } catch (err) {
            console.error('Error uploading cover:', err);
            throw new Error('Failed to upload cover image');
        }
    }

    const newSerie = {
        id: uuid.v4(),
        title: serieObj.title,
        synopsis: serieObj.synopsis || null,
        releaseYear: serieObj.releaseYear || null,
        director: serieObj.director || null,
        classification: serieObj.classification || null,
        rating: serieObj.rating || null,
        coverUrl: coverUrl
    };

    const data = await Series.create(newSerie);
    
    // Add genres if provided
    if (serieObj.genres && serieObj.genres.length > 0) {
        await data.addGenres(serieObj.genres);
    }
    
    return data;
};

const updateSerie = async (id, serieObj) => {
    const serie = await Series.findByPk(id);
    if (!serie) return null;

    let coverUrl = serie.coverUrl;
    
    // Manejar actualización de la imagen de portada
    if (serieObj.coverUrl) {
        try {
            // Eliminar la imagen anterior si existe
            if (coverUrl) {
                await deleteFile(coverUrl).catch(err => {
                    console.error('Error deleting old cover:', err);
                });
            }
            
            // Subir nueva imagen
            coverUrl = await uploadFile(serieObj.coverUrl, {
                folder: 'series-covers',
                contentType: serieObj.coverUrl.mimetype
            });
        } catch (err) {
            console.error('Error updating cover:', err);
            throw new Error('Failed to update cover image');
        }
    } else if (serieObj.coverUrl === null) {
        // Si se envía explícitamente null, eliminar la imagen
        if (coverUrl) {
            await deleteFile(coverUrl).catch(err => {
                console.error('Error deleting cover:', err);
            });
        }
        coverUrl = null;
    }

    const updateData = {
        ...serieObj,
        coverUrl: coverUrl
    };

    const [updatedRows] = await Series.update(updateData, {
        where: { id }
    });

    if (updatedRows > 0) {
        const updatedSerie = await Series.findByPk(id);
        
        // Update genres if provided
        if (serieObj.genres) {
            await updatedSerie.setGenres(serieObj.genres);
        }
        
        return updatedSerie;
    }
    return null;
};

const deleteSerie = async (id) => {
    const serie = await Series.findByPk(id);
    if (!serie) return 0;

    // Eliminar la imagen de portada si existe
    if (serie.coverUrl) {
        await deleteFile(serie.coverUrl).catch(err => {
            console.error('Error deleting cover:', err);
        });
    }

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