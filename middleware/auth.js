const jwt = require('jsonwebtoken');
// const config = require('config');
const config = require('../config/configuration');

/* 
    Middleware that is to be called for all protected routes
*/


module.exports = function (req, res, next) {

    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);

        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not vlaid' })
    }
}