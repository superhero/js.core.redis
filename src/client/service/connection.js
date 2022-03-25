/**
 * @memberof Redis.Client
 */
class RedisServiceConnection
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  async auth(...args)
  {
    try
    {
      return await this.gateway.cmd('AUTH', ...args)
    }
    catch(previousError)
    {
      const error = new Error('failed auth process')
      error.code  = 'E_REDIS_CONNECTION_AUTH'
      error.chain = { previousError }
      throw error
    }
  }

  async connect()
  {
    try
    {
      return await this.gateway.redis.connect()
    }
    catch(previousError)
    {
      if(previousError.message !== 'Socket already opened')
      {
        const error = new Error('failed to connect to redis')
        error.code  = 'E_REDIS_CONNECTION_CONNECT'
        error.chain = { previousError }
        throw error
      }
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
      if(previousError.message !== 'The client is closed')
      {
        const error = new Error('failed to quit redis connection')
        error.code  = 'E_REDIS_CONNECTION_QUIT'
        error.chain = { previousError }
        throw error
      }
    }
  }
}

module.exports = RedisServiceConnection
