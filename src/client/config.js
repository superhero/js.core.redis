/**
 * @namespace Redis.Client
 */
module.exports =
{
  core:
  {
    locator:
    {
      'redis/client' : __dirname
    }
  },
  client:
  {
    redis:
    {
      gateway:
      {
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
      }
    }
  }
}
