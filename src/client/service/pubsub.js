/**
 * @memberof Redis.Client
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

  unsubscribe(channel)
  {
    this.gateway.unsubscribe(channel)
    this.eventbus.removeAllListeners(channel)
  }

  publish(channel, msg = null)
  {
    const encoded = JSON.stringify(msg)
    this.gateway.publish(channel, encoded)
  }
}

module.exports = RedisServicePubsub
