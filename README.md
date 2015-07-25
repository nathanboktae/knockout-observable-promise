## knockout-observable-promise
### Easily wire up promises to knockout

[![Build Status](https://secure.travis-ci.org/nathanboktae/mocha-phantomjs.png)](http://travis-ci.org/nathanboktae/mocha-phantomjs)

Working with data from our server, we often want to show loading status or want to chain other work dependent on an asyncrounous task. `knockout-observable-promise` is observable [extender](http://knockoutjs.com/documentation/extenders.html) that will wire up to a promise automatically if it is assigned one.

Example:

View model:

```javascript
var name = ko.observable(),
    age = ko.observable(),
    user = ko.observable()

ko.applyBindings(document.body, {
  name: name,
  age: age,
  user: user,

  findUser: ko.computed(function() {
    if (name() && age()) {
      return $.get({
        url: '/users/search', 
        data: {
          name: name(),
          age: age()
        }
      }).then(function(resp) {
        user(resp.data)
      })
    } else {
      return $.Deferred().promise()
    }
  }).extend({ throttle: 100, promise: { convert: true } })
})
```

Markup:

```
<style>.loading { background-image: url(loading.gif); }</style>
<form>
  <h1>Search for a person</h1>
  <label for="name">Name</label>
  <input name="name" data-bind="value: name"></input>
  <label for="age">Age</label>
  <input name="age" data-bind="value: age"></input>

  <div data-bind="css: { loading: findUser().state() === 'pending' }">
    <!-- ko if: $root.user() -->
      <p data-bind="text: 'found user ' + $root.user().username">
    <!-- /ko -->
  </div>
  <p class="error" data-bind="visible: findUser().state() === 'rejected'">An error occoured looking for that user!</p>
</form>
```

You can optionally have the observable convert to the resolve or rejected value if that is convient to you


```javascript
var name = ko.observable(),
    age = ko.observable

ko.applyBindings(document.body, {
  name: name,
  age: age,

  user: ko.computed(function() {
    return lookupUser(name(), age())
  }).extend({ throttle: 100, promise: { convert: true } })
})
```

Markup:

```
<style>.loading { background-image: url(loading.gif); }</style>
<form>
  <h1>Search for a person</h1>
  <label for="name">Name</label>
  <input name="name" data-bind="value: name"></input>
  <label for="age">Age</label>
  <input name="age" data-bind="value: age"></input>

  <div data-bind="css: { loading: user() && user().state && user().state() === 'pending' }">
    <!-- ko if: $root.user().username -->
      <p data-bind="text: 'found user ' + $root.user().username">
    <!-- /ko -->
  </div>
  <p class="error" data-bind="visible: user() && user().state && user().state() === 'rejected'">
    An error occoured looking for that user!
  </p>
</form>
```