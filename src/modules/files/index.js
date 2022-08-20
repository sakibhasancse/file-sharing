import express from 'express'
const router = express.Router()

import {
  uploadFile,
  downloadFile,
  deleteFile
} from './files-controller'

router
  .route('/')
  .post(uploadFile)

router.route('/:publicKey')
  .get(downloadFile)

router.route('/:privateKey')
  .delete(deleteFile)

const init = async (app) => {
  app.use('/api/files', router)
  return app
}
module.exports = { init }
