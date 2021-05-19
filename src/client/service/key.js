/**
 * @memberof Redis.Client
 */
class RedisServiceKey
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  write(key, value)
  {
    return new Promise((accept, reject) =>
    {
      const encoded = JSON.stringify(value)

      this.gateway.set(key, encoded, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('set key failed')
          error.code  = 'E_REDIS_KEY_WRITE'
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

  read(key)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.get(key, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('get key failed')
          error.code  = 'E_REDIS_KEY_READ'
          error.chain = { previousError, key }
          reject(error)
        }
        else
        {
          try
          {
            const decoded = JSON.parse(response)
            accept(decoded)
          }
          catch(previousError)
          {
            const error = new Error('get key failed when decoding the response')
            error.code  = 'E_REDIS_KEY_READ'
            error.chain = { previousError, key, response }
            reject(error)
          }
        }
      })
    })
  }

  increment(key, i = 1)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.incrbyfloat(key, i, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('increment key failed')
          error.code  = 'E_REDIS_KEY_INCREMENT'
          error.chain = { previousError, key }
          reject(error)
        }
        else
        {
          accept(response)
        }
      })
    })
  }

  expire(key)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.expire(key, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('expire key failed')
          error.code  = 'E_REDIS_KEY_EXPIRE'
          error.chain = { previousError, key }
          reject(error)
        }
        else
        {
          accept(response)
        }
      })
    })
  }

  delete(key)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.del(key, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('delete key failed')
          error.code  = 'E_REDIS_KEY_DELETE'
          error.chain = { previousError, key }
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

module.exports = RedisServiceKey
