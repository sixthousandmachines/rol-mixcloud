define(['require', 'react-with-addons', 'app/store', 'app/view-actions'], function (require, react) {
  var _store = require('app/store').Store
  var _actions = require('app/view-actions').Actions

  var PageComponent = react.createClass({
    displayName: 'PageComponent',

    componentDidMount: function () {
      _store.addPageChangeListener(this._onChange)
      _store.addErrorListener(this._onError)
    },

    componentWillUnmount: function () {
      _store.removePageChangeListener(this._onChange)
      _store.removeErrorListener(this._onError)
    },

    getInitialState: function () {
      return this._getStateFromStore()
    },

    render: function () {
      return react.createElement('div', { id: 'ContentView' }, null,
        react.createElement(Header, null, this.state),
        react.createElement('div', { id: 'wrapper' },
          react.createElement(Content, null, this.state),
          react.createElement(Footer, null, this.state)))
    },

    _getStateFromStore: function () {
      return _store.getData()
    },

    _onChange: function () {
      this.setState(this._getStateFromStore())
    },

    _onError: function () {
      this.setState({
        error: _store.getErrorState()
      })
    }
  })

  var Header = react.createClass({
    displayName: 'Header',

    render: function render () {
      var self = this

      return react.createElement('div', null,
        react.createElement('div', { id: 'logo' },
          react.createElement('h1', null,
            react.createElement('a', { href: '#' }, 'rideoutlane')),
          react.createElement('p', null, '.com')),
        react.createElement('div', { id: 'menu' },
          react.createElement('ul', { id: 'main' },
            (this.props.children.menu || []).map(function (item, index) {
              return react.createElement(MenuItem, { onMenuClick: self._onMenuClick, selected: item.name === self.props.dj }, item)
            }))))
    },

    _onMenuClick: function (value) {
      _actions.click(value)
    }
  })

  var MenuItem = react.createClass({
    displayName: 'MenuItem',

    render: function render () {
      return react.createElement('li', { className: this.props.selected ? 'current_page_item' : '' },
        react.createElement('div', {
          onClick: this._onClick,
          style: { backgroundImage: "url('" + this.props.children.image + "')" }
        }))
    },

    _onClick: function () {
      this.props.onMenuClick(this.props.children.name)
    }
  })

  var Content = react.createClass({
    displayName: 'Content',

    render: function render () {
      return react.createElement('div', { id: 'page' },
        react.createElement('div', { id: 'content' },
          (this.props.children.list || []).map(function (item, index) {
            return react.createElement('div', { className: 'post' },
              react.createElement('iframe', item))
          })))
    }
  })

  var Footer = react.createClass({
    displayName: 'Footer',

    render: function render () {
      return react.createElement('div', { id: 'footer' },
        react.createElement('p', null, '©2018 All Rights Reserved.'))
    }
  })

  return {
    PageComponent: PageComponent
  }
})
