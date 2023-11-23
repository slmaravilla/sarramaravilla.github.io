window.onload = init;

function init(){
  const map = new ol.Map ({
    view: new ol.View ({
      center: [0,0],
      zoom: 2
    }),
    layers: [
      new ol.layer.Tile ({
        source: new ol.source.OSM()
      })
    ],
    target: 'js-map'
  })
}

const testLaris = new ol.layer.VectorImage({
  source: new ol.source.Vector({
    url: './vector data/testLaRIS.geojson',
    format: new ol.format.GeoJSON()
  }),
  visible: true,
  title: 'Sample LaRIS'
})

map.addLayer(testLaris);