const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const Page = require('../model/galleryPage');
const imagePath = __dirname + '/../upload/images/'

router.use(fileUpload());

module.exports = router;

router.put('/page', async (req, res) => {
  const data = new Page(
    req.body
  );

  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  }
  catch (error) {
    res.status(400).json({message: error.message});
  }
})

router.get('/page', async (req, res) => {
  try{
    const data = await Page.find();
    res.status(200).json(data);
  }
  catch(error){
    res.status(500).json({message: error.message});
  }
})

router.get('/page/:id', async (req, res) => {
  try{
    const data = await Page.findById(req.params.id);
    res.status(200).json(data);
  }
  catch(error){
    res.status(500).json({message: error.message});
  }
})

router.patch('/page/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };

    const result = await Page.findByIdAndUpdate(
      id, updatedData, options
    )

    res.status(200).send(result);
  }
  catch (error) {
    res.status(400).json({ message: error.message });
  }
})

router.delete('/page/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Page.findByIdAndDelete(id);
    res.status(200).json(data);
  }
  catch (error) {
    res.status(400).json({ message: error.message });
  }
})

router.post('/image', async (req, res) => {
  try {
    const { image } = req.files;

    if (!image) return res.status(400).json({ message: 'no image received' });

    await image.mv(imagePath + image.name);

    res.status(200).json({ message: 'uploaded: ' + image.name });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
})

router.get('/image', async (req, res) => {
  try {
    const retArray = [];
    fs.readdir(imagePath, (err, files) => {
      if (err) {
        console.log('error reading files: ' + err);
        res.status(500).json({ message: 'error occurred' });
      }

      files.forEach((file) => {
        retArray.push({
          filename: file,
          url: '/api/image/' + file
        });
      });
      res.status(200).json(retArray);
    })
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/image/:name', async (req, res) => {
  try {
    if (!fs.existsSync(path.resolve(imagePath + req.params.name))) {
      res.status(404).json({ message: 'image doesn\'t exist' })
    }
    res.sendFile(path.resolve(imagePath + req.params.name));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
})