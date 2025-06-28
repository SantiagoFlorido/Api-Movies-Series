require('dotenv').config();

const configs = {
  api: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'https://api-movies-series.onrender.com',
    nodeEnv: process.env.NODE_ENV || 'development',
    secretOrKey: process.env.JWT_SECRET
  },
  db: {
    development: {
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
        schema: 'api'
      },
      searchPath: ['api'],
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    },
    production: {
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
        schema: 'api'
      },
      searchPath: ['api'],
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    },
    testing: {
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'chat-db',
      define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
        schema: 'public'
      },
      searchPath: ['public']
    }
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    apiKey: process.env.API_KEY,
    serviceRoleKey: process.env.SERVICE_ROL_KEY,
    bucket: process.env.BUCKET,
    storageOptions: {
      publicUrl: (filename) => `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.BUCKET}/${filename}`,
      uploadOptions: {
        cacheControl: '3600',
        upsert: false
      }
    }
  }
};

module.exports = configs;