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
    "esri/widgets/Legend",
    "esri/widgets/LayerList",
    "esri/widgets/Fullscreen",
    "esri/rest/geometryService",
    "esri/rest/support/Query",
    "esri/rest/support/StatisticDefinition",
    "esri/symbols/WebStyleSymbol",
    "esri/widgets/Expand",
    "esri/widgets/Editor",
    "esri/renderers/UniqueValueRenderer",
    "esri/layers/support/Sublayer",
    "esri/widgets/Search",
    "esri/widgets/Compass"
  ], function(Basemap, Map, MapView, SceneView, 
              FeatureLayer, FeatureFilter,
              SceneLayer, Layer, TileLayer, VectorTileLayer,
              LabelClass, LabelSymbol3D, WebMap,
              WebScene, PortalItem, Portal, Legend, LayerList, Fullscreen,
              geometryService, Query,
              StatisticDefinition, WebStyleSymbol, Expand, Editor,
              UniqueValueRenderer, Sublayer, Search, Compass) {
  
  let chartLayerView;
  const features = [];
  
  //******************************//
  // Basemap and Scenview Setting //
  //******************************//
    var basemap = new Basemap({
    baseLayers: [
      new VectorTileLayer({
        portalItem: {
          id: "8a9ef2a144e8423786f6139408ac3424" // 3a62040541b84f528da3ac7b80cf4a63
        }
      })
    ]
  });
  
     var map = new Map({
          basemap: basemap, // "streets-night-vector", 
          ground: "world-elevation"
    }); 
    //map.ground.surfaceColor = "#FFFF";
    //map.ground.opacity = 0.5;
     
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
  
  
    function shiftCamera(deg) {
      var camera = view.camera.clone();
      camera.position.longitude += deg;
      return camera;
    }
  
    function catchAbortError(error) {
      if (error.name != "AbortError") {
        console.error(error);
      }
    }
       // Setup UI
    var headerTitleDiv = document.getElementById("headerTitleDiv");
  
  
  //*******************************//
  // Label Class Property Settings //
  //*******************************//
  // Chainage Label
  var labelChainage = new LabelClass({
  labelExpressionInfo: {expression: "$feature.KmSpot"},
  symbol: {
  type: "text",
  color: [85, 255, 0],
  size: 25
  }
  });
  
  
  // Station Label
  var labelClass = new LabelClass({
      symbol: {
        type: "label-3d",// autocasts as new LabelSymbol3D()
        symbolLayers: [
          {
            type: "text", // autocasts as new TextSymbol3DLayer()
            material: {
              color: [0, 197, 255]
            },
            size: 10,
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
        expression: 'DefaultValue($feature.Station, "no data")'
        //value: "{TEXTSTRING}"
    }
    });
  
  // Utility Point Label
  var labelMonitor = {
  type: "label-3d", // autocasts as new LabelSymbol3D()
  labelPlacement: "above-center",
  labelExpressionInfo: {
  value: "{Type}",
  },
  symbolLayers: [
  {
  type: "text", // autocasts as new TextSymbol3DLayer()
  material: {
    color: "black"
  },
  halo: {
    color: [255, 255, 255, 0.7],
    size: 2
  },
  size: 10
  }
  ],
  
  };
  
  //*****************************//
  // 3D Web Symbo Style Settings //
  //*****************************//
  /* Company and Utilty Relocation Status Symbols with Callout */
  var verticalOffsetExisting = {
  screenLength: 10,
  maxWorldLength: 10,
  minWorldLength: 15
  };
  
  var verticalOffsetRelocation = {
  screenLength: 100,
  maxWorldLength: 500,
  minWorldLength: 10
  };
  
  
      // Function that automatically creates the symbol for the points of interest
      function getUniqueValueSymbol(name, color, sizeS, util) {
      // The point symbol is visualized with an icon symbol. To clearly see the location of the point
      // we displace the icon vertically and add a callout line. The line connects the offseted symbol with the location
      // of the point feature.
      if (util == "Existing") {
        return {
        type: "point-3d", // autocasts as new PointSymbol3D()
        symbolLayers: [
          {
            type: "icon", // autocasts as new IconSymbol3DLayer()
            resource: {
              href: name
            },
            size: sizeS,
            outline: {
              color: "white",
              size: 2
            }
          }
        ],
  
        verticalOffset: verticalOffsetExisting,
  
        callout: {
          type: "line", // autocasts as new LineCallout3D()
          color: "grey",
          size: 0.4,
          border: {
            color: "grey"
          }
        }
      };
      } else {
        return {
        type: "point-3d", // autocasts as new PointSymbol3D()
        symbolLayers: [
          {
            type: "icon", // autocasts as new IconSymbol3DLayer()
            resource: {
              href: name
            },
            size: sizeS,
            outline: {
              color: "white",
              size: 2
            }
          }
        ],
  
        verticalOffset: verticalOffsetRelocation,
  
        callout: {
          type: "line", // autocasts as new LineCallout3D()
          color: "white",
          size: 1,
          border: {
            color: "grey"
          }
        }
      };
      }
  
    }
  
  
  //*****************************//
  //      Renderer Settings      //
  //*****************************//
  // Esri Icon Symbol
  function IconSymbol(name) {
      return {
        type: "web-style", // autocasts as new WebStyleSymbol()
        name: name,
        styleName: "EsriIconsStyle"//EsriRealisticTransportationStyle, EsriIconsStyle
      };
    }
    
  // Chainage symbol
  var chainageRenderer = {
  type: "simple",
  symbol: {
  type: "simple-marker",
  size: 5,
  color: [255, 255, 255, 0.9],
  outline: {
    width: 0.2,
    color: "black"
  }
  }
  };
  
  // Station
  var stationsRenderer = {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      field: "Name",
      defaultSymbol: IconSymbol("Train"),//Backhoe, Train
    };
  
  
  /// Symbol for monitoring points color on the ground
  var monitorSymbolRenderer = {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      valueExpression: "When($feature.Type == 1, 'Noise', $feature.Status == 2, 'Vibration', $feature.Status == 3, 'Air Quality', \
                            $feature.Type == 4, 'Soil Water', $feature.Type == 5, 'Groundwater', \
                            $feature.Type==6, 'Surface Water', $feature.Type)",
      //field: "Company",
      uniqueValueInfos: [
        {
          value: "Noise",
          symbol: {
              type: "simple-marker",
              color: "blue",
              size: 4,
              outline: {
                  width: 0.2,
                  color: "black"
              }
          }
        },
        {
          value: "Vibration",
          symbol: {
              type: "simple-marker",
              color: "gray",
              size: 4,
              outline: {
                  width: 0.2,
                  color: "black"
              }
          }
        },
        {
          value: "Air Quality",
          symbol: {
              type: "simple-marker",
              color: "gray",
              size: 4,
              outline: {
                  width: 0.2,
                  color: "black"
              }
          }
        },
        {
          value: "Soil Water",
          symbol: {
              type: "simple-marker",
              color: "brown",
              size: 4,
              outline: {
                  width: 0.2,
                  color: "black"
              }
          }
        },
        {
          value: "Groundwater",
          symbol: {
              type: "simple-marker",
              color: "purple",
              size: 4,
              outline: {
                  width: 0.2,
                  color: "black"
              }
         }
    },
    {
          value: "Surface Water",
          symbol: {
              type: "simple-marker",
              color: "orange",
              size: 4,
              outline: {
                  width: 0.2,
                  color: "black"
              }
         }
    }
      ]
    };
  
  /// Symbol for monitoring point symbols above ground
  var monitorStatusSymbolRenderer = {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      valueExpression: "When($feature.Status == 1, 'No Data', $feature.Status == 2, 'Normal', $feature.Status == 3, 'Exceeds', $feature.Status)",
      //field: "Company",
      uniqueValueInfos: [
        {
          value: "No Data",
          label: "No Data",
          symbol: getUniqueValueSymbol(
            "https://EijiGorilla.github.io/Symbols/No_Data_textLogo.png",
            "#D13470",
            80,
            "Relocation" // this does not matter
          )
        },
        {
          value: "Normal",
          label: "Normal",
          symbol: getUniqueValueSymbol(
            "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png",
            "#D13470",
            20,
            "Relocation" // this does not matter
          )
        },
        {
          value: "Exceeds",
          label: "Exceeded",
          symbol: getUniqueValueSymbol(
            "https://EijiGorilla.github.io/Symbols/3D_Web_Style/Warning_Symbol.svg",
            "#D13470",
            35,
            "Relocation"
            )
        }
      ]
    };
  
  
  
  /////////////////////////////////////////////////////////////////////////////////////////////////
  
  //*****************************//
  //      Layer Import           //
  //*****************************//
  
  // Centerline and chainage
  var chainageLayer = new FeatureLayer ({
  portalItem: {
  id: "590680d19f2e48fdbd8bcddce3aaedb5",
  portal: {
  url: "https://gis.railway-sector.com/portal"
  }
  },
  layerId: 5,
  title: "Chainage",
  elevationInfo: {
  mode: "relative-to-ground"
  },
  labelingInfo: [labelChainage],
  renderer: chainageRenderer,
  outFields: ["*"],
  popupEnabled: false
  
  });
  //chainageLayer.listMode = "hide";
  map.add(chainageLayer, 1);
  
  // ROW //
  var rowLayer = new FeatureLayer ({
  portalItem: {
  id: "590680d19f2e48fdbd8bcddce3aaedb5",
  portal: {
  url: "https://gis.railway-sector.com/portal"
  }
  },
  layerId: 1,
  title: "ROW",
  definitionExpression: "Extension = 'N2'",
  popupEnabled: false
  });
  map.add(rowLayer,2);
  
  // Station
  var stationLayer = new SceneLayer({
  portalItem: {
            id: "207cb34b8a324b40985b5805862c4b29",
            portal: {
              url: "https://gis.railway-sector.com/portal"
            }
        },
         labelingInfo: [labelClass],
         renderer: stationsRenderer,
         elevationInfo: {
             // this elevation mode will place points on top of
             // buildings or other SceneLayer 3D objects
             mode: "relative-to-ground"
             }
        // definitionExpression: "Extension = 'N2'"
          //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
    });
    stationLayer.listMode = "hide";
    map.add(stationLayer, 0);
  
  
  var monitorPt = new FeatureLayer({
  portalItem: {
  id: "3fc4f2f99adb4ef3b7f5c82f422731cd",
  portal: {
  url: "https://gis.railway-sector.com/portal"
  }
  },
  title: "Environment Monitoring Points",
  elevationInfo: {
  mode: "relative-to-scene",
  unit: "meters"
  //offset: 0
  },
  outFields: ["*"],
  renderer: monitorSymbolRenderer,
  popupEnabled: false
  });
  monitorPt.listMode = "hide";
  map.add(monitorPt);
  
  var monitorPt1 = new FeatureLayer({
  portalItem: {
  id: "3fc4f2f99adb4ef3b7f5c82f422731cd",
  portal: {
  url: "https://gis.railway-sector.com/portal"
  }
  },
  title: "Environment Monitoring Points",
  elevationInfo: {
  mode: "relative-to-scene",
  unit: "meters"
  //offset: 0
  },
  outFields: ["*"],
  renderer: monitorStatusSymbolRenderer,
  labelingInfo: [labelMonitor],
  popupTemplate: {
  title: "<h5>{Type}</h5>",
  lastEditInfoEnabled: false,
  returnGeometry: true,
  content: [
   {
     type: "fields",
     fieldInfos: [
       {
         fieldName: "StationNo",
         label: "Station No."
       },
       {
         fieldName: "Location"
       },
       {
         fieldName: "Status",
         label: "<h5>Status</h5>"
       },
       {
         fieldName: "Remarks"
       }
     ]
   }
  ]   }
  });
  monitorPt1.listMode = "hide";
  map.add(monitorPt1);
  
  
  
  /////////////////////////////////////////////////////////////////////////////////////
  //*******************************//
  //      Progress Chart           //
  //*******************************//
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
  
  //
  
  var highlightSelect;
  const totalProgressDiv = document.getElementById("totalProgressDiv");
  // Start of am4core
  am4core.ready(function() {
  am4core.useTheme(am4themes_animated);
  
  // 1. Surface Water
  function chartSurfaceWater() {
  var total_surfacewater_exceed = {
    onStatisticField: "CASE WHEN (Type = 6 and Status = 3) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_surfacewater_exceed",
    statisticType: "sum"
  };
  
  var total_surfacewater_normal = {
    onStatisticField: "CASE WHEN (Type = 6 and Status = 2) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_surfacewater_normal",
    statisticType: "sum"  
  };
  
  var query = monitorPt.createQuery();
  query.outStatistics = [total_surfacewater_exceed, total_surfacewater_normal];
  query.returnGeometry = true;
  
  monitorPt.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    const surfacewater_exceed = stats.total_surfacewater_exceed;
    const surfacewater_normal = stats.total_surfacewater_normal;
  
    if (surfacewater_exceed === 0) {
        let okLogo = document.getElementById("logoFail_surfacewater");
        okLogo.src = "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png";
        okLogo.style.width = 25;
        okLogo.style.height = 25;
    }
    
    var chart = am4core.create("chartSurfaceWaterDiv", am4charts.XYChart);
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
  
  
    chart.hiddenState.properties.opacity = 0;
    
    chart.data = [
        {
            category: "Surface Water",
            value1: surfacewater_exceed,
            value2: 0,
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
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.fontSize = 0;
    valueAxis.renderer.labels.template.fill = "#ffffff";
    valueAxis.renderer.grid.template.strokeWidth = 0;
  
    let arrLviews = [];
  
    // createSeries function for charts
    function createSeries(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        //series.calculatePercent = true;
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "category";
        series.stacked = true;
        //series.dataFields.valueXShow = "totalPercent";
        series.dataItems.template.locations.categoryY = 0.5;
        
        // Bar chart line color and width
        series.columns.template.stroke = am4core.color("#00000000"); //#00B0F0
        series.columns.template.strokeWidth = 0.5;
        series.name = name;
        
        var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  
        if (name == "Normal"){
            series.fill = am4core.color("#32CD32");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
            
        } else {
          // if the number of exceeding measurements = 0, use blue label color.
          if (surfacewater_exceed === 0) {
                labelBullet.label.fill = am4core.color("#32CD32");
              } else {
                labelBullet.label.fill = am4core.color("#ff0000");
            }
            series.fill = am4core.color("#80b20000"); // Exceeds limit}                
            labelBullet.label.text = "{valueX.formatNumber('#.')}";
            labelBullet.label.fontSize = 45;
  
        }
        labelBullet.locationX = 0.5;
        labelBullet.interactionsEnabled = false;
        labelBullet.label.dy = 10;
  
        series.columns.template.width = am4core.percent(100);
        //series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
        
        // Click chart and filter, update maps
        const chartElement = document.getElementById("chartPanel");
        series.columns.template.events.on("hit", filterByChart, this);
  
        function filterByChart(ev) {
            const selectedC = ev.target.dataItem.component.name;
            const selectedP = ev.target.dataItem.categoryY;
            
            if (selectedP == "Surface Water" && selectedC == "Exceeded") {
                selectedLayer = 6;
                selectedStatus = 3;
            
            } else if (selectedP == "Surface Water" && selectedC == "Normal") {
                selectedLayer = 6;
                selectedStatus = 2;
  
            }
  
            
            // Point 1:
  
                view.whenLayerView(monitorPt1).then(function (layerView) {
                    chartLayerView = layerView;
                    arrLviews.push(layerView);
                    chartElement.style.visibility = "visible";
                    
                    //testUtilPt1.definitionExpression = sqlExpression;
                    monitorPt1.queryFeatures().then(function(results) {
                        const ggg = results.features;
                        const rowN = ggg.length;
                        
                        let objID = [];
                        for (var i=0; i < rowN; i++) {
                            var obj = results.features[i].attributes.OBJECTID;
                            objID.push(obj);
                        }
                        
                        var queryExt = new Query({
                            objectIds: objID
                        });
                        
                        monitorPt1.queryExtent(queryExt).then(function(result) {
                            if (result.extent) {
                                view.goTo(result.extent)
                            }
                        });
  
                        if (highlightSelect) {
                            highlightSelect.remove();
                        }
                        highlightSelect = layerView.highlight(objID);
                        
                        view.on("click", function() {
                            highlightSelect.remove();
                        });
                        
                        view.on("click", function() {
                            layerView.filter = null;
                        });
                    }); // end of query features   
                }); // end of when layerview
  
            // Point: 2
            view.whenLayerView(monitorPt).then(function (layerView) {
                chartLayerView = layerView;
                arrLviews.push(layerView);
                chartElement.style.visibility = "visible";
                
                view.on("click", function() {
                    layerView.filter = null;
                });
            }); // end of when layerview
  
  
        // Query view using compiled arrays
        for(var i = 0; i < arrLviews.length; i++) {
            arrLviews[i].filter = {
                where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
            }
        }
    } // End of filterByChart
  } // end of createSeries function
  
  createSeries("value1", "Exceeded");
  createSeries("value2", "Normal");
  }); // end of queryFeatures
  }
  chartSurfaceWater();
  
  // 2. Ground Water
  function chartGroundWater() {
  var total_groundwater_exceed = {
    onStatisticField: "CASE WHEN (Type = 5 and Status = 3) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_groundwater_exceed",
    statisticType: "sum"
  };
  
  var total_groundwater_normal = {
    onStatisticField: "CASE WHEN (Type = 5 and Status = 2) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_groundwater_normal",
    statisticType: "sum"  
  };
  
  var query = monitorPt.createQuery();
  query.outStatistics = [total_groundwater_exceed, total_groundwater_normal];
  query.returnGeometry = true;
  
  monitorPt.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    const groundwater_exceed = stats.total_groundwater_exceed;
    const groundwater_normal = stats.total_groundwater_normal;
  
    if (groundwater_exceed === 0) {
        let okLogo = document.getElementById("logoFail_groundwater");
        okLogo.src = "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png";
        okLogo.style.width = 25;
        okLogo.style.height = 25;
  
  
    }
    
    var chart = am4core.create("chartGroundWaterDiv", am4charts.XYChart);
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
  
  
    chart.hiddenState.properties.opacity = 0;
    
    chart.data = [
        {
            category: "Groundwater",
            value1: groundwater_exceed,
            value2: 0,
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
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.fontSize = 0;
    valueAxis.renderer.labels.template.fill = "#ffffff";
    valueAxis.renderer.grid.template.strokeWidth = 0;
  
    let arrLviews = [];
  
    // createSeries function for charts
    function createSeries(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        //series.calculatePercent = true;
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "category";
        series.stacked = true;
        //series.dataFields.valueXShow = "totalPercent";
        series.dataItems.template.locations.categoryY = 0.5;
        
        // Bar chart line color and width
        series.columns.template.stroke = am4core.color("#00000000"); //#00B0F0
        series.columns.template.strokeWidth = 0.5;
        series.name = name;
        
        var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  
        if (name == "Normal"){
            series.fill = am4core.color("#32CD32");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
            
        } else {
          // if the number of exceeding measurements = 0, use blue label color.
          if (groundwater_exceed === 0) {
                labelBullet.label.fill = am4core.color("#32CD32");
              } else {
                labelBullet.label.fill = am4core.color("#ff0000");
            }
            series.fill = am4core.color("#80b20000"); // Exceeds limit}                
            labelBullet.label.text = "{valueX.formatNumber('#.')}";
            labelBullet.label.fontSize = 45;
  
        }
        labelBullet.locationX = 0.5;
        labelBullet.interactionsEnabled = false;
        labelBullet.label.dy = 10;
  
        series.columns.template.width = am4core.percent(100);
        //series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
        
        // Click chart and filter, update maps
        const chartElement = document.getElementById("chartPanel");
        series.columns.template.events.on("hit", filterByChart, this);
  
        function filterByChart(ev) {
            const selectedC = ev.target.dataItem.component.name;
            const selectedP = ev.target.dataItem.categoryY;
            
            if (selectedP == "Groundwater" && selectedC == "Exceeded") {
                selectedLayer = 5;
                selectedStatus = 3;
            
            } else if (selectedP == "Groundwater" && selectedC == "Normal") {
                selectedLayer = 5;
                selectedStatus = 2;
  
            }
  
            
            // Point 1:
  
                view.whenLayerView(monitorPt1).then(function (layerView) {
                    chartLayerView = layerView;
                    arrLviews.push(layerView);
                    chartElement.style.visibility = "visible";
                    
                    //testUtilPt1.definitionExpression = sqlExpression;
                    monitorPt1.queryFeatures().then(function(results) {
                        const ggg = results.features;
                        const rowN = ggg.length;
                        
                        let objID = [];
                        for (var i=0; i < rowN; i++) {
                            var obj = results.features[i].attributes.OBJECTID;
                            objID.push(obj);
                        }
                        
                        var queryExt = new Query({
                            objectIds: objID
                        });
                        
                        monitorPt1.queryExtent(queryExt).then(function(result) {
                            if (result.extent) {
                                view.goTo(result.extent)
                            }
                        });
  
                        if (highlightSelect) {
                            highlightSelect.remove();
                        }
                        highlightSelect = layerView.highlight(objID);
                        
                        view.on("click", function() {
                            highlightSelect.remove();
                        });
                        
                        view.on("click", function() {
                            layerView.filter = null;
                        });
                    }); // end of query features   
                }); // end of when layerview
  
            // Point: 2
            view.whenLayerView(monitorPt).then(function (layerView) {
                chartLayerView = layerView;
                arrLviews.push(layerView);
                chartElement.style.visibility = "visible";
                
                view.on("click", function() {
                    layerView.filter = null;
                });
            }); // end of when layerview
  
  
        // Query view using compiled arrays
        for(var i = 0; i < arrLviews.length; i++) {
            arrLviews[i].filter = {
                where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
            }
        }
    } // End of filterByChart
  } // end of createSeries function
  
  createSeries("value1", "Exceeded");
  createSeries("value2", "Normal");
  }); // end of queryFeatures
  }
  chartGroundWater();
  
  
  // 3. Soil Water
  function chartSoilWater() {
  var total_soilwater_exceed = {
    onStatisticField: "CASE WHEN (Type = 4 and Status = 3) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_soilwater_exceed",
    statisticType: "sum"
  };
  
  var total_soilwater_normal = {
    onStatisticField: "CASE WHEN (Type = 4 and Status = 2) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_soilwater_normal",
    statisticType: "sum"  
  };
  
  var query = monitorPt.createQuery();
  query.outStatistics = [total_soilwater_exceed, total_soilwater_normal];
  query.returnGeometry = true;
  
  monitorPt.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    const soilwater_exceed = stats.total_soilwater_exceed;
    const soilwater_normal = stats.total_soilwater_normal;
  
    if (soilwater_exceed === 0) {
        let okLogo = document.getElementById("logoFail_soilwater");
        okLogo.src = "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png";
        okLogo.style.width = 25;
        okLogo.style.height = 25;
    }
        
    
    var chart = am4core.create("chartSoilWaterDiv", am4charts.XYChart);
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
  
  
    chart.hiddenState.properties.opacity = 0;
    
    chart.data = [
        {
            category: "Soil Water",
            value1: soilwater_exceed,
            value2: 0,
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
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.fontSize = 0;
    valueAxis.renderer.labels.template.fill = "#ffffff";
    valueAxis.renderer.grid.template.strokeWidth = 0;
  
    let arrLviews = [];
  
    // createSeries function for charts
    function createSeries(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        //series.calculatePercent = true;
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "category";
        series.stacked = true;
        //series.dataFields.valueXShow = "totalPercent";
        series.dataItems.template.locations.categoryY = 0.5;
        
        // Bar chart line color and width
        series.columns.template.stroke = am4core.color("#00000000"); //#00B0F0
        series.columns.template.strokeWidth = 0.5;
        series.name = name;
        
        var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  
        if (name == "Normal"){
            series.fill = am4core.color("#32CD32");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
            
        } else {
          // if the number of exceeding measurements = 0, use blue label color.
          if (soilwater_exceed === 0) {
                labelBullet.label.fill = am4core.color("#32CD32");
              } else {
                labelBullet.label.fill = am4core.color("#ff0000");
            }
            series.fill = am4core.color("#80b20000"); // Exceeds limit}                
            labelBullet.label.text = "{valueX.formatNumber('#.')}";
            labelBullet.label.fontSize = 45;
  
        }
        labelBullet.locationX = 0.5;
        labelBullet.interactionsEnabled = false;
        labelBullet.label.dy = 10;
  
        series.columns.template.width = am4core.percent(100);
        //series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
        
        // Click chart and filter, update maps
        const chartElement = document.getElementById("chartPanel");
        series.columns.template.events.on("hit", filterByChart, this);
  
        function filterByChart(ev) {
            const selectedC = ev.target.dataItem.component.name;
            const selectedP = ev.target.dataItem.categoryY;
            
            if (selectedP == "Soil Water" && selectedC == "Exceeded") {
                selectedLayer = 4;
                selectedStatus = 3;
            
            } else if (selectedP == "Soil Water" && selectedC == "Normal") {
                selectedLayer = 4;
                selectedStatus = 2;
  
            }
  
            
            // Point 1:
  
                view.whenLayerView(monitorPt1).then(function (layerView) {
                    chartLayerView = layerView;
                    arrLviews.push(layerView);
                    chartElement.style.visibility = "visible";
                    
                    //testUtilPt1.definitionExpression = sqlExpression;
                    monitorPt1.queryFeatures().then(function(results) {
                        const ggg = results.features;
                        const rowN = ggg.length;
                        
                        let objID = [];
                        for (var i=0; i < rowN; i++) {
                            var obj = results.features[i].attributes.OBJECTID;
                            objID.push(obj);
                        }
                        
                        var queryExt = new Query({
                            objectIds: objID
                        });
                        
                        monitorPt1.queryExtent(queryExt).then(function(result) {
                            if (result.extent) {
                                view.goTo(result.extent)
                            }
                        });
  
                        if (highlightSelect) {
                            highlightSelect.remove();
                        }
                        highlightSelect = layerView.highlight(objID);
                        
                        view.on("click", function() {
                            highlightSelect.remove();
                        });
                        
                        view.on("click", function() {
                            layerView.filter = null;
                        });
                    }); // end of query features   
                }); // end of when layerview
  
            // Point: 2
            view.whenLayerView(monitorPt).then(function (layerView) {
                chartLayerView = layerView;
                arrLviews.push(layerView);
                chartElement.style.visibility = "visible";
                
                view.on("click", function() {
                    layerView.filter = null;
                });
            }); // end of when layerview
  
  
        // Query view using compiled arrays
        for(var i = 0; i < arrLviews.length; i++) {
            arrLviews[i].filter = {
                where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
            }
        }
    } // End of filterByChart
  } // end of createSeries function
  
  createSeries("value1", "Exceeded");
  createSeries("value2", "Normal");
  }); // end of queryFeatures
  }
  chartSoilWater();
  
  
  
  // 4. Air Quality
  function chartAirQuality() {
  var total_airquality_exceed = {
    onStatisticField: "CASE WHEN (Type = 3 and Status = 3) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_airquality_exceed",
    statisticType: "sum"
  };
  
  var total_airquality_normal = {
    onStatisticField: "CASE WHEN (Type = 3 and Status = 2) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_airquality_normal",
    statisticType: "sum"  
  };
  
  var query = monitorPt.createQuery();
  query.outStatistics = [total_airquality_exceed, total_airquality_normal];
  query.returnGeometry = true;
  
  monitorPt.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    const airquality_exceed = stats.total_airquality_exceed;
    const airquality_normal = stats.total_airquality_normal;
  
    if (airquality_exceed === 0) {
        let okLogo = document.getElementById("logoFail_airquality");
        okLogo.src = "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png";
        okLogo.style.width = 25;
        okLogo.style.height = 25;
    }
        
    
    var chart = am4core.create("chartAirQualityDiv", am4charts.XYChart);
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
  
  
    chart.hiddenState.properties.opacity = 0;
    
    chart.data = [
        {
            category: "Air Quality",
            value1: airquality_exceed,
            value2: 0,
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
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.fontSize = 0;
    valueAxis.renderer.labels.template.fill = "#ffffff";
    valueAxis.renderer.grid.template.strokeWidth = 0;
  
    let arrLviews = [];
  
    // createSeries function for charts
    function createSeries(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        //series.calculatePercent = true;
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "category";
        series.stacked = true;
        //series.dataFields.valueXShow = "totalPercent";
        series.dataItems.template.locations.categoryY = 0.5;
        
        // Bar chart line color and width
        series.columns.template.stroke = am4core.color("#00000000"); //#00B0F0
        series.columns.template.strokeWidth = 0.5;
        series.name = name;
        
        var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  
        if (name == "Normal"){
            series.fill = am4core.color("#32CD32");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
            
        } else {
          // if the number of exceeding measurements = 0, use blue label color.
          if (airquality_exceed === 0) {
                labelBullet.label.fill = am4core.color("#32CD32");
              } else {
                labelBullet.label.fill = am4core.color("#ff0000");
            }
            series.fill = am4core.color("#80b20000"); // Exceeds limit}                
            labelBullet.label.text = "{valueX.formatNumber('#.')}";
            labelBullet.label.fontSize = 45;
  
        }
        labelBullet.locationX = 0.5;
        labelBullet.interactionsEnabled = false;
        labelBullet.label.dy = 10;
  
        series.columns.template.width = am4core.percent(100);
        //series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
        
        // Click chart and filter, update maps
        const chartElement = document.getElementById("chartPanel");
        series.columns.template.events.on("hit", filterByChart, this);
  
        function filterByChart(ev) {
            const selectedC = ev.target.dataItem.component.name;
            const selectedP = ev.target.dataItem.categoryY;
            
            if (selectedP == "Air Quality" && selectedC == "Exceeded") {
                selectedLayer = 3;
                selectedStatus = 3;
            
            } else if (selectedP == "Air Quality" && selectedC == "Normal") {
                selectedLayer = 3;
                selectedStatus = 2;
  
            }
  
            
            // Point 1:
  
                view.whenLayerView(monitorPt1).then(function (layerView) {
                    chartLayerView = layerView;
                    arrLviews.push(layerView);
                    chartElement.style.visibility = "visible";
                    
                    //testUtilPt1.definitionExpression = sqlExpression;
                    monitorPt1.queryFeatures().then(function(results) {
                        const ggg = results.features;
                        const rowN = ggg.length;
                        
                        let objID = [];
                        for (var i=0; i < rowN; i++) {
                            var obj = results.features[i].attributes.OBJECTID;
                            objID.push(obj);
                        }
                        
                        var queryExt = new Query({
                            objectIds: objID
                        });
                        
                        monitorPt1.queryExtent(queryExt).then(function(result) {
                            if (result.extent) {
                                view.goTo(result.extent)
                            }
                        });
  
                        if (highlightSelect) {
                            highlightSelect.remove();
                        }
                        highlightSelect = layerView.highlight(objID);
                        
                        view.on("click", function() {
                            highlightSelect.remove();
                        });
                        
                        view.on("click", function() {
                            layerView.filter = null;
                        });
                    }); // end of query features   
                }); // end of when layerview
  
            // Point: 2
            view.whenLayerView(monitorPt).then(function (layerView) {
                chartLayerView = layerView;
                arrLviews.push(layerView);
                chartElement.style.visibility = "visible";
                
                view.on("click", function() {
                    layerView.filter = null;
                });
            }); // end of when layerview
  
  
        // Query view using compiled arrays
        for(var i = 0; i < arrLviews.length; i++) {
            arrLviews[i].filter = {
                where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
            }
        }
    } // End of filterByChart
  } // end of createSeries function
  
  createSeries("value1", "Exceeded");
  createSeries("value2", "Normal");
  }); // end of queryFeatures
  }
  chartAirQuality();
  
  
  
  
  // 5. Vibration
  function chartVibration() {
  var total_vibration_exceed = {
    onStatisticField: "CASE WHEN (Type = 2 and Status = 3) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_vibration_exceed",
    statisticType: "sum"
  };
  
  var total_vibration_normal = {
    onStatisticField: "CASE WHEN (Type = 2 and Status = 2) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_vibration_normal",
    statisticType: "sum"  
  };
  
  var query = monitorPt.createQuery();
  query.outStatistics = [total_vibration_exceed, total_vibration_normal];
  query.returnGeometry = true;
  
  monitorPt.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    const vibration_exceed = stats.total_vibration_exceed;
    const vibration_normal = stats.total_vibration_normal;
  
    if (vibration_exceed === 0) {
        let okLogo = document.getElementById("logoFail_vibration");
        okLogo.src = "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png";
        okLogo.style.width = 25;
        okLogo.style.height = 25;
    }
        
    
    var chart = am4core.create("chartVibrationDiv", am4charts.XYChart);
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
  
  
    chart.hiddenState.properties.opacity = 0;
    
    chart.data = [
        {
            category: "Vibration",
            value1: vibration_exceed,
            value2: 0,
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
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.fontSize = 0;
    valueAxis.renderer.labels.template.fill = "#ffffff";
    valueAxis.renderer.grid.template.strokeWidth = 0;
  
    let arrLviews = [];
  
    // createSeries function for charts
    function createSeries(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        //series.calculatePercent = true;
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "category";
        series.stacked = true;
        //series.dataFields.valueXShow = "totalPercent";
        series.dataItems.template.locations.categoryY = 0.5;
        
        // Bar chart line color and width
        series.columns.template.stroke = am4core.color("#00000000"); //#00B0F0
        series.columns.template.strokeWidth = 0.5;
        series.name = name;
        
        var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  
        if (name == "Normal"){
            series.fill = am4core.color("#32CD32");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
            
        } else {
          // if the number of exceeding measurements = 0, use blue label color.
          if (vibration_exceed === 0) {
                labelBullet.label.fill = am4core.color("#32CD32");
              } else {
                labelBullet.label.fill = am4core.color("#ff0000");
            }
            series.fill = am4core.color("#80b20000"); // Exceeds limit}                
            labelBullet.label.text = "{valueX.formatNumber('#.')}";
            labelBullet.label.fontSize = 45;
  
        }
        labelBullet.locationX = 0.5;
        labelBullet.interactionsEnabled = false;
        labelBullet.label.dy = 10;
  
        series.columns.template.width = am4core.percent(100);
        //series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
        
        // Click chart and filter, update maps
        const chartElement = document.getElementById("chartPanel");
        series.columns.template.events.on("hit", filterByChart, this);
  
        function filterByChart(ev) {
            const selectedC = ev.target.dataItem.component.name;
            const selectedP = ev.target.dataItem.categoryY;
            
            if (selectedP == "Vibration" && selectedC == "Exceeded") {
                selectedLayer = 2;
                selectedStatus = 3;
            
            } else if (selectedP == "Vibration" && selectedC == "Normal") {
                selectedLayer = 2;
                selectedStatus = 2;
  
            }
  
            
            // Point 1:
  
                view.whenLayerView(monitorPt1).then(function (layerView) {
                    chartLayerView = layerView;
                    arrLviews.push(layerView);
                    chartElement.style.visibility = "visible";
                    
                    //testUtilPt1.definitionExpression = sqlExpression;
                    monitorPt1.queryFeatures().then(function(results) {
                        const ggg = results.features;
                        const rowN = ggg.length;
                        
                        let objID = [];
                        for (var i=0; i < rowN; i++) {
                            var obj = results.features[i].attributes.OBJECTID;
                            objID.push(obj);
                        }
                        
                        var queryExt = new Query({
                            objectIds: objID
                        });
                        
                        monitorPt1.queryExtent(queryExt).then(function(result) {
                            if (result.extent) {
                                view.goTo(result.extent)
                            }
                        });
  
                        if (highlightSelect) {
                            highlightSelect.remove();
                        }
                        highlightSelect = layerView.highlight(objID);
                        
                        view.on("click", function() {
                            highlightSelect.remove();
                        });
                        
                        view.on("click", function() {
                            layerView.filter = null;
                        });
                    }); // end of query features   
                }); // end of when layerview
  
            // Point: 2
            view.whenLayerView(monitorPt).then(function (layerView) {
                chartLayerView = layerView;
                arrLviews.push(layerView);
                chartElement.style.visibility = "visible";
                
                view.on("click", function() {
                    layerView.filter = null;
                });
            }); // end of when layerview
  
  
        // Query view using compiled arrays
        for(var i = 0; i < arrLviews.length; i++) {
            arrLviews[i].filter = {
                where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
            }
        }
    } // End of filterByChart
  } // end of createSeries function
  
  createSeries("value1", "Exceeded");
  createSeries("value2", "Normal");
  }); // end of queryFeatures
  }
  chartVibration();
  
  
  // 6. Noise
  function chartNoise() {
  var total_noise_exceed = {
    onStatisticField: "CASE WHEN (Type = 1 and Status = 3) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_noise_exceed",
    statisticType: "sum"
  };
  
  var total_noise_normal = {
    onStatisticField: "CASE WHEN (Type = 1 and Status = 2) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_noise_normal",
    statisticType: "sum"  
  };
  
  var query = monitorPt.createQuery();
  query.outStatistics = [total_noise_exceed, total_noise_normal];
  query.returnGeometry = true;
  
  monitorPt.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    const noise_exceed = stats.total_noise_exceed;
    const noise_normal = stats.total_noise_normal;
  
    if (noise_exceed === 0) {
       document.getElementById("logoFail_noise").src = "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png";
    }
        
    
    var chart = am4core.create("chartNoiseDiv", am4charts.XYChart);
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
  
  
    chart.hiddenState.properties.opacity = 0;
    
    chart.data = [
        {
            category: "Noise",
            value1: noise_exceed,
            value2: 0,
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
    valueAxis.strictMinMax = true;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.fontSize = 0;
    valueAxis.renderer.labels.template.fill = "#ffffff";
    valueAxis.renderer.grid.template.strokeWidth = 0;
  
    let arrLviews = [];
  
    // createSeries function for charts
    function createSeries(field, name) {
        var series = chart.series.push(new am4charts.ColumnSeries());
        //series.calculatePercent = true;
        series.dataFields.valueX = field;
        series.dataFields.categoryY = "category";
        series.stacked = true;
        //series.dataFields.valueXShow = "totalPercent";
        series.dataItems.template.locations.categoryY = 0.5;
        
        // Bar chart line color and width
        series.columns.template.stroke = am4core.color("#00000000"); //#00B0F0
        series.columns.template.strokeWidth = 0.5;
        series.name = name;
        
        var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  
        if (name == "Normal"){
            series.fill = am4core.color("#32CD32");
            labelBullet.label.text = "";
            labelBullet.label.fill = am4core.color("#FFFFFFFF");
            labelBullet.label.fontSize = 0;
            
        } else {
          // if the number of exceeding measurements = 0, use blue label color.
          if (noise_exceed === 0) {
                labelBullet.label.fill = am4core.color("#32CD32");
              } else {
                labelBullet.label.fill = am4core.color("#ff0000");
            }
            series.fill = am4core.color("#80b20000"); // Exceeds limit}                
            labelBullet.label.text = "{valueX.formatNumber('#.')}";
            labelBullet.label.fontSize = 45;
  
        }
        labelBullet.locationX = 0.5;
        labelBullet.interactionsEnabled = false;
        labelBullet.label.dy = 10;
  
        series.columns.template.width = am4core.percent(100);
        //series.columns.template.tooltipText = "[font-size:15px]{name}: {valueX.value.formatNumber('#.')} ({valueX.totalPercent.formatNumber('#.')}%)"
        
        // Click chart and filter, update maps
        const chartElement = document.getElementById("chartPanel");
        series.columns.template.events.on("hit", filterByChart, this);
  
        function filterByChart(ev) {
            const selectedC = ev.target.dataItem.component.name;
            const selectedP = ev.target.dataItem.categoryY;
            
            if (selectedP == "Noise" && selectedC == "Exceeded") {
                selectedLayer = 1;
                selectedStatus = 3;
            
            } else if (selectedP == "Noise" && selectedC == "Normal") {
                selectedLayer = 1;
                selectedStatus = 2;
  
            }
  
            
            // Point 1:
  
                view.whenLayerView(monitorPt1).then(function (layerView) {
                    chartLayerView = layerView;
                    arrLviews.push(layerView);
                    chartElement.style.visibility = "visible";
                    
                    //testUtilPt1.definitionExpression = sqlExpression;
                    monitorPt1.queryFeatures().then(function(results) {
                        const ggg = results.features;
                        const rowN = ggg.length;
                        
                        let objID = [];
                        for (var i=0; i < rowN; i++) {
                            var obj = results.features[i].attributes.OBJECTID;
                            objID.push(obj);
                        }
                        
                        var queryExt = new Query({
                            objectIds: objID
                        });
                        
                        monitorPt1.queryExtent(queryExt).then(function(result) {
                            if (result.extent) {
                                view.goTo(result.extent)
                            }
                        });
  
                        if (highlightSelect) {
                            highlightSelect.remove();
                        }
                        highlightSelect = layerView.highlight(objID);
                        
                        view.on("click", function() {
                            highlightSelect.remove();
                        });
                        
                        view.on("click", function() {
                            layerView.filter = null;
                        });
                    }); // end of query features   
                }); // end of when layerview
  
            // Point: 2
            view.whenLayerView(monitorPt).then(function (layerView) {
                chartLayerView = layerView;
                arrLviews.push(layerView);
                chartElement.style.visibility = "visible";
                
                view.on("click", function() {
                    layerView.filter = null;
                });
            }); // end of when layerview
  
  
        // Query view using compiled arrays
        for(var i = 0; i < arrLviews.length; i++) {
            arrLviews[i].filter = {
                where: "Type = " + selectedLayer + " AND " +  "Status = " + selectedStatus
            }
        }
    } // End of filterByChart
  } // end of createSeries function
  
  createSeries("value1", "Exceeded");
  createSeries("value2", "Normal");
  }); // end of queryFeatures
  }
  chartNoise();
  
  // Total number of exceeded measurements
  function totalExceedingCount() {
  var total_noise_exceed = {
    onStatisticField: "CASE WHEN (Type = 1 and Status = 3) THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_noise_exceed",
    statisticType: "sum"
  };
  
  var total_vibration_exceed = {
  onStatisticField: "CASE WHEN (Type = 2 and Status = 3) THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_vibration_exceed",
  statisticType: "sum"
  };
  
  var total_airquality_exceed = {
  onStatisticField: "CASE WHEN (Type = 3 and Status = 3) THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_airquality_exceed",
  statisticType: "sum"
  };
  
  var total_soilwater_exceed = {
  onStatisticField: "CASE WHEN (Type = 4 and Status = 3) THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_soilwater_exceed",
  statisticType: "sum"
  };
  
  var total_groundwater_exceed = {
  onStatisticField: "CASE WHEN (Type = 5 and Status = 3) THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_groundwater_exceed",
  statisticType: "sum"
  };
  
  var total_surfacewater_exceed = {
  onStatisticField: "CASE WHEN (Type = 6 and Status = 3) THEN 1 ELSE 0 END",
  outStatisticFieldName: "total_surfacewater_exceed",
  statisticType: "sum"
  };
  
  var query = monitorPt.createQuery();
  query.outStatistics = [total_noise_exceed, total_vibration_exceed,
                       total_airquality_exceed, total_soilwater_exceed,
                       total_groundwater_exceed, total_surfacewater_exceed, 
                      ];
  query.returnGeometry = true;
  
  monitorPt.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    const totalExceeding = stats.total_noise_exceed + 
                           stats.total_vibration_exceed +
                           stats.total_airquality_exceed +
                           stats.total_soilwater_exceed +
                           stats.total_groundwater_exceed +
                           stats.total_surfacewater_exceed
  
    totalProgressDiv.innerHTML = totalExceeding;
  
  });
  }
  totalExceedingCount();
  
  am4core.options.autoDispose = true;
  }); // End of am4core.ready
  
  
  /////////////////////////////////////////////////////////////////////////////////////
  /*
  view.when(function () {
      view.popup.autoOpenEnabled = true; //disable popups
  
      // Create the Editor
      let editor = new Editor({
        view: view
      });
  
      // Add widget to top-right of the view
      view.ui.add(editor, "bottom-right");
    });
    */
  // LayerList and Add legend to the LayerList
    // On-off feature layer tab
    var layerList = new LayerList({
        view: view,
        listItemCreatedFunction: function(event) {
          const item = event.item;
          if (item.title === "Chainage" ||
              item.title === "OpenStreetMap 3D Buildings"){
            item.visible = false
          }
        }
      });
  /*
      view.ui.add(layerList, {
        position: "bottom-left"
      });
  */
  var legend = new Legend({
  view: view,
  container: document.getElementById("legendDiv"),
  layerInfos: [
  {
  layer: monitorPt,
  title: "Monitoring Indicators"
  
  },
  {
  layer: monitorPt1,
  title: "Survey Results"
  }
  ]
  });
  
    // Compass
    var compass = new Compass({
      view: view});
      // adds the compass to the top left corner of the MapView
    view.ui.add(compass, "top-right");
  
    var layerListExpand = new Expand ({
        view: view,
        content: layerList,
        expandIconClass: "esri-icon-visible",
        group: "top-right"
    });
    view.ui.add(layerListExpand, {
        position: "top-right"
    });
    // End of LayerList
  
    view.ui.empty("top-left");
  
            // Full screen logo
    view.ui.add(
        new Fullscreen({
            view: view,
            element: viewDiv
        }),
        "top-right"
    );
  
    var legendExpand = new Expand({
  view: view,
  content: legend,
  expandIconClass: "esri-icon-legend",
  group: "top-right"
  });
  view.ui.add(legendExpand, {
  position: "top-right"
  });
  
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
      
  
  
  //*****************************//
  //      Search Widget          //
  //*****************************//
  var searchWidget = new Search({
  view: view,
  locationEnabled: false,
  allPlaceholder: "Chainage",
  includeDefaultSources: false,
  sources: [
  {
  layer: chainageLayer,
  searchFields: ["KmSpot"],
  displayField: "KmSpot",
  exactMatch: false,
  outFields: ["*"],
  zoomScale: 1000,
  name: "Main KM",
  placeholder: "example: 80 + 400"
  }
  ]
  });
  
  const searchExpand = new Expand({
  view: view,
  content: searchWidget,
  expandIconClass: "esri-icon-search",
  group: "top-right"
  });
    view.ui.add(searchExpand, {
      position: "top-right"
    });
  searchExpand.watch("expanded", function() {
  if(!searchExpand.expanded) {
  searchWidget.searchTerm = null;
  }
  });
  
  });