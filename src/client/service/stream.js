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

  write(stream, msg)
  {
    return new Promise((accept, reject) =>
    {
      const
        entries = Object.entries(msg),
        dto     = []
  
      // TODO move to mapper
      // mapping message entries to a dto
      for(let i = 0; i < entries.length; i++)
      {
        dto.push(entries[i][0])
        dto.push(JSON.stringify(entries[i][1]))
      }

      this.gateway.xadd(stream, '*', ...dto, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('stream error occured')
          error.code  = 'E_REDIS_STREAM_WRITE'
          error.chain = { previousError, stream, msg, dto }
          reject(error)
        }
        else
        {
          accept(response)
        }
      })
    })
  }

  readGroup(stream, group, consumer)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.xreadgroup('GROUP', group, 'consumer', 'COUNT', 1, 'STREAMS', stream, '>', async (previousError, result) =>
      {
        if(previousError)
        {
          const error = new Error('stream error occured')
          error.code  = 'E_REDIS_STREAM_READ_GROUP_GATEWAY'
          error.chain = { previousError, stream, group }
          reject(error)
        }
        else if(result === null)
        {
          accept(result)
        }
        else
        {
          const
            id  = result[0][1][0][0],
            dto = result[0][1][0][1],
            msg = {}

          try
          {
            // TODO move to mapper
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
            error.chain = { previousError, stream, group, id }
            return reject(error)
          }

          try
          {
            consumer && await consumer(id, msg)
            await this.ack(stream, group, id)
            accept(msg)
          }
          catch(previousError)
          {
            const error = new Error('read from group - consumer failed')
            error.code  = 'E_REDIS_STREAM_READ_GROUP_CONSUMER'
            error.chain = { previousError, stream, group, id }
            return reject(error)
          }
        }
      })
    })
  }

  ack(stream, group, id)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.xack(stream, group, id, (previousError, response) =>
      {
        if(previousError)
        {
          const error = new Error('failed to acknowledge stream')
          error.code  = 'E_REDIS_STREAM_READ_GROUP_CONSUMER'
          error.chain = { previousError, stream, group, id }
          reject(error)
        }
        else
        {
          accept(response)
        }
      })
    })
  }

  async read(stream, id)
  {
    const response = await this.readRange(stream, id, id)
    return response.length === 1 ? response[0] : null
  }

  readRange(stream, from, to)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.XRANGE(stream, from, to, async (previousError, result) =>
      {
        if(previousError)
        {
          const error = new Error('stream error occured')
          error.code  = 'E_REDIS_STREAM_READ_GATEWAY'
          error.chain = { previousError, stream, id }
          reject(error)
        }
        else
        {
          const output = []
          for(let n = 0; n < result.length; n++)
          {
            const
              dto = result[n][1],
              msg = {}
            
            // TODO move to mapper
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
  
          try
          {
            accept(output)
          }
          catch(previousError)
          {
            const error = new Error('read from stream failed')
            error.code  = 'E_REDIS_STREAM_READ'
            error.chain = { previousError, stream, id }
            reject(error)
          }
        }
      })
    })
  }

  lazyloadConsumerGroup(stream, group)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.xgroup('CREATE', stream, group, '$', 'MKSTREAM', (previousError, response) =>
      {
        if(previousError)
        {
          switch(previousError.code)
          {
            case 'BUSYGROUP': break
            default: 
            {
              const error = new Error('Lazyloading consumer group failed')
              error.code  = 'E_REDIS_LAZYLOADING_CONSUMER_GROUP'
              error.chain = { previousError, stream, group }
              return reject(error)
            }
          }
        }
        accept(response || 'OK')
      })
    })
  }
}

module.exports = RedisServiceStream
