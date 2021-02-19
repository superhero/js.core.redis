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

        accept(response)
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

        accept(response)
      })
    })
  }
}

module.exports = RedisServiceKey
