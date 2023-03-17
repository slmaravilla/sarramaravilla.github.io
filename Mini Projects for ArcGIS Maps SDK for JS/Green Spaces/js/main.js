require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Home",
    "esri/widgets/Fullscreen",
    "esri/layers/TileLayer",
    "esri/layers/WebTileLayer",
    "esri/layers/VectorTileLayer",
    "esri/layers/GeoJSONLayer"
], function (
    Map,
    MapView,
    Home,
    Fullscreen,
    TileLayer,
    WebTileLayer,
    VectorTileLayer,
    GeoJSONLayer) {

    const layer = new GeoJSONLayer ({
        url: "https://sarramaravilla.github.io/Mini Projects for ArcGIS Maps SDK for JS/Green Spaces/GreenSpaces.geojson"
    });

    const map = new Map ({
        basemap: "gray-vector",
        layers: [GeoJSONLayer]

    });

    const view = new MapView ({
        container: "viewDiv",
        center: [120.57930, 15.100],
        zoom: 10,
        map: map
    });





});