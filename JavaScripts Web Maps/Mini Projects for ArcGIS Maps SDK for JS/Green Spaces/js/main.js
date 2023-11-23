require([
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/widgets/Home",
    "esri/widgets/Fullscreen",
    "esri/layers/TileLayer",
    "esri/layers/WebTileLayer",
    "esri/layers/VectorTileLayer",
    "esri/layers/GeoJSONLayer"
], function (
    Map,
    MapView,
    SceneView,
    Home,
    Fullscreen,
    TileLayer,
    WebTileLayer,
    VectorTileLayer,
    GeoJSONLayer) {

    const map = new Map({
        basemap: "dark-gray-vector",
    });

    const view = new SceneView({
        map: map,
        container: "viewDiv",
        camera: {
            position: {
                x: 121.026551,
                y: 14.356406,
                z: 30000
            },
            tilt: 40
        },
        environment: {
            background: {
                type: "color",
                color: [0, 0, 0, 1]
            },
            // disable stars
            starsEnabled: false,
            //disable atmosphere
            atmosphereEnabled: false
        }
    });

    const layer = new GeoJSONLayer({
        url: "https://sarramaravilla.github.io/Mini Projects for ArcGIS Maps SDK for JS/Green Spaces/GreenSpaces.geojson",
        renderer :{
            type: "simple",
            symbol: {
                type: "simple-marker",
                color: "green"
            }
        }
    }); map.add(layer);





});