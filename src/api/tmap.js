/* eslint-disable */
export default {
  loadMap(k) {
    return new Promise(function(resolve, reject) {
      window.mapCallback = function () {
        resolve(window.qq.maps)
      }
      var script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = 'http://map.qq.com/api/js?v=2.exp&callback=mapCallback&libraries=place,drawing,geometry,autocomplete,convertor&key=' + k
      script.onerror = reject
      document.body.appendChild(script)
    })
  }
}
