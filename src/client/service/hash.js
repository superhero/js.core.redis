/**
 * @memberof Redis.Client
 */
class RedisServiceHash
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  async write(key, field, value)
  {
    try
    {
      const encoded = JSON.stringify(value)
      return await this.gateway.cmd('HSET', key, field, encoded)
    }
    catch(previousError)
    {
      const error = new Error('write hash error occured')
      error.code  = 'E_REDIS_HASH_WRITE'
      error.chain = { previousError, key, field, value }
      throw error
    }
  }

  async read(key, field)
  {
    let response

    try
    {
      response = await this.gateway.cmd('HGET', key, field)
    }
    catch(previousError)
    {
      const error = new Error('read hash error occured')
      error.code  = 'E_REDIS_HASH_READ'
      error.chain = { previousError, key, field }
      throw error
    }

    try
    {
      return response === 'undefined' ? undefined : JSON.parse(response)
    }
    catch(previousError)
    {
      const error = new Error('read hash error occured when decoding the response')
      error.code  = 'E_REDIS_HASH_READ'
      error.chain = { previousError, key, response }
      throw error
    }
  }

  async has(key, field)
  {
    try
    {
      return !!(await this.read(key, field))
    }
    catch(previousError)
    {
      const error = new Error('hash error occured when looking if a value exists or not')
      error.code  = 'E_REDIS_HASH_HAS'
      error.chain = { previousError, key, field }
      throw error
    }
  }

  async increment(key, field, i = 1)
  {
    try
    {
      return await this.gateway.cmd('HINCRBYFLOAT', key, field, i)
    }
    catch(previousError)
    {
      const error = new Error('increment key failed')
      error.code  = 'E_REDIS_HASH_INCREMENT'
      error.chain = { previousError, key }
      throw error
    }
  }

  async delete(key, field)
  {
    try
    {
      return await this.gateway.cmd('HDEL', key, field)
    }
    catch(previousError)
    {
      const error = new Error('delete key failed')
      error.code  = 'E_REDIS_HASH_DELETE'
      error.chain = { previousError, key, field }
      throw error
    }
  }

  async fieldExists(key, field)
  {
    try
    {
      return await this.gateway.cmd('HEXISTS', key, field)
    }
    catch(previousError)
    {
      const error = new Error('hash field exists failed')
      error.code  = 'E_REDIS_HASH_FIELD_EXISTS'
      error.chain = { previousError, key, field }
      throw error
    }
  }

  async readAll(key)
  {
    let response

    try
    {
      response = await this.gateway.cmd('HGETALL', key)
    }
    catch(previousError)
    {
      const error = new Error('read all hash fields and values failed')
      error.code  = 'E_REDIS_HASH_READ_ALL'
      error.chain = { previousError, key }
      throw error
    }

    try
    {
      const output = {}

      for(let i = 1; i < response.length; i += 2)
      {
        const
          key = response[i-1],
          val = response[i] === 'undefined' ? undefined : JSON.parse(response[i])

        output[key] = val
      }

      return output
    }
    catch(previousError)
    {
      const error = new Error('read hash all error occured when decoding the response')
      error.code  = 'E_REDIS_HASH_READ_ALL'
      error.chain = { previousError, key, response }
      throw error
    }
  }
}

module.exports = RedisServiceHash
