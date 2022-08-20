import mongoose from 'mongoose'
import nid from 'nid'

const FileSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a File Name'],
    trim: true,
    min: [2, 'File Name can not be less then 2 characters'],
    maxlength: [100, 'File Name can not be more then 100 characters']
  },
  path: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  size: {
    type: Number,
    default: 0
  },
  publicKey: {
    type: String,
    default: nid(17)
  },
  privateKey: {
    type: String,
    default: nid(17)
  },
}, { timestamps: true })
export default FileSchema
