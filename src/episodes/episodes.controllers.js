const { Episodes } = require('../models/episodes.models');
const { Seasons } = require('../models/seasons.models');
const uuid = require('uuid');

const findAllEpisodes = async (seasonId = null) => {
    const whereClause = seasonId ? { seasonId } : {};
    const data = await Episodes.findAll({
        where: whereClause,
        include: {
            model: Seasons,
            as: 'season',
            attributes: ['id', 'title', 'seasonNumber']
        },
        order: [
            ['seasonId', 'ASC'],
            ['episodeNumber', 'ASC']
        ]
    });
    return data;
};

const findEpisodeById = async (id) => {
    const data = await Episodes.findOne({
        where: { id },
        include: {
            model: Seasons,
            as: 'season',
            attributes: ['id', 'title', 'seasonNumber']
        }
    });
    return data;
};

const createEpisode = async (seasonId, episodeObj) => {
    // Verify the season exists
    const season = await Seasons.findByPk(seasonId);
    if (!season) throw new Error('Season not found');

    // Verify episode number is unique for this season
    const existingEpisode = await Episodes.findOne({
        where: { 
            seasonId,
            episodeNumber: episodeObj.episodeNumber
        }
    });
    if (existingEpisode) throw new Error('Episode number already exists for this season');

    const newEpisode = {
        id: uuid.v4(),
        seasonId,
        title: episodeObj.title,
        synopsis: episodeObj.synopsis || null,
        episodeNumber: episodeObj.episodeNumber,
        duration: episodeObj.duration || null,
        episodeUrl: episodeObj.episodeUrl || null,
        coverUrl: episodeObj.coverUrl || null
    };

    const data = await Episodes.create(newEpisode);
    return data;
};

const updateEpisode = async (id, episodeObj) => {
    const [updatedRows] = await Episodes.update(episodeObj, {
        where: { id }
    });

    if (updatedRows > 0) {
        return await Episodes.findByPk(id, {
            include: {
                model: Seasons,
                as: 'season',
                attributes: ['id', 'title']
            }
        });
    }
    return null;
};

const deleteEpisode = async (id) => {
    const deletedRows = await Episodes.destroy({
        where: { id }
    });
    return deletedRows;
};

const findEpisodesBySeason = async (seasonId) => {
    const data = await Episodes.findAll({
        where: { seasonId },
        order: [['episodeNumber', 'ASC']]
    });
    return data;
};

module.exports = {
    findAllEpisodes,
    findEpisodeById,
    createEpisode,
    updateEpisode,
    deleteEpisode,
    findEpisodesBySeason
};