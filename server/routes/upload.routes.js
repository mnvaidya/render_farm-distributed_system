const express = require('express')
const router = express.Router();
const upload = require('../models/multerModel')

const render_controller = require('../controllers/render.controller')

// router.post('/upload-file', upload.single('blend_file'), render_controller.render_file)
// router.get('/download-file/:unique_request', render_controller.download_file)


module.exports = router