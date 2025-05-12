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
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        reconnectStrategy: retries => Math.min(retries * 100, 2000),
      },
      cluster :
      [
        // { url: 'redis://10.0.0.1:30001' },
        // { url: 'redis://10.0.0.2:30002' }
      ]
    }
  }
}
