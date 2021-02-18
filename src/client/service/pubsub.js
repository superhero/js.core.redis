/**
 * @memberof Client.Redis
 */
class RedisServicePubsub
{
  constructor(gateway, eventbus)
  {
    this.gateway  = gateway
    this.eventbus = eventbus

    this.gateway.on('message', this.onMessage.bind(this))
  }

  /**
   * @private
   * @param {string} channel 
   * @param {*} msg 
   */
  onMessage(channel, msg)
  {
    try
    {
      const dto = JSON.parse(msg)
      this.eventbus.emit(channel, dto)
    }
    catch(error)
    {
      this.onMessageError(channel, error)
    }
  }

  onMessageError(channel, error)
  {
    this.eventbus.emit(channel, error)
  }

  subscribe(channel, observer)
  {
    this.gateway.subscribe(channel)
    this.eventbus.on(channel, observer)
  }

  publish(channel, msg)
  {
    const encoded = JSON.stringify(msg)
    this.gateway.publish(channel, encoded)
  }
}

module.exports = RedisServicePubsub