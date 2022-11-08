require([
    "esri/Basemap",
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/layers/FeatureLayer",
    "esri/layers/support/FeatureFilter",
    "esri/layers/SceneLayer",
    "esri/layers/Layer",
    "esri/layers/TileLayer",
    "esri/layers/VectorTileLayer",
    "esri/layers/support/LabelClass",
    "esri/symbols/LabelSymbol3D",
    "esri/WebMap",
    "esri/WebScene",
    "esri/portal/PortalItem",
    "esri/portal/Portal",
    "esri/widgets/TimeSlider",
    "esri/widgets/Legend",
    "esri/widgets/LayerList",
    "esri/widgets/Fullscreen",
    "esri/rest/geometryService",
    "esri/rest/support/Query",
    "esri/rest/support/StatisticDefinition",
    "esri/symbols/WebStyleSymbol",
    "esri/TimeExtent",
    "esri/widgets/Expand",
    "esri/widgets/Editor",
    "esri/renderers/UniqueValueRenderer",
    "esri/widgets/support/DatePicker",
    "esri/widgets/FeatureTable",
    "esri/widgets/Compass",
    "esri/layers/ElevationLayer",
    "esri/Ground",
    "esri/layers/BuildingSceneLayer",
    "esri/widgets/BuildingExplorer",
    "esri/widgets/Slice",
    "esri/analysis/SlicePlane",
    "esri/renderers/SimpleRenderer",
    "esri/symbols/MeshSymbol3D",
    "esri/symbols/edges/SolidEdges3D",
    "esri/layers/GroupLayer",
    "esri/geometry/Point",
    "esri/Camera"
], function (Basemap, Map, MapView, SceneView,
    FeatureLayer, FeatureFilter,
    SceneLayer, Layer, TileLayer, VectorTileLayer,
    LabelClass, LabelSymbol3D, WebMap,
    WebScene, PortalItem, Portal,
    TimeSlider, Legend, LayerList, Fullscreen,
    geometryService, Query,
    StatisticDefinition, WebStyleSymbol,
    TimeExtent, Expand, Editor, UniqueValueRenderer, DatePicker,
    FeatureTable, Compass, ElevationLayer, Ground,
    BuildingSceneLayer, BuildingExplorer, Slice, SlicePlane,
    SimpleRenderer, MeshSymbol3D, SolidEdges3D, GroupLayer, Point, Camera) {

    const map = new Map({
        basemap: "topo-vector" // Basemap layer service
    });

    const view = new MapView({
        map: map,
        center: [51.910098362437594, 4.480173949224271], // Longitude, latitude
        zoom: 13, // Zoom level
        container: "viewDiv" // Div element
    });

    const building = new FeatureLayer({
        url: "https://services8.arcgis.com/h9TUF6x5VzqLQaYx/arcgis/rest/services/DeZalmhaven_Midrise/FeatureServer"
      });
      map.add(building);


});              