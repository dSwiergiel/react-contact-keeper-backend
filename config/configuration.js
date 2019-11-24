// for .env files
require('dotenv').config();

const configuration = {
    jwtSecret: process.env.JWT_SECRET,
    mongoURI: process.env.MONGO_URI
}

module.exports = configuration;