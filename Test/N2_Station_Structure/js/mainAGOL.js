require([
  "esri/Basemap",
  "esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/views/layers/support/FeatureFilter",
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
  "esri/layers/GroupLayer"
], function(Basemap, Map, MapView, SceneView, 
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
            SimpleRenderer, MeshSymbol3D, SolidEdges3D, GroupLayer) {


////////////////////////////////////////////////////
var basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: "8a9ef2a144e8423786f6139408ac3424" 
      }
    })
  ]
});

var map = new Map({
        basemap: basemap, // "streets-night-vector", 
        ground: "world-elevation"
  }); 
   
  var view = new SceneView({
      map: map,
      container: "viewDiv",
      viewingMode: "local",
      camera: {
          position: {
              x: 120.57930,
              y: 15.18,
              z: 500
              },
              tilt: 65
              },
      environment: {
          background: {
              type: "color", // autocasts as new ColorBackground()
              color: [0, 0, 0, 1]
              },
              // disable stars
              starsEnabled: false,
              //disable atmosphere
              atmosphereEnabled: false
              }
  });

// OpenStreetMap 3D Buildings
let osmSymbol = {
type: "mesh-3d",
symbolLayers: [
{
type: "fill",
material: {
  color: [74, 80, 87, 0.5],
  colorMixMode: "replace"
},
edges: {
  type: "solid", // autocasts as new SolidEdges3D()
  color: [225, 225, 225, 0.3]
}
}
]
};


var osm3D = new SceneLayer({
portalItem: {
id: "ca0470dbbddb4db28bad74ed39949e25"
},
title: "OpenStreetMap 3D Buildings"
});
map.add(osm3D);
osm3D.renderer = {
type: "simple",
symbol: osmSymbol
}



// Label Class
  // Station labels
  var labelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: [255, 170, 0]
          },
          size: 20,
          color: "black",
          haloColor: "black",
          haloSize: 1,
          font: {
            family: "Ubuntu Mono",
            //weight: "bold"
          },
        }
      ],
      verticalOffset: {
        screenLength: 40,
        maxWorldLength: 100,
        minWorldLength: 20
      },


    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: "$feature.Station"
      //value: "{TEXTSTRING}"
  }
  });

  // Station Symbol
  function stationsSymbol(name) {
    return {
      type: "web-style", // autocasts as new WebStyleSymbol()
      name: name,
      styleName: "EsriIconsStyle"//EsriRealisticTransportationStyle, EsriIconsStyle
    };
  }

  // Station Renderer
  var stationsRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    field: "Station",
    defaultSymbol: stationsSymbol("Train"),//Backhoe, Train
  };
  
// Station Layer
var stationLayer = new SceneLayer({
      portalItem: {
          id: "212904618a1f44c1a78e2446d905e679"
      },
       labelingInfo: [labelClass],
       renderer: stationsRenderer,
       elevationInfo: {
           // this elevation mode will place points on top of
           // buildings or other SceneLayer 3D objects
           mode: "relative-to-ground"
           },
       definitionExpression: "Extension = 'N2'"
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  stationLayer.listMode = "hide";
  map.add(stationLayer, 0);

// Station structures
const buildingLayer = new BuildingSceneLayer({
portalItem: {
id: "d377e8049a0f4f56ab0f3fe61978682c"
},
outFields: ["*"],
title: "N2 Station Structures"

});
map.add(buildingLayer);


view.ui.empty("top-left");

const buildingExplorer = new BuildingExplorer({
view: view,
layers: [buildingLayer]
});
view.ui.add(buildingExplorer, "bottom-right");

// only display the building levels filter
buildingExplorer.visibleElements = {
phases: false,
disciplines: false
};
//////////////////////////////////////////////////////////////////////////////////

/// chart
const headerTitleDiv = document.getElementById("headerTitleDiv");


/*
    const excludedLayers = [];
  const sliceButton = document.getElementById("slice");
  const resetPlaneBtn = document.getElementById("resetPlaneBtn");
  const clearPlaneBtn = document.getElementById("clearPlaneBtn");
  const sliceOptions = document.getElementById("sliceOptions");
  const plane = new SlicePlane({
    position: {
      latitude: 34.0600460070941,
      longitude: -117.18669237418565,
      z: 417.75
    },
    tilt: 32.62,
    width: 29,
    height: 29,
    heading: 0.46
  });
  var sliceWidget = null;
          var sliceTiltEnabled = true;
*/
// Discipline: Architectural
var columnsLayer = null;
var floorsLayer = null;
var wallsLayer = null;

// Discipline: Structural
var stFramingLayer = null;
var stColumnLayer = null;
var stFoundationLayer = null;

buildingLayer.when(() => {
// Iterate through the flat array of sublayers and extract the ones
// that should be excluded from the slice widget
buildingLayer.allSublayers.forEach((layer) => {
// modelName is standard accross all BuildingSceneLayer,
// use it to identify a certain layer
switch (layer.modelName) {
// Because of performance reasons, the Full Model view is
// by default set to false. In this scene the Full Model should be visible.
case "FullModel":
  layer.visible = true;
  break;
 
  case "Columns":
    columnsLayer = layer;
    //excludedLayers.push(layer);
    break;

  case "Floors":
    floorsLayer = layer;
    //excludedLayers
    break;

  case "Walls":
    wallsLayer = layer;
    break;
        
  case "StructuralFraming":
    stFramingLayer = layer;
    break;
  
  case "StructuralColumns":
    stColumnLayer = layer;
    break;
  
  case "StructuralFoundation":
    stFoundationLayer = layer;
    break;
    
  default:
    layer.visible = true;
  }
});
// setSliceWidget();
});



/* Function for zooming to selected layers */
function zoomToLayer(layer) {
return layer.queryExtent().then(function(response) {
view.goTo(response.extent, { //response.extent
speedFactor: 2
}).catch(function(error) {
if (error.name != "AbortError") {
  console.error(error);
}
});
});
}


//////////////
let abort = false;
let center = null;
function rotate() {
  if (!view.interacting && !abort) {
    
    play.style.display = "none";
    pause.style.display = "block";
    
    center = center || view.center;
    
    view.goTo({
      heading: view.camera.heading + 0.2,
      center
    }, {animate: false});
    
    requestAnimationFrame(rotate);
  } else {
    abort = false;
    center = null;
    play.style.display = "block";
    pause.style.display = "none";
  }
} // end

play.onclick = rotate;
pause.onclick = function() {
  abort = true;
};

function totalProgressStFoundation() {
  // structural Foundation
  var total_complete = {
  onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_complete",
  statisticType: "sum"
  };
  
  var total_obs = {
  onStatisticField: "Status",
  outStatisticFieldName: "total_obs",
  statisticType: "count"
  };
  
  var query = stFoundationLayer.createQuery();
  query.outStatistics = [total_complete, total_obs];
  query.returnGeometry = true;
  return stFoundationLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  
  const total_comp = stats.total_complete;
  const total_obs = stats.total_obs;
  const compile_stFoundation = [total_comp, total_obs];
  return compile_stFoundation;
  });
  }
  
  // structural columns
  function totalProgressStColumn(compile_stFoundation) {
  // structural Foundation
  var total_complete = {
  onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_complete",
  statisticType: "sum"
  };
  
  var total_obs = {
  onStatisticField: "Status",
  outStatisticFieldName: "total_obs",
  statisticType: "count"
  };
  
  var query = stColumnLayer.createQuery();
  query.outStatistics = [total_complete, total_obs];
  query.returnGeometry = true;
  return stColumnLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  
  const total_comp = stats.total_complete;
  const total_obs = stats.total_obs;
  const comp_comp = total_comp + compile_stFoundation[0];
  const comp_obs = total_obs + compile_stFoundation[1];
  const compile_stColumn = [comp_comp, comp_obs];
  
  return compile_stColumn;
  });
  }
  
  // structura framing
  function totalProgressStFraming(compile_stColumn) {
  // structural Foundation
  var total_complete = {
  onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_complete",
  statisticType: "sum"
  };
  
  var total_obs = {
  onStatisticField: "Status",
  outStatisticFieldName: "total_obs",
  statisticType: "count"
  };
  
  var query = stFramingLayer.createQuery();
  query.outStatistics = [total_complete, total_obs];
  query.returnGeometry = true;
  return stFramingLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  
  const total_comp = stats.total_complete;
  const total_obs = stats.total_obs;
  const comp_comp = total_comp + compile_stColumn[0];
  const comp_obs = total_obs + compile_stColumn[1];
  const compile_stFraming = [comp_comp, comp_obs];
  
  return compile_stFraming;
  });
  }
  
  // Columns
  function totalProgressColumns(compile_stFraming) {
  // structural Foundation
  var total_complete = {
  onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_complete",
  statisticType: "sum"
  };
  
  var total_obs = {
  onStatisticField: "Status",
  outStatisticFieldName: "total_obs",
  statisticType: "count"
  };
  
  var query = columnsLayer.createQuery();
  query.outStatistics = [total_complete, total_obs];
  query.returnGeometry = true;
  return columnsLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  
  const total_comp = stats.total_complete;
  const total_obs = stats.total_obs;
  const comp_comp = total_comp + compile_stFraming[0];
  const comp_obs = total_obs + compile_stFraming[1];
  const compile_columns = [comp_comp, comp_obs];
  
  return compile_columns;
  });
  }
  
  // Floors
  function totalProgressFloors(compile_columns) {
  // structural Foundation
  var total_complete = {
  onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_complete",
  statisticType: "sum"
  };
  
  var total_obs = {
  onStatisticField: "Status",
  outStatisticFieldName: "total_obs",
  statisticType: "count"
  };
  
  var query = floorsLayer.createQuery();
  query.outStatistics = [total_complete, total_obs];
  query.returnGeometry = true;
  return floorsLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  
  const total_comp = stats.total_complete;
  const total_obs = stats.total_obs;
  const comp_comp = total_comp + compile_columns[0];
  const comp_obs = total_obs + compile_columns[1];
  const compile_floors = [comp_comp, comp_obs];
  
  return compile_floors;
  });
  }
  
  // Walls
  function totalProgressWalls(compile_floors) {
  // structural Foundation
  var total_complete = {
  onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_complete",
  statisticType: "sum"
  };
  
  var total_obs = {
  onStatisticField: "Status",
  outStatisticFieldName: "total_obs",
  statisticType: "count"
  };
  
  var query = wallsLayer.createQuery();
  query.outStatistics = [total_complete, total_obs];
  query.returnGeometry = true;
  return wallsLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;
  
  const total_comp = stats.total_complete;
  const total_obs = stats.total_obs;
  const comp_comp = total_comp + compile_floors[0];
  const comp_obs = total_obs + compile_floors[1];
  const compile_walls = [comp_comp, comp_obs];
  
  return compile_walls;
  });
  }
  

  function progressAll(compile_walls) {
    document.getElementById("totalProgressDiv").innerHTML = ((compile_walls[0]/compile_walls[1])*100).toFixed(1) + " %";
  }
    
  function totalProgressStation() {
    totalProgressStFoundation()
    .then(totalProgressStColumn)
    .then(totalProgressStFraming)
    .then(totalProgressColumns)
    .then(totalProgressFloors)
    .then(totalProgressWalls)
    .then(progressAll)
  }

////////////////////////////////
var stationList = document.getElementById("stationList");
var ttt = stationList.getElementsByClassName("test");

am4core.ready(function() {
am4core.useTheme(am4themes_animated);
// Total progress //

buildingLayer.when(() => {
  const defaultStation = "Station = 8";
  columnsLayer.definitionExpression = defaultStation;
  floorsLayer.definitionExpression = defaultStation;
  wallsLayer.definitionExpression = defaultStation;

  stFramingLayer.definitionExpression = defaultStation;
  stColumnLayer.definitionExpression = defaultStation;
  stFoundationLayer.definitionExpression = defaultStation;

  columnsLayer.visible = true;
  floorsLayer.visible = true;
  wallsLayer.visible = true;
  //windowsLayer.visible = true;

  stFramingLayer.visible = true;
  stColumnLayer.visible = true;
  stFoundationLayer.visible = true;

  totalProgressStation();
  combineCharts();
  zoomToLayer(stFramingLayer);
});
//


// Default selection = 'None'

// Station list
for(var i = 0; i < ttt.length; i ++) {
ttt[i].addEventListener("click", filterByP);
}

function filterByP(event) {
var current = document.getElementsByClassName("active");
current[0].className = current[0].className.replace(" active","");
this.className += " active";

const selectedID = event.target.id;
if(selectedID == "Calumpit") {
  columnsLayer.definitionExpression = "Station  = 8";
  floorsLayer.definitionExpression = "Station  = 8";
  wallsLayer.definitionExpression = "Station  = 8";

  stFramingLayer.definitionExpression = "Station  = 8";
  stColumnLayer.definitionExpression = "Station  = 8";
  stFoundationLayer.definitionExpression = "Station  = 8";

  columnsLayer.visible = true;
  floorsLayer.visible = true;
  wallsLayer.visible = true;
  //windowsLayer.visible = true;

  stFramingLayer.visible = true;
  stColumnLayer.visible = true;
  stFoundationLayer.visible = true;

  combineCharts();
  totalProgressStation();
  zoomToLayer(stFramingLayer);

} else if (selectedID == "Apalit") {
  columnsLayer.definitionExpression = "Station  = 7";
  floorsLayer.definitionExpression = "Station  = 7";
  wallsLayer.definitionExpression = "Station  = 7";

  stFramingLayer.definitionExpression = "Station  = 7";
  stColumnLayer.definitionExpression = "Station  = 7";
  stFoundationLayer.definitionExpression = "Station  = 7";

  columnsLayer.visible = true;
  floorsLayer.visible = true;
  wallsLayer.visible = true;
  //windowsLayer.visible = true;

  stFramingLayer.visible = true;
  stColumnLayer.visible = true;
  stFoundationLayer.visible = true;    

  combineCharts();
  totalProgressStation();
  zoomToLayer(stFramingLayer); 

} else if (selectedID == "San Fernando") {
  columnsLayer.definitionExpression = "Station  = 6";
  floorsLayer.definitionExpression = "Station  = 6";
  wallsLayer.definitionExpression = "Station  = 6";

  stFramingLayer.definitionExpression = "Station  = 6";
  stColumnLayer.definitionExpression = "Station  = 6";
  stFoundationLayer.definitionExpression = "Station  = 6";

  columnsLayer.visible = true;
  floorsLayer.visible = true;
  wallsLayer.visible = true;
  //windowsLayer.visible = true;

  stFramingLayer.visible = true;
  stColumnLayer.visible = true;
  stFoundationLayer.visible = true;      

  combineCharts();
  totalProgressStation();
  zoomToLayer(stFramingLayer); 

} else if (selectedID == "Angeles") {
  columnsLayer.definitionExpression = "Station  = 5";
  floorsLayer.definitionExpression = "Station  = 5";
  wallsLayer.definitionExpression = "Station  = 5";

  stFramingLayer.definitionExpression = "Station  = 5";
  stColumnLayer.definitionExpression = "Station  = 5";
  stFoundationLayer.definitionExpression = "Station  = 5";

  columnsLayer.visible = true;
  floorsLayer.visible = true;
  wallsLayer.visible = true;
  //windowsLayer.visible = true;

  stFramingLayer.visible = true;
  stColumnLayer.visible = true;
  stFoundationLayer.visible = true;      

  combineCharts();
  totalProgressStation();
  zoomToLayer(stFramingLayer); 

} else if (selectedID == "Clark") {
  columnsLayer.definitionExpression = "Station  = 4";
  floorsLayer.definitionExpression = "Station  = 4";
  wallsLayer.definitionExpression = "Station  = 4";

  stFramingLayer.definitionExpression = "Station  = 4";
  stColumnLayer.definitionExpression = "Station  = 4";
  stFoundationLayer.definitionExpression = "Station  = 4";

  columnsLayer.visible = true;
  floorsLayer.visible = true;
  wallsLayer.visible = true;
  //windowsLayer.visible = true;

  stFramingLayer.visible = true;
  stColumnLayer.visible = true;
  stFoundationLayer.visible = true;       

  combineCharts();
  totalProgressStation();
  zoomToLayer(stFramingLayer); 

} else if (selectedID == "CIA") {
  columnsLayer.definitionExpression = "Station  = 3";
  floorsLayer.definitionExpression = "Station  = 3";
  wallsLayer.definitionExpression = "Station  = 3";

  stFramingLayer.definitionExpression = "Station  = 3";
  stColumnLayer.definitionExpression = "Station  = 3";
  stFoundationLayer.definitionExpression = "Station  = 3";

  columnsLayer.visible = true;
  floorsLayer.visible = true;
  wallsLayer.visible = true;
  //windowsLayer.visible = true;

  stFramingLayer.visible = true;
  stColumnLayer.visible = true;
  stFoundationLayer.visible = true;       

  combineCharts();
  totalProgressStation();
  zoomToLayer(stFramingLayer); 

}
}


// Progress Chart
// 1. Structural Foundation
function chartStFoundation() {
  var total_stFoundation_tobec = {
  onStatisticField: "CASE WHEN (Types = 1 and Status = 1) THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_stFoundation_tobec",
  statisticType: "sum"
  };

  var total_stFoundation_underc = {
  onStatisticField: "CASE WHEN (Types = 1 and Status = 2) THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_stFoundation_underc",
  statisticType: "sum"  
  };

  var total_stFoundation_comp = {
  onStatisticField: "CASE WHEN (Types = 1 and Status = 4) THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_stFoundation_comp",
  statisticType: "sum"  
  };

  var query = stFoundationLayer.createQuery();
  query.outStatistics = [total_stFoundation_tobec, total_stFoundation_underc, total_stFoundation_comp];
  query.returnGeometry = true;

  stFoundationLayer.queryFeatures(query).then(function(response) {
  var stats = response.features[0].attributes;

  const foundation_tobec = stats.total_stFoundation_tobec;
  const foundation_underc = stats.total_stFoundation_underc;
  const foundation_comp = stats.total_stFoundation_comp;

  // Chart //
  var chart = am4core.create("chartStFoundationDiv", am4charts.XYChart);
  chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
  // Responsive to screen size
  chart.responsive.enabled = true;
  chart.responsive.useDefault = false
  chart.responsive.rules.push({
    relevant: function(target) {
        if (target.pixelWidth <= 400) {
            return true;
        }
        return false;
    },
    state: function(target, stateId) {
        if (target instanceof am4charts.Chart) {
            var state = target.states.create(stateId);
            state.properties.paddingTop = 0;
            state.properties.paddingRight = 15;
            state.properties.paddingBottom = 5;
            state.properties.paddingLeft = 15;
            return state;
        }
        
        if (target instanceof am4charts.Legend) {
            var state = target.states.create(stateId);
            state.properties.paddingTop = 0;
            state.properties.paddingRight = 0;
            state.properties.paddingBottom = 0;
            state.properties.paddingLeft = 0;
            state.properties.marginLeft = 0;
            return state;
        }
        
        if (target instanceof am4charts.AxisRendererY) {
            var state = target.states.create(stateId);
            state.properties.inside = false;
            state.properties.maxLabelPosition = 0.99;
            return state;
        }
        
        if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
            var state = target.states.create(stateId);
            state.properties.dy = 0;
            state.properties.paddingTop = 3;
            state.properties.paddingRight = 5;
            state.properties.paddingBottom = 3;
            state.properties.paddingLeft = 5;

            // Create a separate state for background
            // target.setStateOnChildren = true;
            // var bgstate = target.background.states.create(stateId);
            // bgstate.properties.fill = am4core.color("#fff");
            // bgstate.properties.fillOpacity = 0;
            return state;
        }
        // if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
        //   var state = target.states.create(stateId);
        //   state.properties.fill = am4core.color("#f00");
        //   state.properties.fillOpacity = 0.5;
        //   return state;
        // }
        return null;
    }
  });

  chart.data = [
    {
        category: "St. Foundation",
        value1: foundation_comp,
        value2: foundation_underc,
        value3: foundation_tobec,
    }
  ];

    // Define chart setting
    chart.colors.step = 2;
    chart.padding(0, 0, 0, 0);
    
    // Axis Setting
    /// Category Axis
    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.labels.template.fontSize = 0;
    categoryAxis.renderer.labels.template.fill = "#ffffff";
    categoryAxis.renderer.minGridDistance = 5; //can change label
    categoryAxis.renderer.grid.template.strokeWidth = 0;
    
    /// Value Axis
    var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.minWidth = 50;
    valueAxis.renderer.labels.template.fontSize = 0;
    valueAxis.renderer.labels.template.fill = "#ffffff";
    valueAxis.renderer.grid.template.strokeWidth = 0;
    
    //valueAxis.disabled = true;
    //categoryAxis.disabled = true;
    let arrLviews = [];
    
    // Layerview and Expand
    function createSeries(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.calculatePercent = true;
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "category";
        series.stacked = true;
        series.dataFields.valueXShow = "totalPercent";
        series.dataItems.template.locations.categoryY = 0.5;
        
        // Bar chart line color and width
        series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
        series.columns.template.strokeWidth = 0.5;
        series.name = name;
        
        var labelBullet = series.bullets.push(new am4charts.LabelBullet());
        
        if (name == "Incomplete"){
            series.fill = am4core.color("#FF000000");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
        
        } else if (name === "Under Construction") {
            series.fill = am4core.color("#FFCCCCCC");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
        
        } else {
          // When completed value is zero, show no labels.
          if (foundation_comp === 0) {
            labelBullet.label.text = "";
          } else {
            labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          };
            series.fill = am4core.color("#00B0F0"); // Completed
            //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
            labelBullet.label.fill = am4core.color("#ffffff");
            labelBullet.label.fontSize = 20;
        }
        labelBullet.locationX = 0.5;
        labelBullet.interactionsEnabled = false;
        
        series.columns.template.width = am4core.percent(60);
        series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
        
        // Click chart and filter, update maps
        const chartElement = document.getElementById("chartPanel");
        series.columns.template.events.on("hit", filterByChart, this);

        function filterByChart(ev) {
            stFoundationLayer.visible = true;
            stColumnLayer.visible = false;
            stFramingLayer.visible = false;
            wallsLayer.visible = false;
            floorsLayer.visible = false;
            columnsLayer.visible = false;


            // Listen to the click event on the map view and resets to default 
            view.on("click", function() {
              stFoundationLayer.visible = true;
              stColumnLayer.visible = true;
              stFramingLayer.visible = true;
              wallsLayer.visible = true;
              floorsLayer.visible = true;
              columnsLayer.visible = true;
            });


    } // End of filterByChart
  } // end of createSeries function

  createSeries("value1", "Complete");
  createSeries("value2", "Under Construction");
  createSeries("value3", "Incomplete");

  }); // end of queryFeatures
} // End of Chart

// 2. Structural Column
function chartStColumn() {
var total_stColumn_tobec = {
onStatisticField: "CASE WHEN (Types = 2 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stColumn_tobec",
statisticType: "sum"
};

var total_stColumn_underc = {
onStatisticField: "CASE WHEN (Types = 2 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stColumn_underc",
statisticType: "sum"  
};

var total_stColumn_comp = {
onStatisticField: "CASE WHEN (Types = 2 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stColumn_comp",
statisticType: "sum"  
};

var query = stColumnLayer.createQuery();
query.outStatistics = [total_stColumn_tobec, total_stColumn_underc, total_stColumn_comp];
query.returnGeometry = true;

stColumnLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const column_tobec = stats.total_stColumn_tobec;
const column_underc = stats.total_stColumn_underc;
const column_comp = stats.total_stColumn_comp;

// Chart //
var chart = am4core.create("chartStColumnDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
// Responsive to screen size
chart.responsive.enabled = true;
chart.responsive.useDefault = false
chart.responsive.rules.push({
  relevant: function(target) {
      if (target.pixelWidth <= 400) {
          return true;
      }
      return false;
  },
  state: function(target, stateId) {
      if (target instanceof am4charts.Chart) {
          var state = target.states.create(stateId);
          state.properties.paddingTop = 0;
          state.properties.paddingRight = 15;
          state.properties.paddingBottom = 5;
          state.properties.paddingLeft = 15;
          return state;
      }
      
      if (target instanceof am4charts.Legend) {
          var state = target.states.create(stateId);
          state.properties.paddingTop = 0;
          state.properties.paddingRight = 0;
          state.properties.paddingBottom = 0;
          state.properties.paddingLeft = 0;
          state.properties.marginLeft = 0;
          return state;
      }
      
      if (target instanceof am4charts.AxisRendererY) {
          var state = target.states.create(stateId);
          state.properties.inside = false;
          state.properties.maxLabelPosition = 0.99;
          return state;
      }
      
      if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
          var state = target.states.create(stateId);
          state.properties.dy = 0;
          state.properties.paddingTop = 3;
          state.properties.paddingRight = 5;
          state.properties.paddingBottom = 3;
          state.properties.paddingLeft = 5;

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
          return state;
      }
      // if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
      //   var state = target.states.create(stateId);
      //   state.properties.fill = am4core.color("#f00");
      //   state.properties.fillOpacity = 0.5;
      //   return state;
      // }
      return null;
  }
});

chart.data = [
  {
      category: "St. Column",
      value1: column_comp,
      value2: column_underc,
      value3: column_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (column_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
        stFoundationLayer.visible = false;
        stColumnLayer.visible = true;
        stFramingLayer.visible = false;
        wallsLayer.visible = false;
        floorsLayer.visible = false;
        columnsLayer.visible = false;


        // Listen to the click event on the map view and resets to default 
        view.on("click", function() {
          stFoundationLayer.visible = true;
          stColumnLayer.visible = true;
          stFramingLayer.visible = true;
          wallsLayer.visible = true;
          floorsLayer.visible = true;
          columnsLayer.visible = true;
        });
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart


// 3. Structural Framing
function chartStFraming() {
var total_stFraming_tobec = {
onStatisticField: "CASE WHEN (Types = 3 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stFraming_tobec",
statisticType: "sum"
};

var total_stFraming_underc = {
onStatisticField: "CASE WHEN (Types = 3 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stFraming_underc",
statisticType: "sum"  
};

var total_stFraming_comp = {
onStatisticField: "CASE WHEN (Types = 3 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_stFraming_comp",
statisticType: "sum"  
};

var query = stFramingLayer.createQuery();
query.outStatistics = [total_stFraming_tobec, total_stFraming_underc, total_stFraming_comp];
query.returnGeometry = true;

stFramingLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const framing_tobec = stats.total_stFraming_tobec;
const framing_underc = stats.total_stFraming_underc;
const framing_comp = stats.total_stFraming_comp;

// Chart //
var chart = am4core.create("chartStFramingDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
// Responsive to screen size
chart.responsive.enabled = true;
chart.responsive.useDefault = false
chart.responsive.rules.push({
  relevant: function(target) {
      if (target.pixelWidth <= 400) {
          return true;
      }
      return false;
  },
  state: function(target, stateId) {
      if (target instanceof am4charts.Chart) {
          var state = target.states.create(stateId);
          state.properties.paddingTop = 0;
          state.properties.paddingRight = 15;
          state.properties.paddingBottom = 5;
          state.properties.paddingLeft = 15;
          return state;
      }
      
      if (target instanceof am4charts.Legend) {
          var state = target.states.create(stateId);
          state.properties.paddingTop = 0;
          state.properties.paddingRight = 0;
          state.properties.paddingBottom = 0;
          state.properties.paddingLeft = 0;
          state.properties.marginLeft = 0;
          return state;
      }
      
      if (target instanceof am4charts.AxisRendererY) {
          var state = target.states.create(stateId);
          state.properties.inside = false;
          state.properties.maxLabelPosition = 0.99;
          return state;
      }
      
      if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
          var state = target.states.create(stateId);
          state.properties.dy = 0;
          state.properties.paddingTop = 3;
          state.properties.paddingRight = 5;
          state.properties.paddingBottom = 3;
          state.properties.paddingLeft = 5;

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
          return state;
      }
      // if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
      //   var state = target.states.create(stateId);
      //   state.properties.fill = am4core.color("#f00");
      //   state.properties.fillOpacity = 0.5;
      //   return state;
      // }
      return null;
  }
});

chart.data = [
  {
      category: "St. Framing",
      value1: framing_comp,
      value2: framing_underc,
      value3: framing_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (framing_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
        stFoundationLayer.visible = false;
        stColumnLayer.visible = false;
        stFramingLayer.visible = true;
        wallsLayer.visible = false;
        floorsLayer.visible = false;
        columnsLayer.visible = false;


        // Listen to the click event on the map view and resets to default 
        view.on("click", function() {
          stFoundationLayer.visible = true;
          stColumnLayer.visible = true;
          stFramingLayer.visible = true;
          wallsLayer.visible = true;
          floorsLayer.visible = true;
          columnsLayer.visible = true;
        });
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart


// 4. Floors
function chartFloors() {
var total_floors_tobec = {
onStatisticField: "CASE WHEN (Types = 5 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_floors_tobec",
statisticType: "sum"
};

var total_floors_underc = {
onStatisticField: "CASE WHEN (Types = 5 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_floors_underc",
statisticType: "sum"  
};

var total_floors_comp = {
onStatisticField: "CASE WHEN (Types = 5 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_floors_comp",
statisticType: "sum"  
};

var query = floorsLayer.createQuery();
query.outStatistics = [total_floors_tobec, total_floors_underc, total_floors_comp];
query.returnGeometry = true;

floorsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const floors_tobec = stats.total_floors_tobec;
const floors_underc = stats.total_floors_underc;
const floors_comp = stats.total_floors_comp;

// Chart //
var chart = am4core.create("chartFloorsDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
// Responsive to screen size
chart.responsive.enabled = true;
chart.responsive.useDefault = false
chart.responsive.rules.push({
  relevant: function(target) {
      if (target.pixelWidth <= 400) {
          return true;
      }
      return false;
  },
  state: function(target, stateId) {
      if (target instanceof am4charts.Chart) {
          var state = target.states.create(stateId);
          state.properties.paddingTop = 0;
          state.properties.paddingRight = 15;
          state.properties.paddingBottom = 5;
          state.properties.paddingLeft = 15;
          return state;
      }
      
      if (target instanceof am4charts.Legend) {
          var state = target.states.create(stateId);
          state.properties.paddingTop = 0;
          state.properties.paddingRight = 0;
          state.properties.paddingBottom = 0;
          state.properties.paddingLeft = 0;
          state.properties.marginLeft = 0;
          return state;
      }
      
      if (target instanceof am4charts.AxisRendererY) {
          var state = target.states.create(stateId);
          state.properties.inside = false;
          state.properties.maxLabelPosition = 0.99;
          return state;
      }
      
      if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
          var state = target.states.create(stateId);
          state.properties.dy = 0;
          state.properties.paddingTop = 3;
          state.properties.paddingRight = 5;
          state.properties.paddingBottom = 3;
          state.properties.paddingLeft = 5;

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
          return state;
      }
      // if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
      //   var state = target.states.create(stateId);
      //   state.properties.fill = am4core.color("#f00");
      //   state.properties.fillOpacity = 0.5;
      //   return state;
      // }
      return null;
  }
});

chart.data = [
  {
      category: "Floors",
      value1: floors_comp,
      value2: floors_underc,
      value3: floors_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (floors_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
        stFoundationLayer.visible = false;
        stColumnLayer.visible = false;
        stFramingLayer.visible = false;
        wallsLayer.visible = false;
        floorsLayer.visible = true;
        columnsLayer.visible = false;


        // Listen to the click event on the map view and resets to default 
        view.on("click", function() {
          stFoundationLayer.visible = true;
          stColumnLayer.visible = true;
          stFramingLayer.visible = true;
          wallsLayer.visible = true;
          floorsLayer.visible = true;
          columnsLayer.visible = true;
        });
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart


// 5. Walls
function chartWalls() {
var total_walls_tobec = {
onStatisticField: "CASE WHEN (Types = 6 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_walls_tobec",
statisticType: "sum"
};

var total_walls_underc = {
onStatisticField: "CASE WHEN (Types = 6 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_walls_underc",
statisticType: "sum"  
};

var total_walls_comp = {
onStatisticField: "CASE WHEN (Types = 6 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_walls_comp",
statisticType: "sum"  
};

var query = wallsLayer.createQuery();
query.outStatistics = [total_walls_tobec, total_walls_underc, total_walls_comp];
query.returnGeometry = true;

wallsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const walls_tobec = stats.total_walls_tobec;
const walls_underc = stats.total_walls_underc;
const walls_comp = stats.total_walls_comp;

// Chart //
var chart = am4core.create("chartWallsDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
// Responsive to screen size
chart.responsive.enabled = true;
chart.responsive.useDefault = false
chart.responsive.rules.push({
  relevant: function(target) {
      if (target.pixelWidth <= 400) {
          return true;
      }
      return false;
  },
  state: function(target, stateId) {
      if (target instanceof am4charts.Chart) {
          var state = target.states.create(stateId);
          state.properties.paddingTop = 0;
          state.properties.paddingRight = 15;
          state.properties.paddingBottom = 5;
          state.properties.paddingLeft = 15;
          return state;
      }
      
      if (target instanceof am4charts.Legend) {
          var state = target.states.create(stateId);
          state.properties.paddingTop = 0;
          state.properties.paddingRight = 0;
          state.properties.paddingBottom = 0;
          state.properties.paddingLeft = 0;
          state.properties.marginLeft = 0;
          return state;
      }
      
      if (target instanceof am4charts.AxisRendererY) {
          var state = target.states.create(stateId);
          state.properties.inside = false;
          state.properties.maxLabelPosition = 0.99;
          return state;
      }
      
      if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
          var state = target.states.create(stateId);
          state.properties.dy = 0;
          state.properties.paddingTop = 3;
          state.properties.paddingRight = 5;
          state.properties.paddingBottom = 3;
          state.properties.paddingLeft = 5;

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
          return state;
      }
      // if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
      //   var state = target.states.create(stateId);
      //   state.properties.fill = am4core.color("#f00");
      //   state.properties.fillOpacity = 0.5;
      //   return state;
      // }
      return null;
  }
});

chart.data = [
  {
      category: "Walls",
      value1: walls_comp,
      value2: walls_underc,
      value3: walls_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (walls_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
        stFoundationLayer.visible = false;
        stColumnLayer.visible = false;
        stFramingLayer.visible = false;
        wallsLayer.visible = true;
        floorsLayer.visible = false;
        columnsLayer.visible = false;


        // Listen to the click event on the map view and resets to default 
        view.on("click", function() {
          stFoundationLayer.visible = true;
          stColumnLayer.visible = true;
          stFramingLayer.visible = true;
          wallsLayer.visible = true;
          floorsLayer.visible = true;
          columnsLayer.visible = true;
        });
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart


// 6. Columns
function chartColumns() {
var total_columns_tobec = {
onStatisticField: "CASE WHEN (Types = 7 and Status = 1) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_columns_tobec",
statisticType: "sum"
};

var total_columns_underc = {
onStatisticField: "CASE WHEN (Types = 7 and Status = 2) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_columns_underc",
statisticType: "sum"  
};

var total_columns_comp = {
onStatisticField: "CASE WHEN (Types = 7 and Status = 4) THEN 1 ELSE 0 END",
outStatisticFieldName: "total_columns_comp",
statisticType: "sum"  
};

var query = columnsLayer.createQuery();
query.outStatistics = [total_columns_tobec, total_columns_underc, total_columns_comp];
query.returnGeometry = true;

columnsLayer.queryFeatures(query).then(function(response) {
var stats = response.features[0].attributes;

const columns_tobec = stats.total_columns_tobec;
const columns_underc = stats.total_columns_underc;
const columns_comp = stats.total_columns_comp;

// Chart //
var chart = am4core.create("chartColumnsDiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
// Responsive to screen size
chart.responsive.enabled = true;
chart.responsive.useDefault = false
chart.responsive.rules.push({
  relevant: function(target) {
      if (target.pixelWidth <= 400) {
          return true;
      }
      return false;
  },
  state: function(target, stateId) {
      if (target instanceof am4charts.Chart) {
          var state = target.states.create(stateId);
          state.properties.paddingTop = 0;
          state.properties.paddingRight = 15;
          state.properties.paddingBottom = 5;
          state.properties.paddingLeft = 15;
          return state;
      }
      
      if (target instanceof am4charts.Legend) {
          var state = target.states.create(stateId);
          state.properties.paddingTop = 0;
          state.properties.paddingRight = 0;
          state.properties.paddingBottom = 0;
          state.properties.paddingLeft = 0;
          state.properties.marginLeft = 0;
          return state;
      }
      
      if (target instanceof am4charts.AxisRendererY) {
          var state = target.states.create(stateId);
          state.properties.inside = false;
          state.properties.maxLabelPosition = 0.99;
          return state;
      }
      
      if ((target instanceof am4charts.AxisLabel) && (target.parent instanceof am4charts.AxisRendererY)) { 
          var state = target.states.create(stateId);
          state.properties.dy = 0;
          state.properties.paddingTop = 3;
          state.properties.paddingRight = 5;
          state.properties.paddingBottom = 3;
          state.properties.paddingLeft = 5;

          // Create a separate state for background
          // target.setStateOnChildren = true;
          // var bgstate = target.background.states.create(stateId);
          // bgstate.properties.fill = am4core.color("#fff");
          // bgstate.properties.fillOpacity = 0;
          return state;
      }
      // if ((target instanceof am4core.Rectangle) && (target.parent instanceof am4charts.AxisLabel) && (target.parent.parent instanceof am4charts.AxisRendererY)) { 
      //   var state = target.states.create(stateId);
      //   state.properties.fill = am4core.color("#f00");
      //   state.properties.fillOpacity = 0.5;
      //   return state;
      // }
      return null;
  }
});

chart.data = [
  {
      category: "Columns",
      value1: columns_comp,
      value2: columns_underc,
      value3: columns_tobec,
  }
];

  // Define chart setting
  chart.colors.step = 2;
  chart.padding(0, 0, 0, 0);
  
  // Axis Setting
  /// Category Axis
  var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.labels.template.fontSize = 0;
  categoryAxis.renderer.labels.template.fill = "#ffffff";
  categoryAxis.renderer.minGridDistance = 5; //can change label
  categoryAxis.renderer.grid.template.strokeWidth = 0;
  
  /// Value Axis
  var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.max = 100;
  valueAxis.strictMinMax = true;
  valueAxis.calculateTotals = true;
  valueAxis.renderer.minWidth = 50;
  valueAxis.renderer.labels.template.fontSize = 0;
  valueAxis.renderer.labels.template.fill = "#ffffff";
  valueAxis.renderer.grid.template.strokeWidth = 0;
  
  //valueAxis.disabled = true;
  //categoryAxis.disabled = true;
  let arrLviews = [];
  
  // Layerview and Expand
  function createSeries(field, name) {
      var series = chart.series.push(new am4charts.ColumnSeries());
      series.calculatePercent = true;
      series.dataFields.valueX = field;
      series.dataFields.categoryY = "category";
      series.stacked = true;
      series.dataFields.valueXShow = "totalPercent";
      series.dataItems.template.locations.categoryY = 0.5;
      
      // Bar chart line color and width
      series.columns.template.stroke = am4core.color("#FFFFFF"); //#00B0F0
      series.columns.template.strokeWidth = 0.5;
      series.name = name;
      
      var labelBullet = series.bullets.push(new am4charts.LabelBullet());
      
      if (name == "Incomplete"){
          series.fill = am4core.color("#FF000000");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else if (name === "Under Construction") {
          series.fill = am4core.color("#FFCCCCCC");
          labelBullet.label.text = "";
          labelBullet.label.fill = am4core.color("#FFFFFFFF");
          labelBullet.label.fontSize = 0;
      
      } else {
        // When completed value is zero, show no labels.
        if (columns_comp === 0) {
          labelBullet.label.text = "";
        } else {
          labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
        };
          series.fill = am4core.color("#00B0F0"); // Completed
          //labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
          labelBullet.label.fill = am4core.color("#ffffff");
          labelBullet.label.fontSize = 20;
      }
      labelBullet.locationX = 0.5;
      labelBullet.interactionsEnabled = false;
      
      series.columns.template.width = am4core.percent(60);
      series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
      
      // Click chart and filter, update maps
      const chartElement = document.getElementById("chartPanel");
      series.columns.template.events.on("hit", filterByChart, this);

      function filterByChart(ev) {
        stFoundationLayer.visible = false;
        stColumnLayer.visible = false;
        stFramingLayer.visible = false;
        wallsLayer.visible = false;
        floorsLayer.visible = false;
        columnsLayer.visible = true;


        // Listen to the click event on the map view and resets to default 
        view.on("click", function() {
          stFoundationLayer.visible = true;
          stColumnLayer.visible = true;
          stFramingLayer.visible = true;
          wallsLayer.visible = true;
          floorsLayer.visible = true;
          columnsLayer.visible = true;
        });
  } // End of filterByChart
} // end of createSeries function

createSeries("value1", "Complete");
createSeries("value2", "Under Construction");
createSeries("value3", "Incomplete");

}); // end of queryFeatures
} // End of Chart

function combineCharts() {
  chartStFoundation();
  chartStColumn();
  chartStFraming();
  chartFloors()
  chartWalls();
  chartColumns();
}
}); // End of am4core.ready




//////////////////////////////////////////////////////////////////////////////////////
  // See-through-Ground        
  view.when(function() {
    // allow navigation above and below the ground
    map.ground.navigationConstraint = {
      type: "none"
    };
    // the webscene has no basemap, so set a surfaceColor on the ground
    map.ground.surfaceColor = "#fff";
    // to see through the ground, set the ground opacity to 0.4
    map.ground.opacity = 0.9; //
  });

// See through Gound
document
.getElementById("opacityInput")
.addEventListener("change", function(event) {
  //map.ground.opacity = event.target.checked ? 0.1 : 0.9;
  map.ground.opacity = event.target.checked ? 0.1 : 0.6;
});

view.ui.add("menu", "bottom-right");


///////////////////////////////////////////////////////
var layerList = new LayerList({
      view: view,
      listItemCreatedFunction: function(event) {
        const item = event.item;
        if (item.title === "Architectural" ||
            item.title === "OpenStreetMap 3D Buildings"){
          item.visible = false
        }
      }
    });

var layerListExpand = new Expand ({
  view: view,
  content: layerList,
  expandIconClass: "esri-icon-visible",
  group: "top-right"
});

view.ui.add(layerListExpand, {
  position: "top-right"
});

// Full screen logo
view.ui.add(
  new Fullscreen({
  view: view,
  element: viewDiv
}),
"top-right"
);
});