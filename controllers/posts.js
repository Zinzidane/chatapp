const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const cloudinary = require('cloudinary');
const request = require('request');

const Post = require('../models/postModels');
const User = require('../models/userModels');
const keys = require('../config/keys');

cloudinary.config({ 
  cloud_name: keys.cloud_name, 
  api_key: keys.api_key, 
  api_secret: keys.api_secret
});

module.exports = {
  AddPost(req, res) {
    const schema = Joi.object().keys({
      username: Joi.string().required()
    });

    const body = {
      post: req.body.post
    };

    const {error} = Joi.validate(body, schema);

    if(error & error.details) {
      return res.status(HttpStatus.BAD_REQUEST).json({msg: error.details});
    }

    const postBody = {
      user: req.user._id,
      username: req.user.username,
      post: req.body.post,
      created: new Date()
    };
    
    if(req.body.post && !req.body.image) {
      Post.create(postBody).then(async (post) => {
        // Updating post in posts array in database for this user
        await User.update({
          _id: req.user._id
        }, {
          $push: {posts: {
            postId: post._id,
            post: req.body.post,
            created: new Date()
          }}
        });
        res.status(HttpStatus.OK).json({message: 'Post created', post});
      }).catch(err => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'});
      });
    }

    if(req.body.post && req.body.image) {
      cloudinary.v2.uploader.upload(req.body.image, async (error, result) => {
        const reqBody = {
          user: req.user._id,
          username: req.user.username,
          post: req.body.post,
          imgVersion: result.version,
          imgId: result.public_id,
          created: new Date()
        };

        Post.create(reqBody).then(async (post) => {
          // Updating post in posts array in database for this user
          await User.update({
            _id: req.user._id
          }, {
            $push: {posts: {
              postId: post._id,
              post: req.body.post,
              created: new Date()
            }}
          });
          res.status(HttpStatus.OK).json({message: 'Post created', post});
        }).catch(err => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'});
        });
      });
    }

  },
  async GetAllPosts(req, res) {
    try {

      const posts = await Post.find({})
        .populate('user')
        .sort({created: -1})
        .skip(+req.query.offset)
        .limit(+req.query.limit);

      const user = await User.findOne({
        _id: req.user._id
      });
      if(!user.city || !user.country) {
        request('https://geoip-db.com/json/', {json: true}, async (err, res, body) => {
          await User.update({
            _id: req.user._id
          }, {
            city: body.city,
            country: body.country_name
          });
        }); 
      }

      // Get top posts
      const top = await Post.find({
        totalLikes: {$gte: 2}
      })
        .populate('user')
        .sort({totalLikes: -1})
        .skip(+req.query.offset)
        .limit(+req.query.limit);

      return res.status(HttpStatus.OK).json({message: 'All posts', posts, top});
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'});
    }
  },
  async AddLike(req, res) {
    const postId = req.body._id;
    await Post.updateOne({
        _id: postId,
        // To like only once by one user
        "likes.username": {$ne: req.user.username}
      }, {
        $push: { likes: {
          username: req.user.username
        }},
        $inc: { totalLikes: 1 }
      })
      .then(() => res.status(HttpStatus.OK).json({message: 'You liked the post'}))
      .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'}));
  },
  async RemoveLike(req, res) {
    const postId = req.body._id;
    await Post.updateOne({
        _id: postId,
        // To remove like only if user liked the post before
        "likes.username": {$eq: req.user.username}
      }, {
        $pull: { likes: {
          username: req.user.username
        }},
        $inc: { totalLikes: -1 }
      })
      .then(() => res.status(HttpStatus.OK).json({message: 'You unliked the post'}))
      .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'}));
  },
  async AddComment(req, res) {
    const postId = req.body.postId;
    await Post.update({
      _id: postId
    }, {
      $push: { comments: {
        userId: req.user._id,
        username: req.user.username,
        comment: req.body.comment,
        createdAt: new Date()
      }}
    })
    .then(() => res.status(HttpStatus.OK).json({message: 'Comment added the post'}))
    .catch(err => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'}));
  },
  async GetPost(req, res) {
    console.log(req.params.id);
    await Post.findOne({_id: req.params.id})
      .populate('user')
      .populate('comments.userId')
      .then(post => res.status(HttpStatus.OK).json({message: 'Post found', post}))
      .catch(err => res.status(HttpStatus.NOT_FOUND).json({message: 'Post not found'}))
  },
  async DeletePost(req, res) {
 
    const {id} = req.params;
    console.log(id);
    try {
      const result = await Post.findOneAndDelete({_id:id});
      console.log(result);

      if(!result) {
        return res.status(HttpStatus.NOT_FOUND).json({message: 'Post could not be deleted'});
      } else {
        await User.update({
          _id: req.user._id
        }, {
          $pull: {posts: {
            postId: result._id
          }}
        });

        return res.status(HttpStatus.OK).json({message: 'Post deleted successfully'});
      }
       
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: error});
    }    
  }
};