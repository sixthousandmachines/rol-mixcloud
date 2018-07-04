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
        var _menu = []
        var _list = []

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
                list: _list
            }
        }

        var getMenu = function () {
            for (var i = 0; i < _config.djs.length; i++) {
                var expansion = {
                    dj: _config.djs[i]
                }

                var url = rest.BuildUrl(_config.cloud.baseUrl, _config.cloud.profileUrl, expansion)

                var callback = function (results, async) {
                    var data = JSON.parse(results)
                    if (data) {
                        _menu.push({
                            name: data.name,
                            image: data.pictures.medium
                        })
                    };

                    emitChange()
                }

                rest.Get(url, callback, true, false)
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

            var callback = function (results, async) {
                var data = JSON.parse(results)
                if (data && data.data && data.data.length > 0) {
                    _list = []
                    for (var i in data.data) {
                        var widgetExpansion = {
                            dj: _dj,
                            slug: data.data[i].slug
                        }

                        var widgetUrl = rest.BuildUrl(_config.cloud.widget, null, widgetExpansion)

                        _list.push({
                            width: '100%',
                            height: '60',
                            src: widgetUrl,
                            frameBorder: '1'
                        })
                    }

                    emitChange()
                }
            }

            rest.Get(url, callback, true, false)
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
