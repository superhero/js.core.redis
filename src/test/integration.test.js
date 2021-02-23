const
  expect  = require('chai').expect,
  context = require('mochawesome/addContext')

describe('Redis client test suit', () =>
{
  let core

  before((done) =>
  {
    const
      CoreFactory = require('superhero/core/factory'),
      coreFactory = new CoreFactory

    core = coreFactory.create()

    core.add('client', __dirname + '/../client')
    core.add('test', __dirname)

    core.load()

    core.locate('core/bootstrap').bootstrap().then(done)
  })

  after(() =>
  {
    core.locate('redis/client').quit()
  })

  describe('Redis service hash', () =>
  {
    const
      key   = 'test-hash-key', 
      field = 'test-hash-field', 
      value = { test:{ hash:'value' }}

    it('can write a hash', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.hash.write(key, field, value)
  
      context(this, { title:'context', value:{ key, field, value, result }})
      expect(result).to.equal(1)
    })
  
    it('can read a hash', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.hash.read(key, field)
  
      context(this, { title:'context', value:{ key, field, value, result }})
      expect(result).to.deep.equal(value)
    })

    it('can delete a hash', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.hash.delete(key, field)
  
      context(this, { title:'context', value:{ key, field, result }})
      expect(result).to.equal(1)
    })
  })

  describe('Redis service key', () =>
  {
    const
      key   = 'test-key',
      value = { test:'value' }

    it('can write a key', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.key.write(key, value)
  
      context(this, { title:'context', value:{ key, value, result }})
      expect(result).to.equal('OK')
    })
  
    it('can read a key', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.key.read(key)
  
      context(this, { title:'context', value:{ key, value, result }})
      expect(result).to.deep.equal(value)
    })

    it('can delete a key', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.key.delete(key)
  
      context(this, { title:'context', value:{ key, result }})
      expect(result).to.equal(1)
    })
  })

  describe('Redis service list', () =>
  {
    const
      key   = 'test-list-key',
      value = { test:'value' }

    it('can push to a list', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.list.lpush(key, value)
  
      context(this, { title:'context', value:{ key, value, result }})
      expect(result).to.equal(1)
    })
  
    it('can fetch the full range from a list', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.list.range(key, 0, 0)
  
      context(this, { title:'context', value:{ key, value, result }})
      expect(result).to.deep.equal([ value ])
    })
  
    it('can pop from a list', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.list.rpop(key)
  
      context(this, { title:'context', value:{ key, value, result }})
      expect(result).to.deep.equal(value)
    })
  })

  describe('Redis service pubsub', () =>
  {
    const
      channel = 'test-channel', 
      msg     = { test:'value' }

    it('can publish and subscribe to a channel', function(done)
    {
      const
        client      = core.locate('redis/client'),
        subscriber  = client.createSession()
      
      context(this, { title:'context', value:{ channel, msg }})
      subscriber.pubsub.gateway.on('subscribe', () => client.pubsub.publish(channel, msg))
      subscriber.pubsub.subscribe(channel, (dto) =>
      {
        expect(dto).to.deep.equal(msg)
        subscriber.quit()
        done()
      })
    })
  })

  describe('Redis service stream', () =>
  {
    const
      channel = 'test-channel',
      msg     = { test:'value' }

    it('can lazyload consumer group', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.stream.lazyloadConsumerGroup(channel, channel)
  
      context(this, { title:'context', value:{ channel, msg, result }})
      expect(result).to.equal('OK')
    })

    it('can write to a stream', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.stream.write(channel, msg)
  
      context(this, { title:'context', value:{ channel, msg, result }})
      expect(result).to.not.equal(null)
      expect(result).to.not.equal(undefined)
    })
  
    it('can read a stream through a group', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.stream.readGroup(channel, channel)
  
      context(this, { title:'context', value:{ channel, msg, result }})
      expect(result).to.deep.equal(msg)
    })
  
    it('can read an acknowledged message by a specific id', function(done)
    {
      const client = core.locate('redis/client')
      client.stream.write(channel, msg)
      client.stream.readGroup(channel, channel, (id, resultGroup) => 
      {
        setImmediate(async () =>
        {
          const resultStream = await client.stream.read(channel, id)
          expect(resultGroup).to.deep.equal(msg)
          expect(resultStream).to.deep.equal(msg)
          context(this, { title:'context', value:{ channel, msg, resultStream, resultGroup }})
          done()
        })
      })
    })
  })

  describe('Redis service transaction', () =>
  {
    const
      key   = 'test-key', 
      value = { test:'value' }

    it('can make a simple transaction', async function()
    {
      const
        client      = core.locate('redis/client'),
        session     = client.createSession(),
        multiResult = await session.transaction.multi(),
        writeResult = await session.key.write(key, value),
        execResult  = await session.transaction.exec()

      await session.quit()
  
      context(this, { title:'context', value:{ key, value, multiResult, writeResult, execResult }})
      expect(execResult).to.not.equal(null)
    })
  
    it('can make a simple transaction with "watch"', async function()
    {
      const
        client      = core.locate('redis/client'),
        session     = client.createSession(),
        watchResult = await session.transaction.watch(key),
        multiResult = await session.transaction.multi(),
        writeResult = await client.key.read(key),
        execResult  = await session.transaction.exec()

      await session.quit()
  
      context(this, { title:'context', value:{ key, value, watchResult, multiResult, writeResult, execResult }})
      expect(execResult).to.not.equal(null)
    })
  })
})
