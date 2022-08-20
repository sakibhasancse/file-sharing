import format from 'util'
import fs from 'fs'
import { GeneralError, NotFound } from '../../common/errors'
import { fileHelper } from '../helpers'
import FileCollection from './files-model'

export const createAFile = async (fileData) => {
  const file = await FileCollection.create(fileData)
  return file
}

export const deleteAFile = async (query) => {
  const files = await FileCollection.deleteMany(query)
  return files
}

export const deleteFiles = async (query) => {
  const files = await FileCollection.deleteMany(query)
  return files
}


export const uploadFile = async (req, res, next) => {
  try {
    const { body = {} } = req
    // File process and save the file
    await fileHelper.processFile(req, res)

    const { file } = req
    if (!file) throw new NotFound('File is required')

    const fileData = {
      name: body.title ? body.title : file.originalname,
      size: file.size,
      path: file.filename
    }

    // File save to database
    const newFile = await createAFile(fileData)
    if (!newFile) throw new GeneralError('Failed to save the file')

    // Upload file to google storage
    // if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
    //   const fileUrl = await uploadFileToGoogleCloudStorage(req, res, tokens)
    //   if (fileUrl) newFile.fileUrl = fileUrl
    // }

    return newFile
  } catch (err) {
    next(err)
  }
}

export const deleteFile = async (req, res, next) => {
  try {
    const { privateKey } = req.params

    let file = await fileHelper.getAFile({ privateKey })
    if (!file) throw new NotFound('File not found')

    await deleteAFile({ privateKey })
    await fs.unlinkSync(`${__dirname}/../../../assets/upload/${file.path}`)
    // if (process.env.GOOGLE_CLOUD_PROJECT_ID)  await googleCloudStorage.fileDeleteasync(req, res)
    return file
  } catch (err) {
    next(err)
  }
}

export const googleCloudStorage = {
  fileUpload: (req, res) => {
    // Create a new blob in the bucket and upload the file data.
    const blob = fileHelper.bucket.file(req.file.originalname)
    const blobStream = blob.createWriteStream({
      resumable: false
    })
    blobStream.on('error', (err) => {
      res.status(500).send({ message: err.message })
    })
    blobStream.on('finish', async (data) => {
      // Create URL for directly file access via HTTP.
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      )
      try {
        // Make the file public
        await bucket.file(req.file.originalname).makePublic()
      } catch {
        return res.status(500).send({
          message:
            `Uploaded the file successfully: ${req.file.originalname}, but public access is denied!`,
          url: publicUrl
        })
      }
      res.status(200).send({
        message: 'Uploaded the file successfully: ' + req.file.originalname,
        url: publicUrl
      })
    })
    blobStream.end(req.file.buffer)
  },
  fileDownload: async (req, res) => {
    const [metaData] = await bucket.file(req.params.name).getMetadata()
    res.redirect(metaData.mediaLink)
  },
  fileDelete: async (req, res) => {
    const [metaData] = await bucket.file(req.params.name).getMetadata()
    res.redirect(metaData.mediaLink)
  },
  fileList: async (req, res) => {
    const [files] = await bucket.getFiles()
    const fileInfos = []
    files.forEach((file) => {
      fileInfos.push({
        name: file.name,
        url: file.metadata.mediaLink
      })
    })
    res.status(200).send(fileInfos)
  }
}

// remove olds file
export const removeInactiveFiles = async () => {
  console.log('Started remove inactive file job', new Date())
  try {
    const maxTime = process.env.REMOVE_MAX_AGED_FILE_TIME ? 60 : 24 * 60 * 60 * 1000
    const fileQuery = { createdAt: { $lt: new Date(Date.now() - maxTime) } }
    const files = await fileHelper.getFiles(fileQuery)
    await deleteFiles(fileQuery) //remove files from database
    // remove files from local storage
    if (files && files.length) {
      for (const file of files) {
        try {
          fs.unlinkSync(`assets/upload/${file.path}`);
          console.log(`Successfully removed ${file.name}`);
        } catch (err) {
          console.log(`Error while deleting file ${err} `);
        }
      }
    }
    console.log(`Finished removing inactive files`, new Date());
  } catch (error) {
    console.log('Job failed!', error);
    return false
  }
}