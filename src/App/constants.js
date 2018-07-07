define(['require'], function (require) {
  var ActionConstants =
    {
      CLICK: 'CLICK',
      LOAD: 'LOAD'
    }

  var EventConstants =
    {
      VIEW_PORT_CHANGED: 'VIEW_PORT_CHANGED',
      ERROR: 'ERROR'
    }

  return {
    ActionConstants: ActionConstants,
    EventConstants: EventConstants
  }
})
