/**
 * @memberof Redis.Client
 */
class RedisServiceConnection
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  async connect()
  {
    try
    {
      return await this.gateway.redis.connect()
    }
    catch(previousError)
    {
      const error = new Error('failed to connect to redis')
      error.code  = 'E_REDIS_CONNECTION_CONNECT'
      error.chain = { previousError }
      throw error
    }
  }

  async quit()
  {
    try
    {
      return await this.gateway.redis.quit()
    }
    catch(previousError)
    {
      const error = new Error('failed to quit redis connection')
      error.code  = 'E_REDIS_CONNECTION_QUIT'
      error.chain = { previousError }
      throw error
    }
  }
}

module.exports = RedisServiceConnection
