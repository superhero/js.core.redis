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
        else
        {
          accept(response)
        }
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
        else
        {
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
        else
        {
          accept(response)
        }
      })
    })
  }

  fieldExists(key, field)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.hexists(key, field, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('hash field exists failed')
          error.code  = 'E_REDIS_HASH_FIELD_EXISTS'
          error.chain = { previousError, key, field }
          reject(error)
        }
        else
        {
          accept(response)
        }
      })
    })
  }

  readAll(key)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.hgetall(key, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('read all hash fields and values failed')
          error.code  = 'E_REDIS_HASH_READ_ALL'
          error.chain = { previousError, key }
          reject(error)
        }
        else
        {
          try
          {
            for(const attr in response)
            {
              response[attr] = JSON.parse(response[attr])
            }

            accept(response)
          }
          catch(previousError)
          {
            console.log(previousError)
            const error = new Error('read hash all error occured when decoding the response')
            error.code  = 'E_REDIS_HASH_READ_ALL'
            error.chain = { previousError, key, response }
            reject(error)
          }
        }
      })
    })
  }
}

module.exports = RedisServiceHash
