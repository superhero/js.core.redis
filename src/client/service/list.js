/**
 * @memberof Redis.Client
 */
class RedisServiceList
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  /**
   * start 0 and stop 0 will return full length of list
   * 
   * @param {string} key 
   * @param {number} start 
   * @param {number} stop sent to redis after subtracted with the value 1
   */
  range(key, start, stop)
  {

    return new Promise((accept, reject) =>
    {
      // list 0 10 will return 11 elements, that is, the rightmost item is included. 
      // this is not consistent with the behavior of nodejs
      this.gateway.lrange(key, start, stop - 1, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('range list error occured')
          error.code  = 'E_REDIS_LIST_RANGE'
          error.chain = { previousError, key, start, stop }
          reject(error)
        }

        try
        {
          const decoded = response && response.map((item) => JSON.parse(item))
          accept(decoded)
        }
        catch(previousError)
        {
          const error = new Error('range list error occured when decoding the response')
          error.code  = 'E_REDIS_LIST_RANGE'
          error.chain = { previousError, key, start, stop }
          reject(error)
        }
      })
    })
  }

  length(key)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.llen(key, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('list length error occured')
          error.code  = 'E_REDIS_LIST_LENGTH'
          error.chain = { previousError, key, start, stop }
          reject(error)
        }

        accept(response)
      })
    })
  }

  lpush(key, value)
  {
    return new Promise((accept, reject) =>
    {
      const encoded = JSON.stringify(value)

      this.gateway.lpush(key, encoded, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('left push list error occured')
          error.code  = 'E_REDIS_LIST_PUSH_LEFT'
          error.chain = { previousError, key, value }
          reject(error)
        }

        accept(response)
      })
    })
  }

  lpop(key)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.lpop(key, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('left pop list error occured')
          error.code  = 'E_REDIS_LIST_POP_LEFT'
          error.chain = { previousError, key }
          reject(error)
        }

        try
        {
          const decoded = JSON.parse(response)
          accept(decoded)
        }
        catch(previousError)
        {
          const error = new Error('left pop list error occured when decoding the response')
          error.code  = 'E_REDIS_LIST_POP_LEFT'
          error.chain = { previousError, key, response }
          reject(error)
        }
      })
    })
  }

  rpush(key, value)
  {
    return new Promise((accept, reject) =>
    {
      const encoded = JSON.stringify(value)

      this.gateway.rpush(key, encoded, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('right push list error occured')
          error.code  = 'E_REDIS_LIST_PUSH_RIGHT'
          error.chain = { previousError, key, value }
          reject(error)
        }

        accept(response)
      })
    })
  }

  rpop(key)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.rpop(key, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('right pop list error occured')
          error.code  = 'E_REDIS_LIST_POP_RIGHT'
          error.chain = { previousError, key }
          reject(error)
        }

        try
        {
          const decoded = JSON.parse(response)
          accept(decoded)
        }
        catch(previousError)
        {
          const error = new Error('right pop list error occured when decoding the response')
          error.code  = 'E_REDIS_LIST_POP_RIGHT'
          error.chain = { previousError, key, response }
          reject(error)
        }
      })
    })
  }
}

module.exports = RedisServiceList
