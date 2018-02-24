define(['require', 'flux-capacitor', 'app/constants'], function (require) {
  var _actions = require('app/constants').ActionConstants
  var _dispatcher = require('flux-capacitor').Dispatcher

  var Actions = {
    click: function (value) {
      _dispatcher.handleViewAction({
        type: _actions.CLICK,
        value: value
      })
    }
  }

  return {
    Actions: Actions
  }
})
