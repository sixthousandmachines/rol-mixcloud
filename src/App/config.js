/* global settings */
define(['require'], function (require) {
  var djs = [
    'thpranksta',
    'decksimus',
    'cubanb'
  ]

  var cloud = {
    baseUrl: 'http://api.mixcloud.com/',
    profileUrl: '{dj}?metadata=1',
    mixUrl: '{dj}/cloudcasts',
    widget: 'https://www.mixcloud.com/widget/iframe/?embed_type=widget_standard&amp;embed_uuid=32d91671-719d-455a-b03b-7d9edf82bfc4&amp;feed=https%3A%2F%2Fwww.mixcloud.com%2F{dj}%2F{slug}%2F&amp;hide_cover=1&amp;hide_tracklist=1&amp;mini=1&amp;replace=0'
  }

  var appSettings = {
    defaultIcon: '',
    baseUrl: 'http://'
  }

  return {
    djs: djs,
    cloud: cloud,
    appSettings: appSettings
  }
})
