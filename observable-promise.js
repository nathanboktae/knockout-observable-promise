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

  ko.extenders.promise = function(target, option) {
    var wrapper = ko['pureComputed' in ko ? 'pureComputed' : 'computed']({
      read: target,
      write: function(newObservable) {
        target(newObservable)
        if (newObservable && typeof newObservable.then === 'function') {
          var notify = function(newVal) {
            if (target.peek() === newObservable) {
              if (option && option.convert) {
                target(newVal)
              } else {
                target.notifySubscribers()
              }
            }
          }
          newObservable.then(notify, notify)
        }
      }
    })

    wrapper(target())
    return wrapper
  }

  return ko
})