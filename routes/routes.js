const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const router = express.Router();

const Page = require('../model/galleryPage');
const User = require('../model/user');
const imagePath = __dirname + '/../upload/images/'

router.use(fileUpload());

module.exports = router;
/*router.post('/register', async (req, res) => {
  const username = '';
  const password = ''

  try {
    bcrypt.hash(password, 10, async (err, hash) => {
      const user = new User(
        {
          username: username,
          passwordHash: hash
        }
      )

      const userToSave = await user.save();
      res.status(200).json(userToSave);
    })

  } catch (error) {
    res.status(400).json({message: error.message});
  }
});*/

router.post('/login', async (req, res) => {
  try {
    if (req.body.username === null || req.body.password === null) {
      res.status(400).json({message: 'no data received'});
    } else {
      const user = await User.findOne({'username': req.body.username});
      if (user === null) {
        res.status(400).json({message: 'bad username or password'});
      } else {
        bcrypt.compare(req.body.password, user.passwordHash, async (err, result) => {
          if (result) {
            var token = jwt.sign({username: user.username}, process.env.JWT_SECRET)
            res.cookie('jwt',token, { httpOnly: true, maxAge: 3600000 })
            res.status(200).json({message: 'login successful'});
          } else {
            res.status(400).json({message: 'bad username or password'});
          }
        })
      }
    }
  } catch (error) {
    console.log('error login: ' + error.message);
    res.status(400).json({ message: 'error occurred' });
  }
});

router.put('/page', async (req, res) => {
  try {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log(err);
        res.status(401).json({message: 'no jwt'});
      } else {
        const data = new Page(
          req.body
        );
        const dataToSave = await data.save();
        res.status(200).json(dataToSave);
      }
    })
  } catch (error) {
    console.log('error put page: ' + error.message);
    res.status(400).json({ message: 'error occurred' });
  }
})

router.get('/page', async (req, res) => {
  try{
    const data = await Page.find();
    res.status(200).json(data);
  } catch (error){
    console.log('error getting pages: ' + error.message);
    res.status(400).json({ message: 'error occurred' });
  }
})

router.get('/page/:id', async (req, res) => {
  try{
    const data = await Page.findById(req.params.id);
    res.status(200).json(data);
  } catch (error){
    console.log('error getting page: ' + error.message);
    res.status(400).json({ message: 'error occurred' });
  }
})

router.patch('/page/:id', async (req, res) => {
  try {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log(err);
        res.status(401).json({message: 'no jwt'});
      } else {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Page.findByIdAndUpdate(
          id, updatedData, options
        )

        res.status(200).send(result);
      }
    })
  } catch (error) {
    console.log('error patch page: ' + error.message);
    res.status(400).json({ message: 'error occurred' });
  }
})

router.delete('/page/:id', async (req, res) => {
  try {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log(err);
        res.status(401).json({message: 'no jwt'});
      } else {
        const id = req.params.id;
        const data = await Page.findByIdAndDelete(id);
        res.status(200).json(data);
      }
    })
  }
  catch (error) {
    console.log('error deleting page: ' + error.message);
    res.status(400).json({ message: 'error occurred' });
  }
})

router.post('/image', async (req, res) => {
  try {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log(err);
        res.status(401).json({message: 'no jwt'});
      } else {
        const user = await User.findOne({'username': decoded.username});
        if (user === null) {
          res.status(401).json({message: 'not valid jwt'});
        } else {
          const { image } = req.files;
          if (!image) {
            return res.status(400).json({ message: 'no image received' });
          } else {
            const route = req.body.route;
            if (route === null) {
              res.status(400).json({ message: 'no route specified' });
            } else {
              if (!fs.existsSync(imagePath + '/' + route)) {
                fs.mkdirSync(imagePath + '/' + route);
              }
              await image.mv(imagePath + '/' + route + '/' + image.name);
              res.status(200).json({ message: 'uploaded: ' + image.name });
            }
          }
        }
      }
    })
  } catch (error) {
    console.log('error post image: ' + error.message);
    res.status(400).json({ message: 'error occurred' });
  }
})

router.get('/image', async (req, res) => {
  try {
    const retArray = [];
    fs.readdir(imagePath, (err, directories) => {
      if (err) {
        console.log('error reading directories: ' + err);
        res.status(500).json({ message: 'error occurred' });
      } else {
        directories.forEach((directory) => {
          fs.readdir(path.resolve(imagePath + '/' + directory + '/'), (err, files) => {
            if (err) {
              console.log('error reading files: ' + err);
              res.status(500).json({ message: 'error occurred' });
            } else {
              files.forEach((file) => {
                retArray.push({
                  filename: file,
                  url: '/api/image/' + directory + '/' + file
                });
              })
              res.status(200).json(retArray);
            }
          })
        });
      }
    })
  } catch (error) {
    console.log('error getting list of images: ' + error.message)
    res.status(400).json({ message: 'error occurred' });
  }
});

router.get('/image/:route/:name', async (req, res) => {
  try {
    if (!fs.existsSync(path.resolve(imagePath + '/' + req.params.route + '/' + req.params.name))) {
      res.status(404).json({ message: 'image doesn\'t exist' })
    } else {
      res.status(200).sendFile(path.resolve(imagePath + '/' + req.params.route + '/' + req.params.name));
    }
  } catch (error) {
    console.log('error get image: ' + error.message)
    res.status(400).json({ message: 'error occurred' });
  }
})

router.delete('/image/:name', async (req, res) => {
  try {
    jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log(err);
        res.status(401).json({message: 'no jwt'});
      } else {
        if (!fs.existsSync(path.resolve(imagePath + req.params.name))) {
          res.status(404).json({ message: 'image doesn\'t exist' })
        } else {
          res.unlink(path.resolve(imagePath + req.params.name));
          res.status(200).json({message: 'delete successful'});
        }
      }
    })
  } catch (error) {
    console.log('error deleting image: ' + error.message);
    res.status(400).json({ message: 'error occurred' });
  }
})