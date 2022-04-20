/**
 * @memberof Redis.Client
 */
class RedisClient
{
  constructor(config, console, gateway, factory, connection, hash, key, list, ordered, pubsub, stream, transaction)
  {
    this.config         = config
    this.console        = console
    this.gateway        = gateway
    this.factoryCreate  = factory
    this.connection     = connection
    this.hash           = hash
    this.key            = key
    this.list           = list
    this.ordered        = ordered
    this.pubsub         = pubsub
    this.stream         = stream
    this.transaction    = transaction
  }

  bootstrap()
  {
    return this.auth()
  }

  createSession()
  {
    return this.factoryCreate()
  }

  async auth()
  {
    if(this.config.auth)
    {
      if(Array.isArray(this.config.auth))
        await this.connection.auth(...this.config.auth)

      else
        await this.connection.auth(this.config.auth)

      this.console.color('cyan').log('✔ redis connection authenticated')
    }
  }
}

module.exports = RedisClient
