const multer = require('multer');

const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            status: 400,
            message: err.message,
            code: err.code,
            field: err.field
        });
    } else if (err) {
        return res.status(400).json({
            status: 400,
            message: err.message
        });
    }
    next();
};

module.exports = multerErrorHandler;