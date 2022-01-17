/**
 * @memberof Redis.Client
 */
class RedisServiceList
{
  constructor(gateway)
  {
    this.gateway = gateway
  }

  /**
   * start 0 and stop 0 will return full length of list
   * 
   * @param {string} key 
   * @param {number} start 
   * @param {number} stop sent to redis after subtracted with the value 1
   */
  async range(key, start, stop)
  {
    let response

    try
    {
      response = await this.gateway.cmd('LRANGE', key, start, stop - 1)
    }
    catch(previousError)
    {
      const error = new Error('range list error occured')
      error.code  = 'E_REDIS_LIST_RANGE'
      error.chain = { previousError, key, start, stop }
      throw error
    }

    try
    {
      return response && response.map((item) => JSON.parse(item))
    }
    catch(previousError)
    {
      const error = new Error('range list error occured when decoding the response')
      error.code  = 'E_REDIS_LIST_RANGE'
      error.chain = { previousError, key, start, stop }
      throw error
    }
  }

  async length(key)
  {
    try
    {
      return await this.gateway.cmd('LLEN', key)
    }
    catch(previousError)
    {
      const error = new Error('list length error occured')
      error.code  = 'E_REDIS_LIST_LENGTH'
      error.chain = { previousError, key }
      throw error
    }
  }

  async lpush(key, value)
  {
    try
    {
      const encoded = JSON.stringify(value)
      return await this.gateway.cmd('LPUSH', key, encoded)
    }
    catch(previousError)
    {
      const error = new Error('left push list error occured')
      error.code  = 'E_REDIS_LIST_PUSH_LEFT'
      error.chain = { previousError, key, value }
      throw error
    }
  }

  async lpop(key)
  {
    let response

    try
    {
      response = await this.gateway.cmd('LPOP', key)
    }
    catch(previousError)
    {
      const error = new Error('left pop list error occured')
      error.code  = 'E_REDIS_LIST_POP_LEFT'
      error.chain = { previousError, key }
      throw error
    }

    try
    {
      return JSON.parse(response)
    }
    catch(previousError)
    {
      const error = new Error('left pop list error occured when decoding the response')
      error.code  = 'E_REDIS_LIST_POP_LEFT'
      error.chain = { previousError, key, response }
      throw error
    }
  }

  async rpush(key, value)
  {
    try
    {
      const encoded = JSON.stringify(value)
      return await this.gateway.cmd('RPUSH', key, encoded)
    }
    catch(previousError)
    {
      const error = new Error('right push list error occured')
      error.code  = 'E_REDIS_LIST_PUSH_RIGHT'
      error.chain = { previousError, key, value }
      throw error
    }
  }

  async rpop(key)
  {
    let response

    try
    {
      response = await this.gateway.cmd('RPOP', key)
    }
    catch(previousError)
    {
      const error = new Error('right pop list error occured')
      error.code  = 'E_REDIS_LIST_POP_RIGHT'
      error.chain = { previousError, key }
      throw error
    }

    try
    {
      return JSON.parse(response)
    }
    catch(previousError)
    {
      const error = new Error('right pop list error occured when decoding the response')
      error.code  = 'E_REDIS_LIST_POP_RIGHT'
      error.chain = { previousError, key, response }
      throw error
    }
  }
}

module.exports = RedisServiceList
