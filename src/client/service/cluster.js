/**
 * @memberof Redis.Client
 */
class RedisServiceCluster
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  async keySlot(key, label)
  {
    try
    {
      const hashTag = label ? `${key}{${label}}` : `${key}`
      return await this.gateway.cmd('CLUSTER KEYSLOT', hashTag)
    }
    catch(previousError)
    {
      const error = new Error('failed cluster key slot')
      error.code  = 'E_REDIS_CLUSTER_KEY_SLOT'
      error.chain = { previousError, key, label }
      throw error
    }
  }
}

module.exports = RedisServiceCluster
