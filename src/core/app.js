
import compression from 'compression'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import ExpressPinoLogger from 'express-pino-logger'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import appModules from '../modules'
import { handleError, handleRequest } from '../common/middlewares'
dotenv.config()

const limiter = rateLimit({
  windowMs: process.env.REQUEST_TIME || 15 * 60 * 1000, // 15 minutes
  max: process.env.REQUEST_LIMIT || 1000, // limit each IP to 1000 requests per windowMs
  message:
    'Too many request from this IP, please try again after an hour',
})

const app = express()
app.use(compression())

const logger = ExpressPinoLogger({
  customLogLevel(res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn'
    }
    if (res.statusCode >= 500 || err) {
      return 'error'
    }
    if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent'
    }
    return 'info'
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      headers: {
        'user-agent': req.headers['user-agent'],
        'session-id': req.headers['session-id'] || '',
        host: req.headers.host
      },
      remoteAddress: req.remoteAddress
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      header: {
        date: res.headers.date,
        'x-correlation-id': res.headers['x-correlation-id']
      }
    })
  },
  enabled: process.env.NODE_ENV !== 'test'
})

// Allow Cross-Origin requests
app.use(cors())

// Set security HTTP headers
app.use(helmet())

// Limit request from the same API
app.use(limiter)

app.use(express.json())
app.use(logger);

(async function () {
  app.use(handleRequest)
  await appModules(app)
  app.use(handleError)
}())

export default app
