import FileCollection from '../../modules/files/files-model'
import fs from 'fs'


export const createAFile = async (fileData) => {
    const file = await FileCollection.create(fileData)
    return file
}

export const cleanFiles = async () => {
    const files = await FileCollection.deleteMany({})
    return files
}

export const clearDirectoryFiles = () => {
    const directory = 'assets/upload'
    const files = fs.readdirSync(directory)
    for (const file of files) {
        fs.unlinkSync(directory + '/' + file)
    }
}


export const cleanFilesDataForTest = async () => {
    await cleanFiles();
    await clearDirectoryFiles();
    await fs.writeFileSync('src/tests/test-helper/testFile.txt', 'Hello, This is a test file');
}
