vale, te voy a pasar toda la informacion de mi api con node y express, aqui tienes app.js "const express = require('express')
const cors = require('cors')
const swaggerUI = require('swagger-ui-express')

const swaggerDoc = require('./swagger.json')
const responseHandlers = require('./utils/handleResponses')
const db = require('./utils/database')
const initModels = require('./models/initModels')
const config = require('../config').api

const userRouter = require('./users/users.router')
const authRouter = require('./auth/auth.router')
const seriesRouter = require('./series/series.router')
const serieGenresRouter = require('./serie_genres/serie_genres.router')
const seasonsRouter  = require('./seasons/seasons.router')
const moviesRouter = require('./movies/movies.router')
const moviesGenresRouter = require('./movies/movies.router')
const genresRouter = require('./genres/genres.router')
const episodesRouter = require('./episodes/episodes.router')

const app = express()

app.use(express.json())

app.use(cors())

db.authenticate()
    .then(() => console.log('Database authenticated'))
    .catch(err => console.log(err))

db.sync()
    .then(() => console.log('Database Synced'))
    .catch(err => console.log(err))

initModels()

app.get('/', (req, res) => {
    responseHandlers.success({
        res,
        status: 200,
        message: 'Servidor inicializado correctamente',
        data: {
            "users": `${config.host}/api/v1/users`
        }
    })
})


app.use('/api/v1/users', userRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/series', seriesRouter)
app.use('/api/v1/seriegenres', serieGenresRouter)
app.use('/api/v1/seasons', seasonsRouter )
app.use('/api/v1/movies', moviesRouter)
app.use('/api/v1/moviesgenres', moviesGenresRouter)
app.use('/api/v1/genres', genresRouter)
app.use('/api/v1/episodes', episodesRouter)
app.use('/api/v1/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc))


//? Esta debe ser la ultima ruta en mi app
app.use('*', (req, res)=> {
    responseHandlers.error({
        res,
        status: 404,
        message: `URL not found, please try with ${config.host}`,
    })
})

app.listen(config.port ,() => {
    console.log(`Server started at port ${config.port}`)
})
", aqui tienes initmodels.js "const Users = require("./users.models"); 
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
", aqui tienes cada uno de los modelos "const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const Episodes = db.define("episodes", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  synopsis: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seasonId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  episodeNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1
    }
  },
  episodeUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  coverUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  }
}, {
  tableName: 'episodes'
});

module.exports = Episodes;", "const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const Genres = db.define("genres", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100]
    }
  }
}, {
  tableName: 'genres'
});

module.exports = Genres;
", "const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const MovieGenres = db.define("movie_genres", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  movieId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  genreId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'movie_genres'
});

module.exports = MovieGenres;
", "const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const Movies = db.define("movies", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  synopsis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  releaseYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1878 // primer año de cine
    }
  },
  director: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [2, 100]
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1
    }
  },
  trailerUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  coverUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  movieUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  classification: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [1, 50]
    }
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      isFloat: true,
      min: 0,
      max: 10
    }
  }
}, {
  tableName: 'movies'
});

module.exports = Movies;
". "const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const Seasons = db.define("seasons", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  serieId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  seasonNumber: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1
    }
  },
  releaseYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1878
    }
  },
  coverUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  trailerUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  }
}, {
  tableName: 'seasons'
});

module.exports = Seasons;
". "const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const SerieGenres = db.define("serie_genres", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  serieId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  genreId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'serie_genres'
});

module.exports = SerieGenres;
", "const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const Series = db.define("series", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  synopsis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  releaseYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1878
    }
  },
  director: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [2, 100]
    }
  },
  classification: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [1, 50]
    }
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      isFloat: true,
      min: 0,
      max: 10
    }
  }
}, {
  tableName: 'series'
});

module.exports = Series;
", "const { DataTypes } = require("sequelize");

const db = require("../utils/database");

const Users = db.define("users", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len:[2, 50]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len:[2, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate:{
      isEmail: true,
    },
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'normal'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  }
}, {
  tableName: 'users'
});

module.exports = Users;
", aqui tienes cada uno de los routers por modelo, claro cada uno de estos tiene sus services y controllers, pero asumo que para lo que te voy a pedir solo necesitaras los routers "const router = require('express').Router()
const userServices = require('./users.services')
const passportJwt = require('../middlewares/auth.middleware')
const upload = require('../utils/multer') // Assuming you have a multer configuration file

router.get('/', userServices.getAllUsers)
router.post('/', upload.single('profileImage'), userServices.postNewUser)

// Protected routes (require authentication)
router.get('/me', passportJwt, userServices.getMyUser)
router.patch('/me', passportJwt, upload.single('profileImage'), userServices.patchMyUser)
router.delete('/me', passportJwt, userServices.deleteMyUser)

// Admin routes (could add admin middleware later)
router.get('/:id', passportJwt, userServices.getUserById)
router.patch('/:id', passportJwt, upload.single('profileImage'), userServices.patchUser)
router.delete('/:id', passportJwt, userServices.deleteUser)

module.exports = router", "const router = require('express').Router()
const seriesServices = require('./series.services')
const passportJwt = require('../middlewares/auth.middleware')

// Main routes
router.route('/')
  .get(seriesServices.getAllSeries)
  .post(passportJwt, seriesServices.postNewSerie)

// Routes with ID parameter
router.route('/:id')
  .get(seriesServices.getSerieById)
  .patch(passportJwt, seriesServices.patchSerie)
  .delete(passportJwt, seriesServices.deleteSerie)

// Genre management routes
router.route('/:id/genres')
  .post(passportJwt, seriesServices.postGenreToSerie)

router.route('/:id/genres/:genreId')
  .delete(passportJwt, seriesServices.deleteGenreFromSerie)

module.exports = router", "const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const serieGenresServices = require('./serie_genres.services')

// Main routes for serie-genre relationships
router.route('/series/:id/genres')
  .get(serieGenresServices.getGenresBySerie) // Get all genres for a serie
  .post(passportJwt, serieGenresServices.addGenre) // Add genre to serie

router.route('/series/:id/genres/:genreId')
  .delete(passportJwt, serieGenresServices.removeGenre) // Remove genre from serie

// Additional query routes
router.route('/genres/:genreId/series')
  .get(serieGenresServices.getSeriesByGenre) // Get all series for a genre

module.exports = router", "const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const seasonsServices = require('./seasons.services')

// Main routes
router.route('/')
  .get(seasonsServices.getAllSeasons) // Get all seasons (optional ?serieId=)

// Season-specific routes
router.route('/:id')
  .get(seasonsServices.getSeasonById) // Get specific season
  .patch(passportJwt, seasonsServices.patchSeason) // Update season
  .delete(passportJwt, seasonsServices.deleteSeason) // Delete season

// Series-related season routes
router.route('/series/:serieId/seasons')
  .get(seasonsServices.getSeasonsBySerie) // Get all seasons for a series
  .post(passportJwt, seasonsServices.postNewSeason) // Create new season for series

module.exports = router", "const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const moviesServices = require('./movies.services')
const upload = require('../utils/multer') // Para manejar subida de archivos

// Rutas principales de películas
router.route('/')
  .get(moviesServices.getAllMovies) // Obtener todas las películas
  .post(
    passportJwt,
    upload.fields([
      { name: 'coverUrl', maxCount: 1 },
      { name: 'trailerUrl', maxCount: 1 },
      { name: 'movieUrl', maxCount: 1 }
    ]),
    moviesServices.postNewMovie
  ) // Crear nueva película

// Rutas para película específica
router.route('/:id')
  .get(moviesServices.getMovieById) // Obtener película por ID
  .patch(
    passportJwt,
    upload.fields([
      { name: 'coverUrl', maxCount: 1 },
      { name: 'trailerUrl', maxCount: 1 },
      { name: 'movieUrl', maxCount: 1 }
    ]),
    moviesServices.patchMovie
  ) // Actualizar película
  .delete(passportJwt, moviesServices.deleteMovie) // Eliminar película

// Rutas para gestión de géneros
router.route('/:id/genres')
  .post(passportJwt, moviesServices.postGenreToMovie) // Añadir género a película

router.route('/:id/genres/:genreId')
  .delete(passportJwt, moviesServices.deleteGenreFromMovie) // Eliminar género de película

module.exports = router", "const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const movieGenresServices = require('./movie_genres.services')

// Movie-Genre Relationship Routes
router.route('/movies/:id/genres')
  .get(movieGenresServices.getGenresByMovie) // GET /api/v1/movies/:id/genres
  .post(passportJwt, movieGenresServices.postGenreToMovie) // POST /api/v1/movies/:id/genres

router.route('/movies/:id/genres/:genreId')
  .delete(passportJwt, movieGenresServices.deleteGenreFromMovie) // DELETE /api/v1/movies/:id/genres/:genreId

// Genre-Movie Relationship Routes
router.route('/genres/:genreId/movies')
  .get(movieGenresServices.getMoviesByGenre) // GET /api/v1/genres/:genreId/movies

module.exports = router", "const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const genresServices = require('./genres.services')

// Main genres routes
router.route('/')
  .get(genresServices.getAllGenres) // GET /api/v1/genres
  .post(passportJwt, genresServices.postNewGenre) // POST /api/v1/genres

// Single genre routes
router.route('/:id')
  .get(genresServices.getGenreById) // GET /api/v1/genres/:id
  .patch(passportJwt, genresServices.patchGenre) // PATCH /api/v1/genres/:id
  .delete(passportJwt, genresServices.deleteGenre) // DELETE /api/v1/genres/:id

// Genre relationships routes
router.route('/:genreId/movies')
  .get(genresServices.getMoviesByGenre) // GET /api/v1/genres/:genreId/movies

router.route('/:genreId/series')
  .get(genresServices.getSeriesByGenre) // GET /api/v1/genres/:genreId/series

module.exports = router", "const router = require('express').Router()
const passportJwt = require('../middlewares/auth.middleware')
const episodesServices = require('./episodes.services')
const upload = require('../utils/multer')

// Main episodes routes
router.route('/')
  .get(episodesServices.getAllEpisodes) // GET /api/v1/episodes

router.route('/:id')
  .get(episodesServices.getEpisodeById) // GET /api/v1/episodes/:id
  .patch(
    passportJwt,
    upload.fields([
      { name: 'coverUrl', maxCount: 1 },
      { name: 'episodeUrl', maxCount: 1 }
    ]),
    episodesServices.patchEpisode
  ) // PATCH /api/v1/episodes/:id
  .delete(passportJwt, episodesServices.deleteEpisode) // DELETE /api/v1/episodes/:id

// Season-episodes routes
router.route('/seasons/:seasonId/episodes')
  .get(episodesServices.getEpisodesBySeason) // GET /api/v1/seasons/:seasonId/episodes
  .post(
    passportJwt,
    upload.fields([
      { name: 'coverUrl', maxCount: 1 },
      { name: 'episodeUrl', maxCount: 1 }
    ]),
    episodesServices.postNewEpisode
  ) // POST /api/v1/seasons/:seasonId/episodes

module.exports = router", "const router = require('express').Router()

const postLogin = require('./auth.services')

router.post('/login', postLogin)

module.exports = router
", estas son las utils de mi api "const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'ApiMovies'
    });
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    throw err;
  }
};

module.exports = {
  uploadImage
};
", "const bcrypt = require('bcrypt')

const hashPassword = (plainPassword) => {
    return bcrypt.hashSync(plainPassword, 10)
}

//? Retornar un booleano 
const comparePassword = (plainPassword, hashedPassword) => {
    return bcrypt.compareSync(plainPassword, hashedPassword)
}

// console.log(hashPassword('root'))

// console.log(comparePassword('root', '$2b$10$w1o5/RIHUoJGT3IMqGXaoedd7xqRT5yyTg1oMwrHC4vxCBIAmPT7S'))

module.exports = {
    hashPassword,
    comparePassword
}
", "const {Sequelize} = require('sequelize')

const config = require('../../config')

const db = new Sequelize(config.db[config.api.nodeEnv])

module.exports = db", "//* {
//*     error: false,
//*     status: 201,
//*     message: 'User created Succesfully',
//*     data: {
//*         id: 5,
//*         firstName: 'Sahid',
//*         ...
//*     }
//* }

//? Para respuestas exitosas
const success = ({status, data, message, res}) => {
    res.status(status).json({
        error: false,
        status: status,
        message: message,
        data: data
    })
} 



//? Para respuestas de errores
const error = ({status, data, message, res, fields}) => {
    res.status(status).json({
        error: true,
        status: status,
        message: message,
        fields: fields,
        data
    })
}

module.exports = {
    success,
    error
}

//? Error de conexion
//? Not Found
//? Errores de Sintaxis
//? Errores al hacer las peticiones creacionales

//* Ejemplos de usos en los servicios:
/*
const getAllProducts = (req, res) => {
    findAllProcts()
        .then(data => {
            success({
                res,
                data,
                status: 200,
                message: 'All products collected succesfully'
            })
        })
        .catch(err => {
            error({
                res,
                data: err,
                status: 400,
                message: 'Se produjo un error al mostrar todos los productos',
            })
        })
}

const getProductById = (req, res) => {
    findProductById(id)
        .then(data => {
            if(data){
                success({
                    res,
                    data,
                    status: 200,
                    message: 'Product with id' + data.id
                })
            } else {
                error({
                    res,
                    status: 404,
                    message: 'Producto no encontrado'
                })
            }
        })
        .catch(err => {
            error({
                res,
                data: err,
                status: 400,
                message: 'Se produjo un error al mostrar un producto',
            })
        })
}
*/", "const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('Only image files are allowed!'))
  }
})

module.exports = upload", aqui tienes config.js "require('dotenv').config();

const configs = {
  api: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
    secretOrKey: process.env.JWT_SECRET
  },
  db: {
    development: {
      dialect: 'postgres',
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      define: {
        timestamps:    true,
        underscored:   true,
        underscoredAll: true,
        schema:        'api'          
      },
      searchPath: ['api'],            
      dialectOptions: {
        ssl: {
          require:           true,
          rejectUnauthorized: false
        }
      }
    },
    production: {
      dialect: 'postgres',
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      define: {
        timestamps:    true,
        underscored:   true,
        underscoredAll: true,
        schema:        'api'
      },
      searchPath: ['api'],
      dialectOptions: {
        ssl: {
          require:           true,
          rejectUnauthorized: false
        }
      }
    },
    testing: {
      dialect: 'postgres',
      host:     'localhost',
      port:     5432,
      username: 'postgres',
      password: 'root',
      database: 'chat-db',
      define: {
        timestamps:    true,
        underscored:   true,
        underscoredAll: true,
        schema:        'public'
      },
      searchPath: ['public']
    }
  }
};

module.exports = configs;
", y estas son las variables de entorno "PORT=9000
HOST=http://localhost:9000
NODE_ENV=production
JWT_SECRET=SantiagoF

DB_HOST=ep-empty-wave-a59mxn10-pooler.us-east-2.aws.neon.tech
DB_PORT=5432
DB_USER=neondb_owner
DB_PASSWORD=npg_mcWQLhTC3g7X
DB_NAME=apidb-movies

# Cloudinary
CLOUD_NAME=dufzsv87k
CLOUD_API_KEY=137529776866811
CLOUD_API_SECRET=Suj7eU8KOfoz7ft88rRsmrGr13M
", este es el package.json "{
  "name": "moviesAPI",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cloudinary": "^2.7.0",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^2.0.1",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.16.2",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.37.7",
    "swagger-ui-express": "^5.0.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
", este es auth.middleware.js "//? Importamos de passport-jwt las 2 cositas de aqui abajo
const { ExtractJwt, Strategy } = require('passport-jwt')
//? Importamos de passport el core completo
const passport = require('passport')

//? Importamos nuestro controlador que nos va a permitir validar si el usuario existe en mi db
const { findUserById } = require('../users/users.controllers')
const config = require('../../config').api
 
//? Generamos configuraciones basicas para manejar passport con jwt
const passportConfigs = {
    //? Esta configuracion lo que hace es extraer el Bearer Token de mi peticion
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //? 
    secretOrKey: config.secretOrKey
}


//? done()
passport.use(new Strategy(passportConfigs, (tokenDecoded, done) => {
    findUserById(tokenDecoded.id)
        .then(data => {
            if(data){
               done(null, tokenDecoded) //? El usuario si Existe y es valido
            } else {
               done(null, false, {message: 'Token Incorrect'}) //? El usuario no existe
            }
        })
        .catch(err => {
            done(err, false) //? Error en la base de datos
        })
}))

module.exports = passport.authenticate('jwt', {session: false})",  vale ahora con toda esa informacion de mi api quiero que me hagas por completo toda la documentacion para mi archivo llamado "swagger.json"