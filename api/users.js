const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const config = require('config');
const config = require('../config/configuration');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post(
  '/',
  [
    // express model validation
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    // check if validation errors were returned
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Object destructuring(part of ES6)
    const { name, email, password } = req.body;

    try {
      // check if user with that email already exists in db
      let emailLowerCase = email.toLowerCase();
      let user = await User.findOne({ email: emailLowerCase });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // create new User object
      user = new User({
        name,
        email: emailLowerCase,
        password
      });

      // take plaintext password and hash it with bcrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // return user paylod
      // only id is needed to fetch user from db in the future so that's what sent
      const payload = {
        user: {
          id: user.id
        }
      };

      // create jwt based on payload
      // expire token(require login again) in 360000
      jwt.sign(
        payload,
        config.jwtSecret,
        {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err;

          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
