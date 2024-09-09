/**
 * @memberof Redis.Client
 */
class RedisServiceUnordered
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  async write(key, value)
  {
    try
    {
      const encoded = JSON.stringify(value)
      return await this.gateway.cmd('SADD', key, encoded)
    }
    catch(previousError)
    {
      const error = new Error('write unordered set failed')
      error.code  = 'E_REDIS_UNORDERED_WRITE'
      error.chain = { previousError, key, value }
      throw error
    }
  }

  async read(key)
  {
    let response

    try
    {
      response = await this.gateway.cmd('SMEMBERS',  key)
    }
    catch(previousError)
    {
      const error = new Error('read unordered set failed')
      error.code  = 'E_REDIS_UNORDERED_READ'
      error.chain = { previousError, key }
      throw error
    }

    try
    {
      const decoded = response.map((item) => item === 'undefined' ? undefined : JSON.parse(item))
      return decoded
    }
    catch(previousError)
    {
      const error = new Error('read unordered set failed when decoding the response')
      error.code  = 'E_REDIS_UNORDERED_READ'
      error.chain = { previousError, key, response }
      throw error
    }
  }

  async delete(key)
  {
    try
    {
      return await this.gateway.cmd('SREM', key)
    }
    catch(previousError)
    {
      const error = new Error('delete unordered set failed')
      error.code  = 'E_REDIS_UNORDERED_DELETE'
      error.chain = { previousError, key }
      throw error
    }
  }

  async deleteValue(key, value)
  {
    try
    {
      const encoded = JSON.stringify(value)
      return await this.gateway.cmd('SREM', key, encoded)
    }
    catch(previousError)
    {
      const error = new Error('delete unordered set value failed')
      error.code  = 'E_REDIS_UNORDERED_DELETE_VALUE'
      error.chain = { previousError, key, value }
      throw error
    }
  }

  async has(key, value)
  {
    try
    {
      const
        encoded = JSON.stringify(value),
        result  = await this.gateway.cmd('SISMEMBER', key, encoded)

      return result !== null
    }
    catch(previousError)
    {
      const error = new Error('failed to check if the unordered set has value')
      error.code  = 'E_REDIS_UNORDERED_HAS_VALUE'
      error.chain = { previousError, key, value }
      throw error
    }
  }
}

module.exports = RedisServiceUnordered
