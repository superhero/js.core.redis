/**
 * @namespace Redis.Client
 */
module.exports =
{
  core:
  {
    bootstrap:
    {
      'redis-auth' : 'redis/client'
    },
    locator:
    {
      'redis/client' : __dirname
    }
  },
  client:
  {
    redis:
    {
      auth    : process.env.REDIS_AUTH,
      gateway :
      {
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
      }
    }
  }
}
