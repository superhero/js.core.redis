/**
 * @memberof Redis.Client
 */
class RedisServicePubsub
{
  constructor(gateway, eventbus)
  {
    this.gateway      = gateway
    this.eventbus     = eventbus
    this.subscribers  = []

    this.gateway.on('message', this.onMessage.bind(this))
  }

  /**
   * @private
   * @param {string} channel 
   * @param {*} msg 
   */
  onMessage(channel, msg)
  {
    const dto = JSON.parse(msg)
    this.eventbus.emit(channel, dto)
  }

  publish(channel, msg = null)
  {
    const encoded = JSON.stringify(msg)
    this.gateway.publish(channel, encoded)
  }

  /**
   * @param {string} channel 
   * @param {function} observer 
   * 
   * @returns {number} subscriber id
   */
  subscribe(channel, observer)
  {
    this.gateway.subscribe(channel)
    const subscriberId = this.subscribers.push(observer)
    this.eventbus.on(channel, observer)
    return subscriberId - 1
  }

  /**
   * @param {string} channel 
   * @param {number} subscriberId
   */
  unsubscribe(channel, subscriberId)
  {
    const subscriber = this.subscribers[subscriberId]
    this.eventbus.removeListener(channel, subscriber)
    delete this.subscribers[subscriberId]
    
    if(this.eventbus.listeners(channel).length === 0) 
    {
      this.gateway.unsubscribe(channel)
    }
  }

  unsubscribeAll(channel)
  {
    this.gateway.unsubscribe(channel)
    this.eventbus.removeAllListeners(channel)
  }
}

module.exports = RedisServicePubsub
