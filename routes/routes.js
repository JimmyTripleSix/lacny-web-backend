const express = require('express');
const fileUpload = require('express-fileupload');

const router = express.Router();

const Page = require('../model/galleryPage');

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

    image.mv(__dirname + '/../upload/images/' + image.name);

    res.status(200).json({ message: 'uploaded: ' + image.name });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
})