const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModels');
const helpers = require('../helpers/helpers');
const dbConfig = require('../config/keys');

module.exports = {
  async CreateUser(req, res) {
    const schema = Joi.object().keys({
      username: Joi.string().min(2).max(15).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(5).required(),
    });

    const { error, value } = Joi.validate(req.body, schema);

    if(error) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json({msg: error.details});
    }

    const userEmail = await User.findOne({email: helpers.lowerCase(req.body.email)});

    if(userEmail) {
      return res.status(HttpStatus.CONFLICT).json({message: 'Email already exists'});
    }

    const userName = await User.findOne({username: helpers.firstUpper(req.body.username)});

    if(userName) {
      return res.status(HttpStatus.CONFLICT).json({message: 'Username already exists'});
    }

    return bcrypt.hash(req.body.password, 10, (err, hash) => {
      if(err) {
        return res.status(HttpStatus.BAD_REQUEST).json({message: 'Error hashing password'});
      }

      const body = {
        username: helpers.firstUpper(req.body.username),
        email: helpers.lowerCase(req.body.email),
        password: hash
      };

      User.create(body)
        .then(user => {
          const token = jwt.sign({data: user}, dbConfig.secret, {
            expiresIn: '1h'
          });

          res.cookie('auth', token);
          res.status(HttpStatus.CREATED).json({message: 'User created successfully', user, token});
        })
        .catch(err => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'});
        });
    });
  },
  async LoginUser(req, res) {
    console.log(req.body);
    if(!req.body.username || !req.body.password) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'No empty fields allowed'});
    }

    await User.findOne({
      username: helpers.firstUpper(req.body.username)}).then(user => {
        if(!user) {
          return res.status(HttpStatus.NOT_FOUND).json({message: 'Username not found'});
        }

        return bcrypt.compare(req.body.password, user.password).then(result => {
          console.log(user.password, result);
          if(!result) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Password is incorrect'});
          }

          const token = jwt.sign({data: user}, dbConfig.secret, {
            expiresIn: '1h'
          });
          res.cookie('auth', token);
          console.log(user);
          return res.status(HttpStatus.OK).json({message: 'Login successful', user, token});
        })
      }).catch(err => {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'});
    });
  }
};