/**
 * @namespace Redis.Client
 */
module.exports =
{
  core:
  {
    locator:
    {
      'client/redis' : __dirname
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
