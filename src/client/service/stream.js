/**
 * @memberof Redis.Client
 */
class RedisServiceStream
{
  constructor(gateway, console)
  {
    this.gateway  = gateway
    this.console  = console
  }

  async write(stream, msg)
  {
    if(typeof msg !== 'object')
    {
      const error = new Error('can only write a message (msg) of type "object"')
      error.code  = 'E_REDIS_STREAM_WRITE_INVALID_MESSAGE'
      error.chain = { previousError, stream, msg }
      return reject(error)
    }

    try
    {
      const
        entries = Object.entries(msg),
        input   = []
  
      // mapping message entries to the input model
      for(let i = 0; i < entries.length; i++)
      {
        input.push(entries[i][0])
        input.push(JSON.stringify(entries[i][1]))
      }

      return await this.gateway.cmd('XADD', stream, '*', ...input)
    }
    catch(previousError)
    {
      const error = new Error('stream error occured')
      error.code  = 'E_REDIS_STREAM_WRITE'
      error.chain = { previousError, stream, msg }
      throw error
    }
  }

  async readGroup(stream, group, consumer)
  {
    let response

    try
    {
      response = await this.gateway.cmd('XREADGROUP', 'GROUP', group, 'consumer', 'COUNT', 1, 'STREAMS', stream, '>')
    }
    catch(previousError)
    {
      const error = new Error('stream error occured')
      error.code  = 'E_REDIS_STREAM_READ_GROUP_GATEWAY'
      error.chain = { previousError, stream, group }
      throw error
    }

    if(response === null)
    {
      return response
    }
    else
    {
      let id, dto, msg

      try
      {
        id  = response[0][1][0][0],
        dto = response[0][1][0][1],
        msg = {}

        // mapping dto from a csv array to a json object
        for(let i = 1; i < dto.length; i += 2)
        {
          const
            key = dto[i-1],
            val = JSON.parse(dto[i])

          msg[key] = val
        }
      }
      catch(previousError)
      {
        const error = new Error('read from group - mapping failed')
        error.code  = 'E_REDIS_STREAM_READ_GROUP_MAPPER'
        error.chain = { previousError, stream, group, response }
        throw error
      }

      try
      {
        consumer && await consumer(id, msg)
        await this.ack(stream, group, id)
        return msg
      }
      catch(previousError)
      {
        const error = new Error('read from group - consumer failed')
        error.code  = 'E_REDIS_STREAM_READ_GROUP_CONSUMER'
        error.chain = { previousError, stream, group, id }
        throw error
      }
    }
  }

  async delete(stream, id)
  {
    try
    {
      return await this.gateway.cmd('XDEL', stream, id)
    }
    catch(previousError)
    {
      const error = new Error('failed to delete stream item by id')
      error.code  = 'E_REDIS_STREAM_DELETE_ITEM'
      error.chain = { previousError, stream, id }
      throw error
    }
  }

  async ack(stream, group, id)
  {
    try
    {
      return await this.gateway.cmd('XACK', stream, group, id)
    }
    catch(previousError)
    {
      const error = new Error('failed to acknowledge stream')
      error.code  = 'E_REDIS_STREAM_READ_GROUP_CONSUMER'
      error.chain = { previousError, stream, group, id }
      throw error
    }
  }

  async read(stream, id)
  {
    const response = await this.readRange(stream, id, id)
    return response.length === 1 ? response[0] : null
  }

  async readRange(stream, from, to)
  {
    let response

    try
    {
      response = await this.gateway.cmd('XRANGE', stream, from, to)
    }
    catch(previousError)
    {
      const error = new Error('stream error occured')
      error.code  = 'E_REDIS_STREAM_READ_GATEWAY'
      error.chain = { previousError, stream, from, to }
      throw error
    }

    try
    {
      const output = []

      for(let n = 0; n < response.length; n++)
      {
        const
          dto = response[n][1],
          msg = {}
        
        // mapping dto from a csv array to a json object
        for(let i = 1; i < dto.length; i += 2)
        {
          const
            key = dto[i-1],
            val = JSON.parse(dto[i])

          msg[key] = val
        }

        output.push(msg)
      }

      return output
    }
    catch(previousError)
    {
      const error = new Error('read from stream failed')
      error.code  = 'E_REDIS_STREAM_READ'
      error.chain = { previousError, stream, id }
      throw error
    }
  }

  /**
   * @param {string} stream 
   * @param {string} group 
   * @param {string} [startFrom=$] Stream id to start from, default to $, meaning from the last inserted id. 
   *                               Specify 0 to start from the beginning and read all messages from the start
   */
  async lazyloadConsumerGroup(stream, group, startFrom = '$')
  {
    try
    {
      return await this.gateway.cmd('XGROUP', 'CREATE', stream, group, startFrom, 'MKSTREAM')
    }
    catch(previousError)
    {
      switch(previousError.message)
      {
        case 'BUSYGROUP Consumer Group name already exists': return 'OK'
        default: 
        {
          const error = new Error('Lazyloading consumer group failed')
          error.code  = 'E_REDIS_LAZYLOADING_CONSUMER_GROUP'
          error.chain = { previousError, stream, group }
          throw error
        }
      }
    }
  }
}

module.exports = RedisServiceStream
