/**
 * @memberof Redis.Client
 */
class RedisServiceTransaction
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  begin(...args)
  {
    return this.multi(...args)
  }

  async multi()
  {
    try
    {
      await this.gateway.cmd('MULTI')
    }
    catch(previousError)
    {
      const error = new Error('multi command failed')
      error.code  = 'E_REDIS_TRANSACTION_MULTI'
      error.chain = { previousError }
      throw error
    }
  }

  commit(...args)
  {
    return this.exec(...args)
  }

  /**
   * TODO, if response is null, then an error also occured, map accoringly
   * Optemistic locking using check and set https://redis.io/topics/transactions#cas
   */
  async exec()
  {
    try
    {
      await this.gateway.cmd('EXEC')
    }
    catch(previousError)
    {
      const error = new Error('exec command failed')
      error.code  = 'E_REDIS_TRANSACTION_EXEC'
      error.chain = { previousError }
      throw error
    }
  }

  roleback(...args)
  {
    return this.discard(...args)
  }

  async discard()
  {
    try
    {
      await this.gateway.cmd('DISCARD')
    }
    catch(previousError)
    {
      const error = new Error('discard command failed')
      error.code  = 'E_REDIS_TRANSACTION_DISCARD'
      error.chain = { previousError }
      throw error
    }
  }

  async unwatch()
  {
    try
    {
      return await this.gateway.cmd('UNWATCH')
    }
    catch(previousError)
    {
      const error = new Error('unwatch command failed')
      error.code  = 'E_REDIS_TRANSACTION_UNWATCH'
      error.chain = { previousError }
      throw error
    }
  }

  async watch(...keys)
  {
    try
    {
      return await this.gateway.cmd('WATCH', ...keys)
    }
    catch(previousError)
    {
      const error = new Error('watch command failed')
      error.code  = 'E_REDIS_TRANSACTION_WATCH'
      error.chain = { previousError, keys }
      throw error
    }
  }
}

module.exports = RedisServiceTransaction
