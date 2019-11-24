const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const config = require('config');
const config = require('../config/configuration');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');


// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // .select('-password') tells mongo to return object without password
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth
// @desc    Auth user & get token
// @access  Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {

    // check if validation errors were returned
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        // no user was found with that email
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        // the password was not correct
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // return user paylod
        // only id is needed to fetch user from db in the future so that's what sent
        const payload = {
            user: {
                id: user.id
            }
        }

        // create jwt based on payload
        // expire token(require login again) in 360000
        jwt.sign(payload, config.jwtSecret, {
            expiresIn: 360000
        }, (err, token) => {
            if (err) throw err;

            res.json({ token })
        })


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;