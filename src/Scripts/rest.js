define(['require', 'xhr'], function (require, xhr) {
    /**
     *
     * API helper methods.
     *
     */

  var buildUrl = function (baseAddress, expansion, expansionData, queryData) {
    if (baseAddress.endsWith('/')) {
      baseAddress = baseAddress.slice(0, -1)
    };

    if (expansion && !expansion.startsWith('/')) {
      expansion = '/' + expansion
    };

    var url = baseAddress + expansion

    if (expansionData) {
      for (var property in expansionData) {
        var regEx = new RegExp('\\{' + property + '\\}', 'gm')
        url = url.replace(regEx, expansionData[property])
      }
    }

    if (queryData) {
      url += '?'
      var queries = []
      for (var property in queryData) {
        var query = [property, queryData[property]].join('=')
        queries.push(query)
      };
      url += queries.join('&')
    };

    return url
  }

  var buildRequest = function (payload) {
    return JSON.stringify(payload)
  }

    /**
     *
     * API proxy methods.
     *
     */

  var apiGet = function (url, callback, async, onError) {
    try {
      var timestamp = new Date().getTime()
      if (url.indexOf('?') == -1) {
        url += '?timestamp=' + timestamp
      } else {
        url += '&timestamp=' + timestamp
      }

      var xGet = new XMLHttpRequest()
      xGet.open('GET', url, async)
      xGet.setRequestHeader('Content-Type', 'application/json')
      xGet.setRequestHeader('Accept', 'application/json')
      xGet.onreadystatechange = function () {
        try {
          if (this.readyState == XMLHttpRequest.DONE) {
            if (this.status === 0) {
              throw new Error('Unable to communicate with resource at ' + url)
            } else if (this.status === 404) {
              throw new Error('Item not found at ' + url)
            } else if (this.status !== 200) {
              throw new Error(this.responseText)
            } else {
              if (callback) {
                callback(this.responseText, async)
              };
            };
          };
        } catch (err) {
          if (onError) {
            onError(err)
          };
        }
      }

      xGet.send()
    } catch (err) {
      if (onError) {
        onError(err)
      };
    }
  }

  var apiPost = function (url, request, callback, async, onError) {
    try {
      var xPost = new XMLHttpRequest()
      xPost.open('POST', url, async)
      xPost.setRequestHeader('Content-Type', 'application/json')
      xPost.setRequestHeader('Accept', 'application/json')
      xPost.onreadystatechange = function () {
        try {
          if (this.readyState == XMLHttpRequest.DONE) {
            if (this.status === 0) {
              throw new Error('Unable to communicate with resource at ' + url)
            } else if (this.status !== 201 && this.status !== 200) {
              throw new Error(this.responseText)
            } else {
              if (callback) {
                callback(this.responseText, async)
              };
            }
          }
        } catch (err) {
          if (onError) {
            onError(err)
          };
        }
      }

      if (request) {
        xPost.send(buildRequest(request))
      } else {
        xPost.send()
      }
    } catch (err) {
      if (onError) {
        onError(err)
      }
    }
  }

  var apiDelete = function (url, request, callback, async, onError) {
    try {
      var xDel = new XMLHttpRequest()
      xDel.open('DELETE', url, async)
      xDel.setRequestHeader('Content-Type', 'application/json')
      xDel.setRequestHeader('Accept', 'application/json')
      xDel.onreadystatechange = function () {
        try {
          if (this.readyState == XMLHttpRequest.DONE) {
            if (this.status === 0) {
              throw new Error('Unable to communicate with resource at ' + url)
            } else if (this.status !== 201 && this.status !== 200) {
              throw new Error(this.responseText)
            } else {
              if (callback) {
                callback(this.responseText, async)
              };
            }
          }
        } catch (err) {
          if (onError) {
            onError(err)
          };
        }
      }

      if (request) {
        xDel.send(buildRequest(request))
      } else {
        xDel.send()
      }
    } catch (err) {
      if (onError) {
        onError(err)
      };
    }
  }

  return {
    Get: apiGet,
    Post: apiPost,
    Delete: apiDelete,
    BuildUrl: buildUrl
  }
})
