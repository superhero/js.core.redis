const
  redis               = require('redis'),
  Events              = require('events'),
  RedisClient         = require('.'),
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
      eventbus      = new Events(),
      connection    = new RedisConnection(client),
      hash          = new RedisHash(client),
      key           = new RedisKey(client),
      list          = new RedisList(client),
      ordered       = new RedisOrdered(client),
      pubsub        = new RedisPubsub(client, eventbus),
      stream        = new RedisStream(client, console),
      factory       = this.locate.bind(this),
      transaction   = new RedisTransaction(client)

    return new RedisClient(client, factory, connection, hash, key, list, ordered, pubsub, stream, transaction)
  }
}

module.exports = RedisClientLocator
