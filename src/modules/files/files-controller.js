
import { NotFound } from '../../common/errors'
import { fileHelper } from '../helpers'
import { fileService } from '../services'
import { hasCloudStorage } from './files-helper'
import { downloadFileFromGCloud } from './files-service'

export const uploadFile = async (req, res, next) => {
  const file = await fileService.uploadFile(req, res, next)
  if (file) res.status(201).send({
    data: file,
    message: 'File uploaded successfully',
    statusCode: 201
  })
}

export const downloadFile = async (req, res, next) => {
  try {
    const { publicKey } = req.params
    const file = await fileHelper.getAFile({ publicKey })
    if (!file) throw new NotFound("File not found")

    const filePath = `${__dirname}/../../../assets/upload/${file.path}`

    if (hasCloudStorage()) await downloadFileFromGCloud(res, file.name)
    else res.download(filePath)
  } catch (err) {
    next(err)
  }
}

export const deleteFile = async (req, res, next) => {
  const result = await fileService.deleteFile(req, req, next)
  if (result) res.status(200).send({
    success: true,
    message: 'File successfully removed'
  })
}
