import { v4 } from 'uuid'
import { GeneralError, BadRequest } from './errors'

export const handleError = async (err, req, res, next) => {
  if (!res) return
  if (res && res.headersSent) return next(err)

  let code = 500
  if (err instanceof GeneralError) {
    code = err.getCode()
  }
  const correlationId = req.headers['x-correlation-id']
  req.log.error(err, { correlationId })
  return (
    res &&
    res.status(code).send({
      correlationId,
      message: err.message,
      status: 'error',
      error: { ...err }
    })
  )
}

export const handleRequest = async (req, res, next) => {
  let correlationId = req.headers['x-correlation-id']
  if (!correlationId) {
    correlationId = v4()
    req.headers['x-correlation-id'] = correlationId
  }
  res.set('x-correlation-id', correlationId)
  req.log = req.log.child({ correlationId })
  req.log.info(`new request: ${req.method} ${req.url}`)
  return next()
}
