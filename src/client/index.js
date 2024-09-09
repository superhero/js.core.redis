/**
 * @memberof Redis.Client
 */
class RedisClient
{
  constructor(config, console, gateway, factory, cluster, connection, hash, key, list, ordered, pubsub, stream, transaction, unordered)
  {
    this.config         = config
    this.console        = console
    this.gateway        = gateway
    this.factoryCreate  = factory
    this.cluster        = cluster
    this.connection     = connection
    this.hash           = hash
    this.key            = key
    this.list           = list
    this.ordered        = ordered
    this.unordered      = unordered
    this.pubsub         = pubsub
    this.stream         = stream
    this.transaction    = transaction
  }

  async bootstrap()
  {
    await this.auth()
  }

  createSession()
  {
    const session = this.factoryCreate()
    return session
  }

  async auth(key = this.config.auth)
  {
    if(key)
    {
      if(Array.isArray(key))
        await this.connection.auth(...key)

      else
        await this.connection.auth(key)

      this.console.color('cyan').log('✔ redis connection authenticated')
    }
  }
}

module.exports = RedisClient
