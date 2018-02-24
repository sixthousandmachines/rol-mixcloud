define(['require', 'react-with-addons', 'flux-capacitor', 'app/constants', 'app/page'], function (require, react, flux, constants, components) {
    // register top level events
  flux.Reactor.registerEvent(constants.EventConstants.VIEW_PORT_CHANGED)
  flux.Reactor.registerEvent(constants.EventConstants.ERROR)

  if (!window.console) {
    window.console = { log: function () {}, error: function () {}, warn: function () {} }
  };

  function isEmpty (obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) { return false }
    }

    return true
  }

    // create top level page
  var page = react.createFactory(components.PageComponent)

    // ready....GO!
  react.render(page(), document.getElementById('ContentWrapper'))
})
