const
  redis               = require('redis'),
  process             = require('process'),
  RedisClient         = require('.'),
  RedisClientGateway  = require('./gateway'),
  RedisCluster        = require('./service/cluster'),
  RedisConnection     = require('./service/connection'),
  RedisHash           = require('./service/hash'),
  RedisKey            = require('./service/key'),
  RedisList           = require('./service/list'),
  RedisOrdered        = require('./service/ordered'),
  RedisPubsub         = require('./service/pubsub'),
  RedisStream         = require('./service/stream'),
  RedisTransaction    = require('./service/transaction')

/**
 * @memberof Redis.Client
 * @extends {superhero/core/locator/constituent}
 */
class RedisClientFactory
{
  /**
   * @returns {RedisClient}
   */
  create(console, config)
  {
    try
    {
      const
        client      = this.createClient(config),
        gateway     = new RedisClientGateway(client),
        cluster     = new RedisCluster(gateway),
        connection  = new RedisConnection(gateway),
        hash        = new RedisHash(gateway),
        key         = new RedisKey(gateway),
        list        = new RedisList(gateway),
        ordered     = new RedisOrdered(gateway),
        pubsub      = new RedisPubsub(gateway),
        stream      = new RedisStream(gateway, console),
        factory     = this.create.bind(this, console, config),
        transaction = new RedisTransaction(gateway)
  
      client.on('error', (error) => 
      {
        console.error('redis client error:', error)
        console.error('redis client error discovered, terminating process...')
        console.error('redis client config...', config)
        process.nextTick(() => process.kill(process.pid, 'SIGKILL'))
      })
  
      return new RedisClient(config, console, gateway, factory, cluster, connection, hash, key, list, ordered, pubsub, stream, transaction)
    }
    catch(previousError)
    {
      const error = new Error('could not create the redis client')
      error.chain = { previousError, config }
      error.code = 'E_CORE_REDIS_CLIENT_FACTORY_CREATE'
      throw error
    }
  }

  createClient(config)
  {
    if(config.cluster?.length)
    {
      return redis.createCluster(config.cluster)
    }
    else
    {
      return redis.createClient(config.gateway)
    }
  }
}

module.exports = RedisClientFactory
