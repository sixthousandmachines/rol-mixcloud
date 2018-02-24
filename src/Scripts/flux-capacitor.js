define(function (require) {
  var Instance = null

  var GetInstance = function () {
    if (Instance === null) {
      Instance = {
        Dispatcher: Dispatcher.getInstance(),
        Reactor: Reactor
      }
    };

    return Instance
  }

  var Dispatcher = (function () {
    var _callbacks = {}
    var _isPending = {}
    var _isHandled = {}
    var _isDispatching = {}
    var _pendingPayload = {}
    var _dispatcherInstance

    var _lastID = 1
    var _prefix = 'ID_'

    function register (callback) {
      var id = _prefix + _lastID++
      _callbacks[id] = callback
      return id
    }

    function unregister (id) {
      delete _callbacks[id]
    }

        /** *** NOTE:
            The way that the waitFor(ids) function works is relatively simple, but worth
            noting, so that circular dependencies don't occur.

            Say that for one reason or another, some dependencies exist between stores,
            and Store A must be updated before Store B. waitFor(ids) is the only way to
            ensure that Store A has been updated before Store B.

            Simply put, in Store B, you call Dispatcher.waitFor([StoreA.dispatcherToken]),
            and the Dispatcher will run Store A's callback, sending the payload data
            to it first, allowing it to fully process before execution returns to Store B.

            It is important to note that the developer can create circular dependencies
            if you tell a function in Store A to waitFor Store B, and then that corresponding
            function in Store B calls waitFor on Store A.

            Further reading and a an example can be found here:
            http://facebook.github.io/flux/docs/dispatcher.html#example
        ******/
    function waitFor (ids) {
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i]

        if (_isPending[id]) {
          continue
        }

        _invokeCallback(id)
      }
    }

    function dispatch (payload) {
      _startDispatching(payload)

      try {
        for (var id in _callbacks) {
          if (_isPending[id]) {
            continue
          }

          _invokeCallback(id)
        }
      } catch (e) {
//                console.error(e.stack);
      } finally {
        _stopDispatching()
      }
    }

    function _invokeCallback (id) {
      _isPending[id] = true
      _callbacks[id](_pendingPayload)
      _isHandled[id] = true
    }

    function _startDispatching (payload) {
      for (var id in _callbacks) {
        _isPending[id] = false
        _isHandled[id] = false
      }

      _pendingPayload = payload
      _isDispatching = true
    }

    function _stopDispatching () {
      _pendingPayload = null
      _isDispatching = false
    }

    function init () {
      return {
        register: register,
        unregister: unregister,
        waitFor: waitFor,
        handleServerAction: function (action) {
          var payload = {
            source: 'SERVER_ACTION',
            action: action
          }

          dispatch(payload)
        },

        handleViewAction: function (action) {
          var payload = {
            source: 'VIEW_ACTION',
            action: action
          }

          dispatch(payload)
        }
      }
    }

    return {
      getInstance: function () {
        if (!_dispatcherInstance) {
          _dispatcherInstance = init()
        }

        return _dispatcherInstance
      }
    }
  })()

  var Event = function () {
    var _callbacks = []

    return {
      registerCallback: function (callback) {
        _callbacks.push(callback)
      },
      unregisterCallback: function (callback) {
        var index = _callbacks.indexOf(callback)
        _callbacks.splice(index, 1)
      },
      getCallbacks: function () {
        return _callbacks
      }
    }
  }

  var Reactor = (function () {
    var _events = {}

    return {
      registerEvent: function (eventName) {
        var event = Event()
        _events[eventName] = event
      },
      dispatchEvent: function (eventName, eventArgs) {
        _events[eventName].getCallbacks().forEach(function (callback) {
          callback(eventArgs)
        })
      },
      addEventListener: function (eventName, callback) {
        _events[eventName].registerCallback(callback)
      },
      removeEventListener: function (eventName, callback) {
        _events[eventName].unregisterCallback(callback)
      }
    }
  })()

  return GetInstance()
})
