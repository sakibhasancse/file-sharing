import fs from 'fs'
import nid from 'nid'
import { GeneralError, NotFound } from '../../common/errors'
import { fileHelper } from '../helpers'
import FileCollection from './files-model'
import { getGoogleCloudBucket, hasCloudStorage } from './files-helper'

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
    // File process and save the file
    await fileHelper.processFile(req, res)

    const { file } = req
    if (!file) throw new NotFound('File is required')

    const newFileName = nid(17) + file.originalname
    const fileData = {
      name: newFileName,
      size: file.size,
      path: file.filename
    }

    // File save to database
    const newFile = await createAFile(fileData)
    if (!newFile) throw new GeneralError('Failed to save the file')
    // Upload file to google storage
    if (hasCloudStorage()) {
      await uploadFileToGoogleCloudStorage(req, newFileName)
    }
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
    if (hasCloudStorage()) await deleteFileFromGCloud(file.name)
    else await fs.unlinkSync(`${__dirname}/../../../assets/upload/${file.path}`)
    return file
  } catch (err) {
    next(err)
  }
}

export const uploadFileToGoogleCloudStorage = async (req, newFileName) => {
  const bucket = await getGoogleCloudBucket()
  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(newFileName)
  const blobStream = blob.createWriteStream()
  blobStream.on('error', err => { throw new GeneralError('Filed to upload the file', err) })
  blobStream.on('finish', async (data) => data)
  blobStream.end(req.file.buffer)
}

export const downloadFileFromGCloud = async (res, filePath) => {
  const bucket = await getGoogleCloudBucket()
  const [metaData] = await bucket.file(filePath).getMetadata()
  res.redirect(metaData.mediaLink)
}

export const deleteFileFromGCloud = async (filename) => {
  const bucket = await getGoogleCloudBucket().file(filename).delete();
  return bucket
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
          if (hasCloudStorage()) {
            await deleteFileFromGCloud(file.name)
          } else fs.unlinkSync(`assets/upload/${file.path}`);
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