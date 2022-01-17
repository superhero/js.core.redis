/**
 * @memberof Redis.Client
 */
class RedisClientGateway
{
  constructor(redis)
  {
    this.redis = redis
  }

  async cmd(...args)
  {
    try
    {
      args = args.map((arg) => `${arg}`)
      return await this.redis.sendCommand(args)
    }
    catch(previousError)
    {
      switch(previousError.message)
      {
        case 'The client is closed': 
        {
          await this.redis.connect()
          return await this.cmd(...args)
        }
        default: 
        {
          throw previousError
        }
      }
    }
  }
}

module.exports = RedisClientGateway
