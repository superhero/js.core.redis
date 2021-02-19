/**
 * @memberof Redis.Client
 */
class RedisServiceHash
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  write(key, field, value)
  {
    return new Promise((accept, reject) =>
    {
      const encoded = JSON.stringify(value)

      this.gateway.hset(key, field, encoded, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('write hash error occured')
          error.code  = 'E_REDIS_HASH_WRITE'
          error.chain = { previousError, key, field, value }
          reject(error)
        }

        accept(response)
      })
    })
  }

  read(key, field)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.hget(key, field, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('read hash error occured')
          error.code  = 'E_REDIS_HASH_READ'
          error.chain = { previousError, key, field }
          reject(error)
        }

        try
        {
          const decoded = JSON.parse(response)
          accept(decoded)
        }
        catch(previousError)
        {
          const error = new Error('read hash error occured when decoding the response')
          error.code  = 'E_REDIS_HASH_READ'
          error.chain = { previousError, key, response }
          reject(error)
        }
      })
    })
  }

  delete(key, field)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.hdel(key, field, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('delete key failed')
          error.code  = 'E_REDIS_HASH_DELETE'
          error.chain = { previousError, key, field }
          reject(error)
        }

        accept(response)
      })
    })
  }
}

module.exports = RedisServiceHash
