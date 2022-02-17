/**
 * @memberof Redis.Client
 */
class RedisServicePubsub
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  /**
   * @param {string} channel 
   * @param {object} [msg=null]
   */
  async publish(channel, msg = null)
  {
    try
    {
      const encoded = JSON.stringify(msg)
      await this.gateway.redis.publish(channel, encoded)
    }
    catch(previousError)
    {
      console.log(previousError)
      const error = new Error('publish command failed')
      error.code  = 'E_REDIS_PUBSUB_PUBLISH'
      error.chain = { previousError, channel, msg }
      throw error
    }
  }

  /**
   * @param {string} channel 
   * @param {function} observer 
   */
  async subscribe(channel, observer)
  {
    try
    {
      await this.gateway.redis.pSubscribe(channel, (msg, noPatternChannel) => 
      {
        const dto = JSON.parse(msg)
        observer(dto, channel, noPatternChannel)
      })
    }
    catch(previousError)
    {
      console.log(previousError)
      const error = new Error('subscribe command failed')
      error.code  = 'E_REDIS_PUBSUB_SUBSCRIBE'
      error.chain = { previousError, channel, observer }
      throw error
    }
  }

  /**
   * @param {string} channel 
   */
  async unsubscribe(channel)
  {
    try
    {
      await this.gateway.redis.pUnsubscribe(channel)
    }
    catch(previousError)
    {
      const error = new Error('publish command failed')
      error.code  = 'E_REDIS_PUBSUB_UNSUBSCRIBE'
      error.chain = { previousError, channel }
      throw error
    }
  }
}

module.exports = RedisServicePubsub
