import fs from 'fs'

const appModule = async (app) => {
  const rootPath = __dirname
  const moduleNames = await fs.promises.readdir(rootPath)
  await Promise.all(
    moduleNames.map(async (moduleName) => {
      const stat = await fs.promises.lstat(`${rootPath}/${moduleName}`)
      if (stat.isDirectory()) {
        const module = require(`./${moduleName}`)
        if (module.init) {
          await module.init(app)
        }
      }
    })
  )
  return app
}

export default appModule
