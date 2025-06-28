const { body, validationResult, param } = require('express-validator');
const { allowedImageTypes } = require('../utils/multer');

// Validaciones comunes reutilizables
const nameValidation = (field) => 
  body(field)
    .trim()
    .notEmpty().withMessage(`${field} is required`)
    .isLength({ min: 2, max: 50 }).withMessage(`${field} must be between 2-50 characters`)
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/).withMessage(`${field} contains invalid characters`);

const emailValidation = () =>
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail();

const passwordValidation = () =>
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character');

// Validaciones para usuarios
const validateUserData = [
  nameValidation('firstName'),
  nameValidation('lastName'),
  emailValidation(),
  body('password')
    .optional()
    .custom(passwordValidation),
  body('gender')
    .optional()
    .trim()
    .isIn(['male', 'female', 'other', 'prefer not to say']).withMessage('Invalid gender value'),
  body('birthday')
    .optional()
    .isISO8601().withMessage('Invalid date format (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 120);
      
      if (birthDate > new Date()) {
        throw new Error('Birth date cannot be in the future');
      }
      if (birthDate < minDate) {
        throw new Error('Age must be less than 120 years');
      }
      return true;
    }),
  body('profileImage')
    .optional()
    .custom((value, { req }) => {
      if (req.file) {
        if (!allowedImageTypes.includes(req.file.mimetype)) {
          throw new Error(`Invalid file type. Only ${allowedImageTypes.join(', ')} are allowed`);
        }
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];

// Validaciones para IDs
const validateIdParam = [
  param('id')
    .trim()
    .notEmpty().withMessage('ID is required')
    .isUUID().withMessage('Invalid ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validaciones para actualización de usuario
const validateUserUpdate = [
  param('id')
    .optional()
    .isUUID().withMessage('Invalid ID format'),
  nameValidation('firstName').optional(),
  nameValidation('lastName').optional(),
  emailValidation().optional(),
  passwordValidation().optional(),
  body('gender')
    .optional()
    .trim()
    .isIn(['male', 'female', 'other', 'prefer not to say']).withMessage('Invalid gender value'),
  body('birthday')
    .optional()
    .isISO8601().withMessage('Invalid date format (YYYY-MM-DD)'),
  body('profileImage')
    .optional()
    .custom((value, { req }) => {
      if (req.file) {
        if (!allowedImageTypes.includes(req.file.mimetype)) {
          throw new Error(`Invalid file type. Only ${allowedImageTypes.join(', ')} are allowed`);
        }
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateUserData,
  validateIdParam,
  validateUserUpdate,
  nameValidation,
  emailValidation,
  passwordValidation
};