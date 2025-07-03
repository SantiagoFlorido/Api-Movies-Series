const Movies = require('../models/movies.models');
const Genres = require('../models/genres.models');
const MovieGenres = require('../models/MovieGenres.models');
const uuid = require('uuid');
const { uploadFile } = require('../utils/supabase'); // Importar función de Supabase

const findAllMovies = async (genreId = null) => {
    const options = {
        include: [{
            model: Genres,
            as: 'genres',
            attributes: ['id', 'name'],
            through: { attributes: [] }
        }],
        order: [['releaseYear', 'DESC']]
    };

    if (genreId) {
        options.include[0].where = { id: genreId };
    }

    const data = await Movies.findAll(options);
    return data;
};

const findMovieById = async (id) => {
    const data = await Movies.findOne({
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

const createMovie = async (movieObj, files = {}) => {
    // Procesar archivos subidos
    let coverUrl = null;
    let trailerUrl = null;
    let movieUrl = null;

    try {
        // Subir archivos a Supabase en paralelo
        const uploadPromises = [];
        
        if (files.coverUrl) {
            uploadPromises.push(
                uploadFile(files.coverUrl[0], { 
                    folder: 'movies/covers',
                    contentType: files.coverUrl[0].mimetype 
                }).then(url => { coverUrl = url; })
            );
        }
        
        if (files.trailerUrl) {
            uploadPromises.push(
                uploadFile(files.trailerUrl[0], { 
                    folder: 'movies/trailers',
                    contentType: files.trailerUrl[0].mimetype 
                }).then(url => { trailerUrl = url; })
            );
        }
        
        if (files.movieUrl) {
            uploadPromises.push(
                uploadFile(files.movieUrl[0], { 
                    folder: 'movies/videos',
                    contentType: files.movieUrl[0].mimetype 
                }).then(url => { movieUrl = url; })
            );
        }

        // Esperar a que todas las subidas se completen
        await Promise.all(uploadPromises);

        // Crear el objeto de película
        const newMovie = {
            id: uuid.v4(),
            title: movieObj.title,
            synopsis: movieObj.synopsis || null,
            releaseYear: movieObj.releaseYear || null,
            director: movieObj.director || null,
            duration: movieObj.duration || null,
            trailerUrl: trailerUrl,
            coverUrl: coverUrl,
            movieUrl: movieUrl,
            classification: movieObj.classification || null,
            rating: movieObj.rating || null
        };

        const data = await Movies.create(newMovie);
        
        // Añadir géneros si se proporcionaron
        if (movieObj.genres && movieObj.genres.length > 0) {
            await data.addGenres(movieObj.genres);
        }
        
        return data;

    } catch (error) {
        // Limpiar archivos subidos si hay un error
        const cleanupPromises = [];
        if (coverUrl) cleanupPromises.push(deleteFile(coverUrl));
        if (trailerUrl) cleanupPromises.push(deleteFile(trailerUrl));
        if (movieUrl) cleanupPromises.push(deleteFile(movieUrl));
        
        await Promise.allSettled(cleanupPromises);
        throw error;
    }
};

const updateMovie = async (id, movieObj, files = {}) => {
    const movie = await Movies.findByPk(id);
    if (!movie) {
        throw new Error('Movie not found');
    }

    // Procesar archivos subidos
    let coverUrl = movie.coverUrl;
    let trailerUrl = movie.trailerUrl;
    let movieUrl = movie.movieUrl;

    try {
        const uploadPromises = [];
        const oldUrlsToDelete = [];
        
        if (files.coverUrl) {
            if (movie.coverUrl) oldUrlsToDelete.push(movie.coverUrl);
            uploadPromises.push(
                uploadFile(files.coverUrl[0], { 
                    folder: 'movies/covers',
                    contentType: files.coverUrl[0].mimetype 
                }).then(url => { coverUrl = url; })
            );
        }
        
        if (files.trailerUrl) {
            if (movie.trailerUrl) oldUrlsToDelete.push(movie.trailerUrl);
            uploadPromises.push(
                uploadFile(files.trailerUrl[0], { 
                    folder: 'movies/trailers',
                    contentType: files.trailerUrl[0].mimetype 
                }).then(url => { trailerUrl = url; })
            );
        }
        
        if (files.movieUrl) {
            if (movie.movieUrl) oldUrlsToDelete.push(movie.movieUrl);
            uploadPromises.push(
                uploadFile(files.movieUrl[0], { 
                    folder: 'movies/videos',
                    contentType: files.movieUrl[0].mimetype 
                }).then(url => { movieUrl = url; })
            );
        }

        await Promise.all(uploadPromises);

        // Actualizar la película
        const updatedMovie = {
            title: movieObj.title || movie.title,
            synopsis: movieObj.synopsis !== undefined ? movieObj.synopsis : movie.synopsis,
            releaseYear: movieObj.releaseYear !== undefined ? movieObj.releaseYear : movie.releaseYear,
            director: movieObj.director !== undefined ? movieObj.director : movie.director,
            duration: movieObj.duration !== undefined ? movieObj.duration : movie.duration,
            trailerUrl: trailerUrl,
            coverUrl: coverUrl,
            movieUrl: movieUrl,
            classification: movieObj.classification !== undefined ? movieObj.classification : movie.classification,
            rating: movieObj.rating !== undefined ? movieObj.rating : movie.rating
        };

        const [updatedRows] = await Movies.update(updatedMovie, { where: { id } });

        // Eliminar archivos antiguos si se subieron nuevos
        if (oldUrlsToDelete.length > 0) {
            await Promise.allSettled(
                oldUrlsToDelete.map(url => deleteFile(url))
            );
        }

        // Actualizar géneros si se proporcionaron
        if (movieObj.genres !== undefined) {
            await movie.setGenres(movieObj.genres || []);
        }
        
        return await Movies.findByPk(id, {
            include: [{
                model: Genres,
                as: 'genres',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }]
        });

    } catch (error) {
        // Limpiar archivos subidos si hay un error
        const cleanupPromises = [];
        if (files.coverUrl && coverUrl !== movie.coverUrl) cleanupPromises.push(deleteFile(coverUrl));
        if (files.trailerUrl && trailerUrl !== movie.trailerUrl) cleanupPromises.push(deleteFile(trailerUrl));
        if (files.movieUrl && movieUrl !== movie.movieUrl) cleanupPromises.push(deleteFile(movieUrl));
        
        await Promise.allSettled(cleanupPromises);
        throw error;
    }
};

const deleteMovie = async (id) => {
    const movie = await Movies.findByPk(id);
    if (!movie) {
        throw new Error('Movie not found');
    }

    // Eliminar archivos asociados
    const deletePromises = [];
    if (movie.coverUrl) deletePromises.push(deleteFile(movie.coverUrl));
    if (movie.trailerUrl) deletePromises.push(deleteFile(movie.trailerUrl));
    if (movie.movieUrl) deletePromises.push(deleteFile(movie.movieUrl));

    await Promise.allSettled(deletePromises);

    // Eliminar la película
    const deletedRows = await Movies.destroy({ where: { id } });
    return deletedRows;
};

const addGenreToMovie = async (movieId, genreId) => {
    const existingRelation = await MovieGenres.findOne({
        where: { movie_id: movieId, genre_id: genreId }
    });

    if (existingRelation) {
        throw new Error('This genre is already associated with the movie');
    }

    const data = await MovieGenres.create({
        id: uuid.v4(),
        movie_id: movieId,
        genre_id: genreId
    });
    return data;
};

const removeGenreFromMovie = async (movieId, genreId) => {
    const deletedRows = await MovieGenres.destroy({
        where: { movie_id: movieId, genre_id: genreId }
    });
    if (deletedRows === 0) {
        throw new Error('Genre not found in this movie');
    }
    return deletedRows;
};

module.exports = {
    findAllMovies,
    findMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    addGenreToMovie,
    removeGenreFromMovie
};