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
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      }
    }
  }
}
