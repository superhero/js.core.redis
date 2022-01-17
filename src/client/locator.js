const
  redis               = require('redis'),
  RedisClient         = require('.'),
  RedisClientGateway  = require('./gateway'),
  RedisConnection     = require('./service/connection'),
  RedisHash           = require('./service/hash'),
  RedisKey            = require('./service/key'),
  RedisList           = require('./service/list'),
  RedisOrdered        = require('./service/ordered'),
  RedisPubsub         = require('./service/pubsub'),
  RedisStream         = require('./service/stream'),
  RedisTransaction    = require('./service/transaction'),
  LocatorConstituent  = require('superhero/core/locator/constituent')

/**
 * @memberof Redis.Client
 * @extends {superhero/core/locator/constituent}
 */
class RedisClientLocator extends LocatorConstituent
{
  /**
   * @returns {RedisClient}
   */
  locate()
  {
    const
      console       = this.locator.locate('core/console'),
      configuration = this.locator.locate('core/configuration'),
      options       = configuration.find('client/redis/gateway'),
      client        = redis.createClient(options),
      gateway       = new RedisClientGateway(client),
      connection    = new RedisConnection(gateway),
      hash          = new RedisHash(gateway),
      key           = new RedisKey(gateway),
      list          = new RedisList(gateway),
      ordered       = new RedisOrdered(gateway),
      pubsub        = new RedisPubsub(gateway),
      stream        = new RedisStream(gateway, console),
      factory       = this.locate.bind(this),
      transaction   = new RedisTransaction(gateway)

    return new RedisClient(gateway, factory, connection, hash, key, list, ordered, pubsub, stream, transaction)
  }
}

module.exports = RedisClientLocator
