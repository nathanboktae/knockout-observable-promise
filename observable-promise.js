(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['knockout'], factory)
  } else if (typeof exports === 'object' && typeof module === 'object') {
    /*global module*/
    module.exports = factory
  } else {
    /*global ko*/
    factory(ko)
  }
})(function(ko) {

  ko.extenders.promise = function(target, mode) {
    var wrapper = ko['pureComputed' in ko ? 'pureComputed' : 'computed']({
      read: mode !== 'status' ? target : function() {
        var val = target()
        return (val && val.__status) || val
      },
      write: function(newValue) {
        if (newValue && typeof newValue.then === 'function') {
          if (mode === 'status') {
            Object.defineProperty(newValue, '__status', {
              value: 'pending',
              writable: true
            })
          }
          var notify = function(success, asyncResult) {
            var currTarget = target.peek()
            if (currTarget === newValue) {
              if (mode === 'convert') {
                target(asyncResult)
              } else {
                if (mode === 'status') {
                  currTarget.__status = success ? 'resolved' : 'rejected'
                }
                target.notifySubscribers()
              }
            }
          }
          newValue.then(notify.bind(null, true), notify.bind(null, false))
        }
        target(newValue)
      }
    })

    wrapper(target())
    return wrapper
  }

  ko.observablePromise = function() {
    return ko.observable.apply(ko, arguments).extend({ promise: 'convert' })
  }

  return ko
})