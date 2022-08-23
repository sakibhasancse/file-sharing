import path from 'path'
import util from 'util'
import multer from 'multer'
import { Storage } from '@google-cloud/storage'
import FileCollection from './files-model'

export const getAFile = async (query) => {
  const file = await FileCollection.findOne(query)
  return file
}
export const getFiles = async (query) => {
  const files = await FileCollection.find(query)
  return files || []
}


const fileSize = process.env.MAX_FILE_SIZE || 2
const maxSize = fileSize * 1024 * 1024
export const hasCloudStorage = () => process.env.GCLOUD_PROJECT_ID && process.env.NODE_ENV !== 'test'

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
  storage: hasCloudStorage() ? multer.memoryStorage() : multerStorage,
  limits: { fileSize: maxSize }
}).single('file')

export const processFile = util.promisify(multerConfig)

export const getGoogleCloudBucket = () => {
  // Get this from Google Cloud -> Credentials -> Service Accounts
  const projectId = process.env.GCLOUD_PROJECT_ID
  const client_email = process.env.GCLOUD_EMAIL_CLIENT
  const private_key = process.env.GCLOUD_PRIVATE_KEY.replace(new RegExp("\\\\n", "\g"), "\n")
  // Instantiate a storage client with credentials
  const storage = new Storage({
    projectId,
    credentials: {
      client_email,
      private_key
    }
  })
  // A bucket is a container for objects (files).
  const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET)
  return bucket
}
