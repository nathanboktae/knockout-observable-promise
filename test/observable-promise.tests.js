describe('observable promise extension', function() {
  var ko = require('../'),
      Q = require('q'),
      chai = require('chai'),
      sinon = require('sinon'),
      deferred,
      observable

  chai.should()
  chai.use(require('sinon-chai'))

  beforeEach(function() {
    deferred = Q.defer()
    observable = ko.observable(deferred.promise).extend({ promise: true })
  })

  it('should notify subscribers when the promise resolves', function() {
    observable.subscribe(function(val) {
      val.isFulfilled().should.be.true
    })
    deferred.resolve('hi')
    return deferred.promise
  })

  it('should notify subscribers when the promise fails', function() {
    observable.subscribe(function(val) {
      val.isRejected().should.be.true
    })
    deferred.reject(new Error('oops'))
    return deferred.promise.then(undefined, function() { return true })
  })

  it('should not notify subscribers if the promise is no longer the value of the observable', function() {
    observable(Q.defer().promise)
    observable.subscribe(function() {
      done(new Error('The first observable was called'))
    })

    deferred.resolve()
    return deferred.promise
  })

  it('should allow assignment of a non-promise', function(done) {
    observable.subscribe(function(val) {
      val.should.equal('hi')
      done()
    })
    observable('hi')
  })

  it('should subscribe to new promises', function() {
    var sub = sinon.spy()
    observable.subscribe(sub)

    var newDeferred = Q.defer()
    observable(newDeferred.promise)
    sub.should.have.been.calledOnce

    newDeferred.resolve('bye!')

    return newDeferred.promise.then(function() {
      sub.should.have.been.calledTwice
      sub.firstCall.should.have.been.calledWith(newDeferred.promise)
      sub.secondCall.should.have.been.calledWith(newDeferred.promise)
    })
  })
})