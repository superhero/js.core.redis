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
      options       = configuration.find('client/redis'),
      factory       = new RedisClientFactory(),
      client        = factory.create(console, options)

    return client
  }
}

module.exports = RedisClientLocator
