/**
 * @memberof Redis.Client
 */
class RedisClient
{
  constructor(gateway, factory, connection, hash, key, list, ordered, pubsub, stream, transaction)
  {
    this.gateway        = gateway
    this.createSession  = factory
    this.connection     = connection
    this.hash           = hash
    this.key            = key
    this.list           = list
    this.ordered        = ordered
    this.pubsub         = pubsub
    this.stream         = stream
    this.transaction    = transaction
  }
}

module.exports = RedisClient
