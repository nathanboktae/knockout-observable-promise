(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['knockout'], factory)
  } else if (typeof exports === 'object' && typeof module === 'object') {
    /*global module*/
    module.exports = factory(require('knockout'))
  } else {
    /*global ko*/
    factory(ko)
  }
})(function(ko) {

  ko.extenders.promise = function(target) {
    var wrapper = ko['pureComputed' in ko ? 'pureComputed' : 'computed']({
      read: target,
      write: function(newValue) {
        target(newValue)
        if (newValue && typeof newValue.then === 'function') {
          var notify = function() {
            if (target.peek() === newValue) {
              target.notifySubscribers()
            }
          }
          newValue.then(notify, notify)
        }
      }
    })

    wrapper(target())
    return wrapper
  }

  return ko
})