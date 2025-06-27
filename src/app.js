const express = require('express');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');

const swaggerDoc = require('./swagger.json');
const responseHandlers = require('./utils/handleResponses');
const db = require('./utils/database');
const initModels = require('./models/initModels');
const config = require('../config').api;
const multerErrorHandler = require('./middlewares/multerErrorHandle');

const userRouter = require('./users/users.router');
const authRouter = require('./auth/auth.router');
const seriesRouter = require('./series/series.router');
const serieGenresRouter = require('./serie_genres/serie_genres.router');
const seasonsRouter = require('./seasons/seasons.router');
const moviesRouter = require('./movies/movies.router');
const moviesGenresRouter = require('./movies/movies.router');
const genresRouter = require('./genres/genres.router');
const episodesRouter = require('./episodes/episodes.router');
const cloudinaryTestRouter = require('./cloudinaryTest/cloudinaryTest.router');

const app = express();

// Configuración del directorio de uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(uploadDir));

// Autenticación y sincronización de la base de datos
db.authenticate()
    .then(() => console.log('Database authenticated'))
    .catch(err => console.log(err));

db.sync()
    .then(() => console.log('Database Synced'))
    .catch(err => console.log(err));

initModels();

// Ruta de inicio con documentación de endpoints
app.get('/', (req, res) => {
    responseHandlers.success({
        res,
        status: 200,
        message: 'Servidor inicializado correctamente',
        data: {
            "users": {
                "getAllUsers - Obtiene todos los usuarios registrados": `${config.host}/api/v1/users`,
                "getUserById - Obtiene un usuario específico por ID": `${config.host}/api/v1/users/:id`,
                "getMyUser - Obtiene la información del usuario autenticado": `${config.host}/api/v1/users/me`
            },
            "auth": {
                "login - Autentica un usuario y devuelve un token JWT": `${config.host}/api/v1/auth/login`
            },
            "series": {
                "getAllSeries - Obtiene todas las series disponibles": `${config.host}/api/v1/series`,
                "getSerieById - Obtiene una serie específica por ID": `${config.host}/api/v1/series/:id`,
                "getSeriesByGenre - Obtiene series por género": `${config.host}/api/v1/genres/:genreId/series`
            },
            "seriegenres": {
                "getGenresBySerie - Obtiene los géneros de una serie específica": `${config.host}/api/v1/seriegenres/series/:id/genres`,
                "getSeriesByGenre - Obtiene series asociadas a un género específico": `${config.host}/api/v1/seriegenres/genres/:genreId/series`
            },
            "seasons": {
                "getAllSeasons - Obtiene todas las temporadas": `${config.host}/api/v1/seasons`,
                "getSeasonById - Obtiene una temporada específica por ID": `${config.host}/api/v1/seasons/:id`,
                "getSeasonsBySerie - Obtiene temporadas de una serie específica": `${config.host}/api/v1/seasons/series/:serieId/seasons`
            },
            "movies": {
                "getAllMovies - Obtiene todas las películas": `${config.host}/api/v1/movies`,
                "getMovieById - Obtiene una película específica por ID": `${config.host}/api/v1/movies/:id`,
                "getMoviesByGenre - Obtiene películas por género": `${config.host}/api/v1/genres/:genreId/movies`
            },
            "moviesgenres": {
                "getGenresByMovie - Obtiene los géneros de una película específica": `${config.host}/api/v1/moviesgenres/movies/:id/genres`,
                "getMoviesByGenre - Obtiene películas asociadas a un género específico": `${config.host}/api/v1/moviesgenres/genres/:genreId/movies`
            },
            "genres": {
                "getAllGenres - Obtiene todos los géneros disponibles": `${config.host}/api/v1/genres`,
                "getGenreById - Obtiene un género específico por ID": `${config.host}/api/v1/genres/:id`,
                "getSeriesByGenre - Obtiene series asociadas a un género": `${config.host}/api/v1/genres/:genreId/series`,
                "getMoviesByGenre - Obtiene películas asociadas a un género": `${config.host}/api/v1/genres/:genreId/movies`
            },
            "episodes": {
                "getAllEpisodes - Obtiene todos los episodios": `${config.host}/api/v1/episodes`,
                "getEpisodeById - Obtiene un episodio específico por ID": `${config.host}/api/v1/episodes/:id`,
                "getEpisodesBySeason - Obtiene episodios de una temporada específica": `${config.host}/api/v1/episodes/seasons/:seasonId/episodes`
            },
            "documentation": {
                "swaggerUI - Documentación interactiva de la API": `${config.host}/api/v1/docs`
            }
        }
    });
});

// Rutas de la API
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/series', seriesRouter);
app.use('/api/v1/seriegenres', serieGenresRouter);
app.use('/api/v1/seasons', seasonsRouter);
app.use('/api/v1/movies', moviesRouter);
app.use('/api/v1/moviesgenres', moviesGenresRouter);
app.use('/api/v1/genres', genresRouter);
app.use('/api/v1/episodes', episodesRouter);
app.use('/api/v1/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
app.use('/api/v1/test/cloudinary', cloudinaryTestRouter);

// Middleware para manejar errores de Multer
app.use(multerErrorHandler);

// Ruta para manejar 404
app.use('*', (req, res) => {
    responseHandlers.error({
        res,
        status: 404,
        message: `URL not found, please try with ${config.host}`,
    });
});

// Iniciar servidor
app.listen(config.port, () => {
    console.log(`Server started at port ${config.port}`);
    console.log(`Uploads directory: ${uploadDir}`);
});

module.exports = app;