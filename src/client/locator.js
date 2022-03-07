const 
RedisClientFactory = require('./factory'),
LocatorConstituent = require('superhero/core/locator/constituent')

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
      redisOptions  = configuration.find('client/redis/gateway'),
      factory       = new RedisClientFactory(),
      client        = factory.create(console, redisOptions)

    return client
  }
}

module.exports = RedisClientLocator
