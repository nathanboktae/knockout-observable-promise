## knockout-observable-promise
### Easily wire up promises to knockout

[![Build Status](https://secure.travis-ci.org/nathanboktae/mocha-phantomjs.png)](http://travis-ci.org/nathanboktae/mocha-phantomjs)

Working with data from our server, we often want to show loading status or want to chain other work dependent on an asyncrounous task. `knockout-observable-promise` is observable [extender](http://knockoutjs.com/documentation/extenders.html) that will wire up to a promise automatically if it is assigned one.

#### Examples

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
    }
  }).extend({ throttle: 100, promise: 'status' })
})
```

View:

```html
<style>.loading { background-image: url(loading.gif); }</style>
<form>
  <h1>Search for a person</h1>
  <label for="name">Name</label>
  <input name="name" data-bind="value: name"></input>
  <label for="age">Age</label>
  <input name="age" data-bind="value: age"></input>

  <div data-bind="css: { loading: findUser() === 'pending' }">
    <!-- ko if: $root.user() -->
      <p data-bind="text: 'found user ' + $root.user().username">
    <!-- /ko -->
  </div>
  <p class="error" data-bind="visible: findUser() === 'rejected'">An error occoured looking for that user!</p>
</form>
```

By default, the original promise is returned as the value so others may chain onto it if they wish. (Note: `isPending`, `isResolved`, and `isRejected` are not standard Promise functions but available on some promise libraries like [bluebird](https://github.com/petkaantonov/bluebird) and [q](https://github.com/kriskowal/q))

```javascript
var name = ko.observable(),
    age = ko.observable(),
    user = ko.observable(),

findUser = ko.computed(function() {
  if (name() && age()) {
    return axios.get('/users/search', {
      params: {
        name: name(),
        age: age()
      }
    }).then(function(resp) {
      user(resp.data)
    })
  }
}).extend({ throttle: 100, promise: true })

ko.applyBindings(document.body, {
  name, age, user, findUser,

  message: function() {
    var finding = findUser()
    if (!finding) return 'Enter a name and age'
    if (finding.isPending()) return `Searching for ${name()}...`
    if (finding.isRejected()) return `Could not find ${name()} at age ${age()}`
    return `Found ${name()}!`
  }
})
```

You can optionally have the observable convert to the resolve or rejected value if that is convient to you by using the `convert` mode:


```javascript
var name = ko.observable(),
    age = ko.observable

ko.applyBindings(document.body, {
  name: name,
  age: age,

  user: ko.computed(function() {
    return lookupUser(name(), age())
  }).extend({ throttle: 100, promise: 'convert' })
})
```

View:

```html
<style>.loading { background-image: url(loading.gif); }</style>
<form>
  <h1>Search for a person</h1>
  <label for="name">Name</label>
  <input name="name" data-bind="value: name"></input>
  <label for="age">Age</label>
  <input name="age" data-bind="value: age"></input>

  <div data-bind="css: { loading: user().isPending && user().isPending() }">
    <!-- ko if: $root.user().username -->
      <p data-bind="text: 'found user ' + $root.user().username">
    <!-- /ko -->
  </div>
  <p class="error" data-bind="visible: user().isRejected && user().isRejected()">
    An error occoured looking for that user!
  </p>
</form>
```

Since the `convert` mode is very common, `ko.observablePromise` is an alias for creating an observable with the `promise: "convert"` extender.

### Differences from [ko.promise](https://github.com/jrsearles/ko-promise)

`ko.promise` intends to make observables and promises the same object, letting you use them interchangably for cases when you do have one asyncrounous operation to model. That's not the goal of `knockout-observable-promise` - the observable is not a promise, nor does it have to be, and it can assigned new promises that are wired up again in the future, whereas `ko.promise` cannot since once a promise is resolved or rejected, it cannot change - a promise is an async operation, not a pub-sub mechanism. They are different problems, so choose the library that you need.