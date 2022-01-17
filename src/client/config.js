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
        'socket.host': process.env.REDIS_HOST,
        'socket.port': process.env.REDIS_PORT
      }
    }
  }
}
