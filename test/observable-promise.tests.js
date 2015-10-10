describe('observable promise extension', function() {
  var ko = require('../')(require('knockout')),
      Q = require('q'),
      chai = require('chai'),
      sinon = require('sinon'),
      deferred,
      observable

  chai.should()
  chai.use(require('sinon-chai'))

  function commonTests(mode) {
    it('should not notify subscribers if the promise is no longer the value of the observable', function() {
      observable(Q.defer().promise)
      observable.subscribe(function() {
        done(new Error('The first observable was called'))
      })

      deferred.resolve()
      return deferred.promise
    })

    it('should allow assignment of a non-promise', function() {
      observable.subscribe(function(val) {
        val.should.equal('hi')
      })
      observable('hi')
      observable().should.equal('hi')
    })

    it('should allow assignment of null or undefined', function() {
      observable(null)
      chai.expect(observable()).to.equal(null)
      observable(undefined)
      chai.expect(observable()).to.equal(undefined)
    })

    mode !== 'status' && it('should subscribe to new promises', function() {
      var sub = sinon.spy()
      observable.subscribe(sub)

      var newDeferred = Q.defer()
      observable(newDeferred.promise)
      sub.should.have.been.calledOnce

      newDeferred.resolve('bye!')

      return newDeferred.promise.then(function() {
        sub.should.have.been.calledTwice
        sub.firstCall.should.have.been.calledWith(newDeferred.promise)
        sub.secondCall.should.have.been.calledWith(mode === 'convert' ? 'bye!' : newDeferred.promise)
      })
    })
  }

  describe('no mode', function() {
    beforeEach(function() {
      deferred = Q.defer()
      observable = ko.observable(deferred.promise).extend({ promise: true })
    })

    it('should notify subscribers when the promise resolves', function(done) {
      observable.subscribe(function(val) {
        val.isFulfilled().should.be.true
        done()
      })
      deferred.resolve('hi')
    })

    it('should notify subscribers when the promise fails', function(done) {
      observable.subscribe(function(val) {
        val.isRejected().should.be.true
        done()
      })
      deferred.reject(new Error('oops'))
    })

    commonTests(false)
  })

  describe('auto conversion mode', function() {
    beforeEach(function() {
      deferred = Q.defer()
      observable = ko.observable(deferred.promise).extend({ promise: 'convert' })
    })

    it('should set the observable when the promise resolves', function() {
      observable.subscribe(function(val) {
        val.should.equal('hi')
      })
      deferred.resolve('hi')
      return deferred.promise
    })

    it('should set the observable when the promise fails', function() {
      observable.subscribe(function(val) {
        val.should.be.instanceof(Error)
      })
      deferred.reject(new Error('oops'))
      return deferred.promise.then(undefined, function() { return true })
    })

    it('should be aliased as ko.observablePromise', function() {
      observable = ko.observablePromise(deferred.promise)
      observable.subscribe(function(val) {
        val.should.equal('hi')
      })
      deferred.resolve('hi')
      return deferred.promise
    })

    commonTests('convert')
  })

  describe('status mode', function() {
    beforeEach(function() {
      deferred = Q.defer()
      observable = ko.observable(deferred.promise).extend({ promise: 'status' })
    })

    it('should be "pending" initially', function() {
      observable().should.equal('pending')
    })

    it('should set status to "resolved" when the promise resolves', function(done) {
      observable.subscribe(function(val) {
        val.should.equal('resolved')
        done()
      })
      deferred.resolve('hi')
    })

    it('should set status to "rejected" when the promise fails', function(done) {
      observable.subscribe(function(val) {
        try {
          val.should.equal('rejected')
          done()
        } catch(e) {
          done(e)
        }
      })
      deferred.reject(new Error('oops'))
    })

    commonTests('status')

    it('should subscribe to new promises', function() {
      var sub = sinon.spy()
      observable.subscribe(sub)

      var newDeferred = Q.defer()
      observable(newDeferred.promise)
      sub.should.have.not.been.called

      newDeferred.resolve('bye!')

      return newDeferred.promise.then(function() {
        sub.should.have.been.calledOnce.and.calledWith('resolved')
      })
    })
  })
})