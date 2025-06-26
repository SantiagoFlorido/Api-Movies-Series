const Users = require("./users.models"); 
const Movies = require("./movies.models");
const Series = require("./series.models");
const Seasons = require("./seasons.models");
const Episodes = require("./episodes.models");
const Genres = require("./genres.models");
const MovieGenres = require("./MovieGenres.models");
const SerieGenres = require("./SerieGenres.models");

const initModels = () => {
  // Movies ↔ Genres
  Movies.belongsToMany(Genres, {
    through: MovieGenres,
    foreignKey: 'movie_id',
    otherKey: 'genre_id',
    as: 'genres'          // <- opcional para nombrar la asociación
  });
  Genres.belongsToMany(Movies, {
    through: MovieGenres,
    foreignKey: 'genre_id',
    otherKey: 'movie_id',
    as: 'movies'
  });

  // Series ↔ Genres
  Series.belongsToMany(Genres, {
    through: SerieGenres,
    foreignKey: 'serie_id',
    otherKey: 'genre_id',
    as: 'genres'
  });
  Genres.belongsToMany(Series, {
    through: SerieGenres,
    foreignKey: 'genre_id',
    otherKey: 'serie_id',
    as: 'series'
  });

  // Series → Seasons → Episodes
  Series.hasMany(Seasons, { foreignKey: 'serie_id', as: 'seasons' });
  Seasons.belongsTo(Series, { foreignKey: 'serie_id', as: 'series' });

  Seasons.hasMany(Episodes, { foreignKey: 'season_id', as: 'episodes' });
  Episodes.belongsTo(Seasons, { foreignKey: 'season_id', as: 'season' });
};

module.exports = initModels;
