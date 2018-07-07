define(['require', 'app/constants', 'app/config', 'flux-capacitor', 'linq', 'rest', 'moment'], function (require, constants, config, flux) {
  var reactor = flux.Reactor
  var dispatcher = flux.Dispatcher
  var linq = require('linq').Enumerable
  var rest = require('rest')

  var store = (function () {
    var _instance
    var _actions = constants.ActionConstants
    var _events = constants.EventConstants
    var _config

    var _dj = ''
    var _djs = []
    var _menu = []
    var _list = []
    var _track = {}

    var emitChange = function () {
      reactor.dispatchEvent(_events.VIEW_PORT_CHANGED)
    }

    var addChangeListener = function (callback) {
      reactor.addEventListener(_events.VIEW_PORT_CHANGED, callback)
    }

    var addErrorListener = function (callback) {
      reactor.addEventListener(_events.ERROR, callback)
    }

    var removeChangeListener = function (callback) {
      reactor.removeEventListener(_events.VIEW_PORT_CHANGED, callback)
    }

    var removeErrorListener = function (callback) {
      reactor.removeEventListener(_events.ERROR, callback)
    }

    var handleDispatcherEvent = function (payload) {
      var action = payload.action
      var actionType = action.type

      switch (actionType) {
        case _actions.CLICK:
          _dj = action.value
          getList()
          break

        case _actions.LOAD:
          _track = getTrack(action.value)
          emitChange()
          break
      };

      return true
    }

    var getData = function () {
      if (_menu.length <= 0) {
        getMenu()
      };

      if (_list.length <= 0) {
        getList()
      };

      return {
        dj: _dj,
        menu: _menu,
        list: _list,
        track: _track
      }
    }

    var getMenu = function () {
      if (_menu.length > 0) {
        emitChange()
      } else {
        var djs = getDJList()
        getDJInfo(djs)
        emitChange()
      }
    }

    var getDJList = function () {
      var djs = []
      var url = rest.BuildUrl(_config.cloud.baseUrl, _config.cloud.djsUrl)
      var callback = function (results, async) {
        var data = JSON.parse(results)
        if (data) {
          for (var i in data) {
            djs.push(data[i])
          }
        }
      }
      rest.Get(url, callback, false, false)
      return djs
    }

    var getDJInfo = function (djs) {
      for (var i in djs) {
        var expansion = {
          dj: djs[i]
        }

        var url = rest.BuildUrl(_config.cloud.baseUrl, _config.cloud.profileUrl, expansion)

        var callback = function (results, async) {
          var data = JSON.parse(results)
          if (data) {
            _menu.push({
              name: data.username,
              image: data.pictures.medium
            })
          };
        }

        rest.Get(url, callback, false, false)
      }
    }

    var getList = function () {
      if (!_dj) {
        return
      };

      var expansion = {
        dj: _dj
      }

      var url = rest.BuildUrl(_config.cloud.baseUrl, _config.cloud.mixUrl, expansion)

      var getTagNames = function (tags) {
          var tagNames = []
          for (var i in tags) {
            tagNames.push(tags[i].name)
          }
          return tagNames
      }

      var callback = function (results, async) {
        var data = JSON.parse(results)
        if (data && data.data && data.data.length > 0) {
          _list = []
          for (var i in data.data) {
            var mix = data.data[i]
            _list.push({
                image: mix.pictures.medium,
                dj: mix.user.name,
                track: mix.name,
                slug: mix.slug,
                rank: mix.play_count + mix.favorite_count + mix.listener_count,
                tags: getTagNames(mix.tags)
            })
          }

          emitChange()
        }
      }

      rest.Get(url, callback, true, false)
    }

    var getTrack = function (value) {
      var widgetExpansion = {
        dj: _dj,
        slug: value
      }

      var widget = 'https://www.mixcloud.com/widget/iframe/?embed_type=widget_standard&amp;embed_uuid=32d91671-719d-455a-b03b-7d9edf82bfc4&amp;feed=https%3A%2F%2Fwww.mixcloud.com%2F{dj}%2F{slug}%2F&amp;hide_cover=1&amp;hide_tracklist=1&amp;mini=1&amp;replace=0'

      return {
        width: '100%',
        height: '60',
        src: rest.BuildUrl(widget, null, widgetExpansion),
        frameBorder: '1'
      }
    }

        /**
         *
         * Initialization.
         *
         */

    var init = function (config) {
            // set config values
      _config = config

            // register dispatcher token handlers
      var dispatcherToken = dispatcher.register(handleDispatcherEvent)

      return {
        dispatcherToken: dispatcherToken,

        getData: getData,

        addPageChangeListener: addChangeListener,

        addErrorListener: addErrorListener,

        removePageChangeListener: removeChangeListener,

        removeErrorListener: removeErrorListener
      }
    }

    return {
      getInstance: function () {
        if (!config) {
          throw new Error('Missing api configuration.')
        }

        if (!_instance) {
          _instance = init(config)
        }

        return _instance
      }
    }
  })()

  return {
    Store: store.getInstance()
  }
})
