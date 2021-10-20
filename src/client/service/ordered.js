/**
 * @memberof Redis.Client
 */
class RedisServiceOrdered
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  write(key, value, score)
  {
    return new Promise((accept, reject) =>
    {
      const encoded = JSON.stringify(value)

      this.gateway.zadd(key, score, encoded, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('write ordered set failed')
          error.code  = 'E_REDIS_SET_WRITE'
          error.chain = { previousError, key, score, value }
          reject(error)
        }
        else
        {
          accept(response)
        }
      })
    })
  }

  read(key, min, max)
  {
    max = max || min
    min = min || '-inf'
    max = max || '+inf'

    return new Promise((accept, reject) =>
    {
      this.gateway.zrangebyscore(key, min, max, (previousError, responses) =>
      {
        if(previousError)
        {
          const error = new Error('read ordered set range failed')
          error.code  = 'E_REDIS_ORDERED_READ'
          error.chain = { previousError, key, min, max }
          reject(error)
        }
        else
        {
          try
          {
            const decoded = responses.map((response) => JSON.parse(response))
            accept(decoded)
          }
          catch(previousError)
          {
            const error = new Error('read ordered set range failed when decoding the response')
            error.code  = 'E_REDIS_ORDERED_READ'
            error.chain = { previousError, key, min, max, responses }
            reject(error)
          }
        }
      })
    })
  }

  /**
   * @param {string} key 
   * @param {boolean} [min=true] if to return the smallest or largest score
   */
  readScore(key, min = true)
  {
    return new Promise((accept, reject) =>
    {
      const order = min
                  ? ['-inf', '+inf']
                  : ['+inf', '-inf']

      this.gateway.zrangebyscore(key, ...order, 'WITHSCORES', 'LIMIT', 0, 1, (previousError, responses) =>
      {
        if(previousError)
        {
          const error = new Error('read ordered set score failed')
          error.code  = 'E_REDIS_ORDERED_READ_SCORE'
          error.chain = { previousError, key, min }
          reject(error)
        }
        else
        {
          const score = !!responses.length && Number(responses.pop())
          accept(score)
        }
      })
    })
  }

  delete(key, min, max)
  {
    max = max || min
    return new Promise((accept, reject) =>
    {
      this.gateway.zremrangebyscore(key, min, max, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('delete ordered set by score range failed')
          error.code  = 'E_REDIS_ORDERED_DELETE'
          error.chain = { previousError, key, min, max }
          reject(error)
        }
        else
        {
          accept(response)
        }
      })
    })
  }

  deleteValue(key, value)
  {
    return new Promise((accept, reject) =>
    {
      const encoded = JSON.stringify(value)

      this.gateway.zrem(key, encoded, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('delete ordered set value failed')
          error.code  = 'E_REDIS_ORDERED_DELETE_VALUE'
          error.chain = { previousError, key, value }
          reject(error)
        }
        else
        {
          accept(response)
        }
      })
    })
  }
}

module.exports = RedisServiceOrdered
