/**
 * @namespace Client.Redis
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
  infrastructure:
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
