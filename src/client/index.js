/**
 * @memberof Redis.Client
 */
class RedisClient
{
  constructor(gateway, factory, hash, key, list, pubsub, stream, transaction)
  {
    this.gateway        = gateway
    this.createSession  = factory
    this.hash           = hash
    this.key            = key
    this.list           = list
    this.pubsub         = pubsub
    this.stream         = stream
    this.transaction    = transaction
  }

  quit()
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.quit((previousError) =>
      {
        if(previousError)
        {
          const error = new Error('write hash error occured')
          error.code  = 'E_REDIS_QUIT'
          error.chain = { previousError }
          reject(error)
        }

        accept()
      })
    })
  }
}

module.exports = RedisClient
