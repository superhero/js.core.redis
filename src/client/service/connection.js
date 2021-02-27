/**
 * @memberof Redis.Client
 */
class RedisServiceConnection
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  quit()
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.quit((previousError) =>
      {
        if(previousError)
        {
          const error = new Error('failed to quit redis connection')
          error.code  = 'E_REDIS_CONNECTION_QUIT'
          error.chain = { previousError }
          reject(error)
        }

        accept()
      })
    })
  }

  clientList(...args)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.client('LIST', args, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('redis client list failed')
          error.code  = 'E_REDIS_CONNECTION_CLIENT_LIST'
          error.chain = { previousError, args }
          console.log(previousError)
          reject(error)
        }
        else
        {
          accept(response.split('\n').filter(_=>_))
        }
      })
    })
  }
}

module.exports = RedisServiceConnection
