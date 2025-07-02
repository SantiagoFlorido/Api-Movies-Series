const  Seasons  = require('../models/seasons.models');
const  Series  = require('../models/series.models');
const uuid = require('uuid');

const findAllSeasons = async (serieId = null) => {
    try {
        const whereClause = serieId ? { serie_id: serieId } : {};
        const data = await Seasons.findAll({
            where: whereClause,
            include: {
                model: Series,
                as: 'series',
                attributes: ['id', 'title']
            },
            order: [['seasonNumber', 'ASC']]
        });
        return data;
    } catch (error) {
        throw new Error(`Error finding seasons: ${error.message}`);
    }
};

const findSeasonById = async (id) => {
    try {
        const data = await Seasons.findOne({
            where: { id },
            include: {
                model: Series,
                as: 'series',
                attributes: ['id', 'title']
            }
        });
        if (!data) throw new Error('Season not found');
        return data;
    } catch (error) {
        throw new Error(`Error finding season: ${error.message}`);
    }
};

const createSeason = async (serieId, seasonObj) => {
    try {
        // Verify the series exists
        const serie = await Series.findByPk(serieId);
        if (!serie) throw new Error('Series not found');

        // Validate season number is unique for this series
        const existingSeason = await Seasons.findOne({
            where: { 
                serie_id: serieId,
                seasonNumber: seasonObj.seasonNumber
            }
        });
        if (existingSeason) throw new Error('Season number already exists for this series');

        const newSeason = {
            id: uuid.v4(),
            serie_id: serieId,
            title: seasonObj.title,
            seasonNumber: seasonObj.seasonNumber,
            releaseYear: seasonObj.releaseYear || null,
            coverUrl: seasonObj.coverUrl || null,
            trailerUrl: seasonObj.trailerUrl || null
        };

        const data = await Seasons.create(newSeason);
        return data;
    } catch (error) {
        throw new Error(`Error creating season: ${error.message}`);
    }
};

const updateSeason = async (id, seasonObj) => {
    try {
        const [updatedRows] = await Seasons.update(seasonObj, {
            where: { id }
        });

        if (updatedRows === 0) throw new Error('Season not found or no changes made');
        
        const updatedSeason = await Seasons.findByPk(id);
        return updatedSeason;
    } catch (error) {
        throw new Error(`Error updating season: ${error.message}`);
    }
};

const deleteSeason = async (id) => {
    try {
        const deletedRows = await Seasons.destroy({
            where: { id }
        });
        if (deletedRows === 0) throw new Error('Season not found');
        return deletedRows;
    } catch (error) {
        throw new Error(`Error deleting season: ${error.message}`);
    }
};

const findSeasonsBySerie = async (serieId) => {
    try {
        const data = await Seasons.findAll({
            where: { serie_id: serieId },
            order: [['seasonNumber', 'ASC']]
        });
        if (data.length === 0) throw new Error('No seasons found for this series');
        return data;
    } catch (error) {
        throw new Error(`Error finding seasons by series: ${error.message}`);
    }
};

module.exports = {
    findAllSeasons,
    findSeasonById,
    createSeason,
    updateSeason,
    deleteSeason,
    findSeasonsBySerie
};