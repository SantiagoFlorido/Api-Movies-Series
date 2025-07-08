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
    
    // Manejo mejorado de géneros
    if (serieObj.genres && serieObj.genres.length > 0) {
        try {
            // Verificar que los géneros existan antes de agregarlos
            const existingGenres = await Genres.findAll({
                where: {
                    id: serieObj.genres
                }
            });

            if (existingGenres.length !== serieObj.genres.length) {
                throw new Error('Some genres do not exist');
            }

            // Crear las relaciones manualmente
            await Promise.all(serieObj.genres.map(genreId => {
                return SerieGenres.create({
                    id: uuid.v4(),
                    serie_id: data.id,
                    genre_id: genreId
                });
            }));

            // Recargar la serie con los géneros para devolverla completa
            return await Series.findByPk(data.id, {
                include: [{
                    model: Genres,
                    as: 'genres',
                    through: { attributes: [] }
                }]
            });
        } catch (err) {
            // Si falla la creación de géneros, eliminar la serie creada
            await Series.destroy({ where: { id: data.id } });
            throw err;
        }
    }
    
    return data;
};

const updateSerie = async (id, serieObj) => {
    const serie = await Series.findByPk(id);
    if (!serie) return null;

    let coverUrl = serie.coverUrl;
    
    if (serieObj.coverUrl) {
        try {
            if (coverUrl) {
                await deleteFile(coverUrl).catch(err => {
                    console.error('Error deleting old cover:', err);
                });
            }
            
            coverUrl = await uploadFile(serieObj.coverUrl, {
                folder: 'series-covers',
                contentType: serieObj.coverUrl.mimetype
            });
        } catch (err) {
            console.error('Error updating cover:', err);
            throw new Error('Failed to update cover image');
        }
    } else if (serieObj.coverUrl === null) {
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
        
        if (serieObj.genres) {
            // Eliminar relaciones existentes
            await SerieGenres.destroy({ where: { serie_id: id } });
            
            // Crear nuevas relaciones
            await Promise.all(serieObj.genres.map(genreId => {
                return SerieGenres.create({
                    id: uuid.v4(),
                    serie_id: id,
                    genre_id: genreId
                });
            }));
        }
        
        return await Series.findByPk(id, {
            include: [{
                model: Genres,
                as: 'genres',
                through: { attributes: [] }
            }]
        });
    }
    return null;
};

const deleteSerie = async (id) => {
    const serie = await Series.findByPk(id);
    if (!serie) return 0;

    if (serie.coverUrl) {
        await deleteFile(serie.coverUrl).catch(err => {
            console.error('Error deleting cover:', err);
        });
    }

    // Eliminar primero las relaciones con géneros
    await SerieGenres.destroy({ where: { serie_id: id } });

    const deletedRows = await Series.destroy({
        where: { id }
    });
    return deletedRows;
};

const addGenreToSerie = async (serieId, genreId) => {
    // Verificar que existan tanto la serie como el género
    const [serie, genre] = await Promise.all([
        Series.findByPk(serieId),
        Genres.findByPk(genreId)
    ]);

    if (!serie || !genre) {
        throw new Error('Serie or genre not found');
    }

    // Verificar si la relación ya existe
    const existingRelation = await SerieGenres.findOne({
        where: {
            serie_id: serieId,
            genre_id: genreId
        }
    });

    if (existingRelation) {
        return existingRelation;
    }

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