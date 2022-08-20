import { expect } from 'chai'
import fs from 'fs'
const { setupDB, request } = require('../setup')
import { cleanFilesDataForTest } from './file-helper'
setupDB()

describe('Test for file upload', () => {
  let file = {}
  before(async () => {
    await cleanFilesDataForTest()
  })

  it("Should throw an error, if a file is not attached", async () => {
    const { status, text } = await request.post('/api/files/')
    const result = JSON.parse(text)
    const { message } = result
    expect(message).to.equal('File is required')
    expect(status).to.equal(404)
  });

  it('Should upload a file', async () => {
    const { status, text } = await request
      .post('/api/files/')
      .attach('file', fs.readFileSync('src/tests/test-helper/testFile.txt'), 'testFile.txt')
    const result = JSON.parse(text)
    const { message, data } = result

    expect(message).to.equal('File uploaded successfully');
    expect(status).to.equal(201)

    //Checking file data
    const { privateKey, publicKey, name } = data
    file = data
    expect(data).to.be.a('object')
    expect(privateKey).to.be.a.string
    expect(publicKey).to.be.a.string
    expect(name).to.equal('testFile.txt')
  })

  it("shouldn't download a file using an invalid key", async () => {
    const response = await request
      .get('/api/files/test')

    const result = JSON.parse(response.text)
    expect(response.status).to.equal(404)
    expect(result.message).to.equal('File not found')
  })

  it('should download a file', async () => {
    const response = await request
      .get(`/api/files/${file.publicKey}`)

    expect(response.buffered).to.be.true
    expect(response.text).to.equal("Hello, This is a test file")
  })
  it("shouldn't remove a file using an invalid key", async () => {
    const response = await request
      .delete('/api/files/wrong-test-key')
    const result = JSON.parse(response.text)

    expect(response.statusCode).to.equal(404)
    expect(result.message).to.equal('File not found')
  })

  it('should remove a file', async () => {

    const response = await request
      .delete(`/api/files/${file.privateKey}`)

    const result = JSON.parse(response?.text)
    expect(response.status).to.equal(200)
    expect(result.message).to.equal('File successfully removed')

  })
})
