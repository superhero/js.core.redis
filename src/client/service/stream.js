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

        accept(response)
      })
    })
  }

  read(stream, group, consumer)
  {
    return new Promise((accept, reject) =>
    {
      this.gateway.xreadgroup('GROUP', group, 'consumer', 'STREAMS', stream, '>', async (previousError, result) =>
      {
        if(previousError)
        {
          const error = new Error('stream error occured')
          error.code  = 'E_REDIS_STREAM_READ_GATEWAY'
          error.chain = { previousError, group }
          this.console.log(error)
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

          // TODO move to mapper
          // mapping dto from a csv array to a json object
          for(let i = 1; i < dto.length; i += 2)
          {
            const
              key = dto[i-1],
              val = JSON.parse(dto[i])

            msg[key] = val
          }

          try
          {
            consumer && await consumer(msg)
            this.gateway.xack(stream, group, id)
            accept(msg)
          }
          catch(previousError)
          {
            const error = new Error('consumer failed')
            error.code  = 'E_REDIS_STREAM_READ_CONSUMER'
            error.chain = { previousError, stream, group, id, msg }
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
              reject(error)
            }
          }
        }
        accept(response || 'OK')
      })
    })
  }
}

module.exports = RedisServiceStream
