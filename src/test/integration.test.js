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
    core.locate('redis/client').connection.quit()
  })

  describe('Redis service connection', () =>
  {
    it('can list clients', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.connection.clientList()

      context(this, { title:'context', value:{ result }})
      expect(Array.isArray(result)).to.equal(true)
    })
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

    it('field exists', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.hash.fieldExists(key, field)
  
      context(this, { title:'context', value:{ key, field, result }})
      expect(result).to.equal(1)
    })

    it('can read all fields and values', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.hash.readAll(key)
  
      context(this, { title:'context', value:{ key, result }})
      expect(result[field]).to.deep.equal(value)
    })

    it('can increment a hash field', async function()
    {
      const
        inckey = 'test-inchash-' + Date.now(),
        client = core.locate('redis/client'),
        result = await client.hash.increment(inckey, 'field')
  
      context(this, { title:'context', value:{ key, result }})
      expect(result).to.equal('1')
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

    it('can expire a key', async function()
    {
      const
        seconds = 10,
        client  = core.locate('redis/client'),
        result  = await client.key.write(key, value),
        expired = await client.key.expire(key, seconds)

      context(this, { title:'context', value:{ key, value, result }})

      expect(result).to.equal('OK')
      expect(expired).to.equal(1)
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

    it('can increment a key', async function()
    {
      const
        inckey = 'test-inckey-' + Date.now(),
        client = core.locate('redis/client'),
        result = await client.key.increment(inckey)
  
      context(this, { title:'context', value:{ key, result }})
      expect(result).to.equal('1')
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
  
  describe.only('Redis service ordered', () =>
  {
    const
      key   = 'test-ordered',
      value = 123,
      score = 10

    it('can write to an ordered set', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.ordered.write(key, value, score)
  
      context(this, { title:'context', value:{ key, value, score, result }})
      expect(result).to.equal(1)
    })
  
    it('can read from an ordered set', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.ordered.read(key, score)
  
      context(this, { title:'context', value:{ key, value, score, result }})
      expect(result).to.deep.equal([ value ])
    })
  
    it('can read min score from an ordered set', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.ordered.readScore(key)
  
      context(this, { title:'context', value:{ key, score, result }})
      expect(result).to.equal(score)
    })

    it('can read all values from an ordered set when emitting the min and max arguments', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.ordered.read(key)
  
      context(this, { title:'context', value:{ key, value, score, result }})
      expect(result).to.deep.equal([ value ])
    })

    it('can delete a from an ordered set by score', async function()
    {
      const
        client = core.locate('redis/client'),
        result = await client.ordered.delete(key, score)
  
      context(this, { title:'context', value:{ key, score, result }})
      expect(result).to.equal(1)
    })

    it('can delete a from an ordered set by value', async function()
    {
      const client = core.locate('redis/client')
      await client.ordered.write(key, value, score)
      const result = await client.ordered.deleteValue(key, value)
  
      context(this, { title:'context', value:{ key, value, score, result }})
      expect(result).to.equal(1)
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
      subscriber.pubsub.subscribe(channel, (dto) =>
      {
        expect(dto).to.deep.equal(msg)
        subscriber.connection.quit()
        done()
      }).then(() => client.pubsub.publish(channel, msg))
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

      await session.connection.quit()
  
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

      await session.connection.quit()
  
      context(this, { title:'context', value:{ key, value, watchResult, multiResult, writeResult, execResult }})
      expect(execResult).to.not.equal(null)
    })
  })
})
