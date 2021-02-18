const
  redis               = require('redis'),
  Events              = require('events'),
  RedisClient         = require('.'),
  RedisKey            = require('./service/key'),
  RedisHash           = require('./service/hash'),
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
      eventbus      = new Events(),
      key           = new RedisKey(client),
      hash          = new RedisHash(client),
      pubsub        = new RedisPubsub(client, eventbus),
      stream        = new RedisStream(client, console),
      factory       = this.locate.bind(this),
      transaction   = new RedisTransaction(client)

    return new RedisClient(client, factory, key, hash, pubsub, stream, transaction)
  }
}

module.exports = RedisClientLocator
