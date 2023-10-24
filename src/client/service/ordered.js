/**
 * @memberof Redis.Client
 */
class RedisServiceOrdered
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  async write(key, value, score)
  {
    try
    {
      const encoded = JSON.stringify(value)
      return await this.gateway.cmd('ZADD', key, score, encoded)
    }
    catch(previousError)
    {
      const error = new Error('write ordered set failed')
      error.code  = 'E_REDIS_SET_WRITE'
      error.chain = { previousError, key, score, value }
      throw error
    }
  }

  async read(key, min, max, offset=0, count=-1, reversed=false)
  {
    max = max || min
    min = min || '-inf'
    max = max || '+inf'

    let response

    try
    {
      response = reversed
               ? await this.gateway.cmd('ZREVRANGEBYSCORE',  key, min || '+inf', max || '-inf', 'LIMIT', offset, count)
               : await this.gateway.cmd('ZRANGEBYSCORE',     key, min || '-inf', max || '+inf', 'LIMIT', offset, count)
    }
    catch(previousError)
    {
      const error = new Error('read ordered set range failed')
      error.code  = 'E_REDIS_ORDERED_READ'
      error.chain = { previousError, key, min, max }
      throw error
    }

    try
    {
      const decoded = response.map((item) => JSON.parse(item))
      return decoded
    }
    catch(previousError)
    {
      const error = new Error('read ordered set range failed when decoding the response')
      error.code  = 'E_REDIS_ORDERED_READ'
      error.chain = { previousError, key, min, max, response }
      throw error
    }
  }

  /**
   * @param {string} key 
   * @param {boolean} [normal=true] if to return the forward or reversed score
   */
  async readScore(key, normal=true)
  {
    try
    {
      const
        response  = normal
                  ? await this.gateway.cmd('ZRANGEBYSCORE',     key, '-inf', '+inf', 'WITHSCORES', 'LIMIT', 0, 1)
                  : await this.gateway.cmd('ZREVRANGEBYSCORE',  key, '+inf', '-inf', 'WITHSCORES', 'LIMIT', 0, 1),
        score     = !!response.length && Number(response.pop())

      return score
    }
    catch(previousError)
    {
      const error = new Error('read ordered set score failed')
      error.code  = 'E_REDIS_ORDERED_READ_SCORE'
      error.chain = { previousError, key, min }
      throw error
    }
  }

  async delete(key, min, max)
  {
    max = max || min

    try
    {
      return await this.gateway.cmd('ZREMRANGEBYSCORE', key, min, max)
    }
    catch(previousError)
    {
      const error = new Error('delete ordered set by score range failed')
      error.code  = 'E_REDIS_ORDERED_DELETE'
      error.chain = { previousError, key, min, max }
      throw error
    }
  }

  async deleteValue(key, value)
  {
    try
    {
      const encoded = JSON.stringify(value)
      return await this.gateway.cmd('ZREM', key, encoded)
    }
    catch(previousError)
    {
      const error = new Error('delete ordered set value failed')
      error.code  = 'E_REDIS_ORDERED_DELETE_VALUE'
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
        result  = await this.gateway.cmd('ZSCORE', key, encoded)

      return result !== null
    }
    catch(previousError)
    {
      const error = new Error('failed to check if the ordered set has value')
      error.code  = 'E_REDIS_ORDERED_HAS_VALUE'
      error.chain = { previousError, key, value }
      throw error
    }
  }
}

module.exports = RedisServiceOrdered
