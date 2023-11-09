/**
 * @memberof Redis.Client
 */
class RedisServiceKey
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  async exists(key)
  {
    try
    {
      return await this.gateway.cmd('EXISTS', key)
    }
    catch(previousError)
    {
      const error = new Error('see if key exists failed')
      error.code  = 'E_REDIS_KEY_EXISTS'
      error.chain = { previousError, key }
      throw error
    }
  }

  async write(key, value)
  {
    try
    {
      const encoded = JSON.stringify(value)
      return await this.gateway.cmd('SET', key, encoded)
    }
    catch(previousError)
    {
      const error = new Error('set key failed')
      error.code  = 'E_REDIS_KEY_WRITE'
      error.chain = { previousError, key, value }
      throw error
    }
  }

  async read(key)
  {
    let response

    try
    {
      response = await this.gateway.cmd('GET', key)
    }
    catch(previousError)
    {
      const error = new Error('get key failed')
      error.code  = 'E_REDIS_KEY_READ'
      error.chain = { previousError, key }
      throw error
    }

    try
    {
      return JSON.parse(response)
    }
    catch(previousError)
    {
      const error = new Error('get key failed when decoding the response')
      error.code  = 'E_REDIS_KEY_READ'
      error.chain = { previousError, key, response }
      throw error
    }
  }

  async * scan(pattern)
  {
    let keys, cursor = 0
    do
    {
      [cursor, keys] = await this.gateway.cmd('SCAN', cursor, 'MATCH', pattern, 'COUNT', '100')
      for(const key of keys)
      {
        yield key
      }
    }
    while(cursor !== '0')
  }

  async increment(key, i = 1)
  {
    try
    {
      return await this.gateway.cmd('INCRBYFLOAT', key, i)
    }
    catch(previousError)
    {
      const error = new Error('increment key failed')
      error.code  = 'E_REDIS_KEY_INCREMENT'
      error.chain = { previousError, key }
      throw error
    }
  }

  async expire(key, seconds)
  {
    try
    {
      return await this.gateway.cmd('EXPIRE', key, seconds)
    }
    catch(previousError)
    {
      const error = new Error('expire key failed')
      error.code  = 'E_REDIS_KEY_EXPIRE'
      error.chain = { previousError, key, seconds }
      throw error
    }
  }

  async delete(key)
  {
    try
    {
      return await this.gateway.cmd('DEL', key)
    }
    catch(previousError)
    {
      const error = new Error('delete key failed')
      error.code  = 'E_REDIS_KEY_DELETE'
      error.chain = { previousError, key }
      throw error
    }
  }
}

module.exports = RedisServiceKey
