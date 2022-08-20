import dotenv from 'dotenv'
import { handleError } from './common/middlewares'
import { setup } from './core'
dotenv.config()
import './background-job'

const start = async () => {
  try {
    const { app, eventEmitter, dbConnection, logger } = await setup()
    const PORT = process.env.PORT || 5000
    app.use(handleError)
    app.listen(PORT, async () => {

      logger.info(`Server listen on http://localhost:${PORT}`)

      const broadcastDatabaseConnectionEstablished = (em) => {
        em.emit('databaseConnected')
      }

      eventEmitter.on('databaseConnected', () => {
        logger.info(`Database connected at ${new Date()}`)
      })

      await dbConnection(broadcastDatabaseConnectionEstablished, eventEmitter)
    })
  } catch (err) {
    app.use(handleError)
    console.error({ err })
  }
}
start()
