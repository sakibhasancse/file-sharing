import path from 'path'
import util, { format } from 'util'
import multer from 'multer'
import { Storage } from '@google-cloud/storage'
import { GeneralError } from '../../common/errors'
import FileCollection from './files-model'

const fileSize = process.env.MAX_FILE_SIZE || 2
const maxSize = fileSize * 1024 * 1024
const hasCloudStorage = !!process.env.GOOGLE_CLOUD_PROJECT_ID

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../assets/upload/'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const fileExtension = file.originalname.split('.').pop()
    const fileName = `${uniqueSuffix}.${fileExtension}`
    cb(null, fileName)
  }
})

const multerConfig = multer({
  storage: hasCloudStorage ? multer.memoryStorage() : multerStorage,
  limits: { fileSize: maxSize }
}).single('file')

export const processFile = util.promisify(multerConfig)

export const uploadFileToGoogleCloudStorage = (req, res, tokens) => {
  const { file } = req
  const fileName = file ? file.originalname : ''

  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID // Get this from Google Cloud
  const keyFilename = 'config/googleCloudKey.json'// Get this from Google Cloud -> Credentials -> Service Accounts

  // Instantiate a storage client with credentials
  const storage = new Storage({
    projectId,
    keyFilename
  })

  // A bucket is a container for objects (files).
  const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET)
  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(fileName)
  const blobStream = blob.createWriteStream()

  blobStream.on('error', err => {
    throw new GeneralError('Filed to upload file', err)
  })
  blobStream.on('finish', async (data) => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    )
    try {
      // Make the file public
      await bucket.file(fileName).makePublic()
    } catch {
      return res.status(500).send({
        message:
          `Uploaded the file successfully: ${fileName}, but public access is denied!`,
        url: publicUrl
      })
    }
    res.status(200).send({
      message: 'Uploaded the file successfully: ' + fileName,
      url: publicUrl,
      tokens
    })
    res.status(200).send(publicUrl)
  })

  blobStream.end(req.file.buffer)
}

export const getAFile = async (query) => {
  const file = await FileCollection.findOne(query)
  return file
}
export const getFiles = async (query) => {
  const files = await FileCollection.find(query)
  return files || []
}
