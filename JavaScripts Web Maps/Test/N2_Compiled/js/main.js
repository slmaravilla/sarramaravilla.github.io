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
  "esri/smartMapping/statistics/summaryStatistics",
  "esri/rest/support/StatisticDefinition",
  "esri/symbols/WebStyleSymbol",
  "esri/widgets/Expand",
  "esri/widgets/Editor",
  "esri/renderers/UniqueValueRenderer",
  "esri/layers/support/Sublayer",
  "esri/widgets/Search",
  "esri/widgets/Compass",
  "esri/widgets/BasemapToggle",
  "esri/popup/support/FieldInfoFormat"
], function(Basemap, Map, MapView, SceneView, 
            FeatureLayer, FeatureFilter,
            SceneLayer, Layer, TileLayer, VectorTileLayer,
            LabelClass, LabelSymbol3D, WebMap,
            WebScene, PortalItem, Portal, Legend, LayerList, Fullscreen,
            geometryService, Query, summaryStatistics,
            StatisticDefinition, WebStyleSymbol, Expand, Editor,
            UniqueValueRenderer, Sublayer, Search, Compass, BasemapToggle, FieldInfoFormat) {

let chartLayerView;
const features = [];

//******************************//
// Basemap and Scenview Setting //
//******************************//
  var basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: "f666b3fb303c47ddb9b0dae032f800f5" // 3a62040541b84f528da3ac7b80cf4a63
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


  const toggle = new BasemapToggle({
    view: view,
    nextBaseMap: "hybrid"
  });

  view.ui.add(toggle, "top-right");
  


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
  var headerDiv = document.getElementById("headerDiv");
  var headerTitleDiv = document.getElementById("headerTitleDiv");


//*******************************//
// Label Class Property Settings //
//*******************************//
// Chainage Label
var labelChainage = new LabelClass({
labelExpressionInfo: {expression: "$feature.KM_MAIN"},
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
            color: "orange"
          },
          size: 30,
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
        screenLength: 150,
        maxWorldLength: 150,
        minWorldLength: 20
      },
      callout: {
        type: "line", // autocasts as new LineCallout3D()
        color: "orange",
        size: 0.3,
        border: {
          color: "grey"
        }
      }
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: 'DefaultValue($feature.Station, "no data")'
      //value: "{TEXTSTRING}"
  }
  });

// Utility Point Label
var labelUtilPtSymbol = {
type: "label-3d", // autocasts as new LabelSymbol3D()
labelPlacement: "above-center",
labelExpressionInfo: {
//value: "{Company}",
expression: "When($feature.Status == 0, DomainName($feature, 'Comp_Agency'), '')" //$feature.Comp_Agency
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

// Utility Line Label

var testLineLabelClass = {
type: "label-3d", // autocasts as new LabelSymbol3D()
labelPlacement: "above-center", // Polyline has not choice
labelExpressionInfo: {
expression: "When($feature.Status == 0, DomainName($feature, 'Comp_Agency'), '')"
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

// Esri Icon Symbol
  function IconSymbol(name) {
    return {
      type: "web-style", // autocasts as new WebStyleSymbol()
      name: name,
      styleName: "EsriIconsStyle"//EsriRealisticTransportationStyle, EsriIconsStyle
    };
  }

// Utility Point Symbol
/// https://developers.arcgis.com/javascript/latest/guide/esri-web-style-symbols-3d/
function utilPtSymbolInfra(name) {
return {
type: "web-style",
name: name,
styleName: "EsriInfrastructureStyle"
};
}

function utilPtSymbolStreet(name) {
return {
type: "web-style",
name: name,
styleName: "EsriRealisticStreetSceneStyle"
};
}

function utilPtSymbolIcons(name) {
return {
type: "web-style",
name: name,
styleName: "EsriIconsStyle"
};
}

/* custom 3D Web Style for Utility Pole */
// Choice: 3D_Electric_Pole, 3D_Drain_Box, 3D_Water_Valve, 3D_Telecom_BTS, 3D_TelecomCATV_Pole

function customSymbol3D(name) {
return {
type: "web-style",
portal: "https://www.maps.arcgis.com",

// IMPORTANT: Your browser needs to be able to open the following link. It will say insecure so need to go to advanced.
styleUrl: "https://www.maps.arcgis.com/sharing/rest/content/items/c04d4d4145f64f8fa38407dd5331dd1f/data",
name: name
};
}


/* Company and Utilty Relocation Status Symbols with Callout */
var verticalOffsetExisting = {
screenLength: 10,
maxWorldLength: 10,
minWorldLength: 15
};

var verticalOffsetRelocation = {
screenLength: 10,
maxWorldLength: 30,
minWorldLength: 35
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
        color: [128,128,128,0.1],
        size: 0.2,
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
        color: [128,128,128,0.1],
        size: 0.2,
        border: {
          color: "grey"
        }
      }
    };
    }

  }

//*******************************//
// Label Class Property Settings //
//*******************************//
// Pier No
var pierNoLabelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: "white"
          },
          size: 15,
          haloColor: "black",
          haloSize: 1,
          font: {
            family: "Ubuntu Mono",
            weight: "bold"
          },
        }
      ],
      verticalOffset: {
        screenLength: 100,
        maxWorldLength: 100,
        minWorldLength: 20
      },
      callout: {
        type: "line", // autocasts as new LineCallout3D()
        color: "white",
        size: 0.7,
        border: {
          color: "grey"
        }
      }
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: "$feature.PIER"
      //value: "{TEXTSTRING}"
  }
  });


var chainageNoLabelClass = new LabelClass({
    symbol: {
      type: "label-3d",// autocasts as new LabelSymbol3D()
      symbolLayers: [
        {
          type: "text", // autocasts as new TextSymbol3DLayer()
          material: {
            color: "white"
          },
          size: 15,
          haloColor: "black",
          haloSize: 1,
          font: {
            family: "Ubuntu Mono",
            weight: "bold"
          },
        }
      ],
      verticalOffset: {
        screenLength: 70,
        maxWorldLength: 100,
        minWorldLength: 20
      },
      callout: {
        type: "line", // autocasts as new LineCallout3D()
        color: [115, 223, 255],
        size: 0.7,
        border: {
          color: "grey"
        }
      }
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: "$feature.KmSpot"
      //value: "{TEXTSTRING}"
  }
  });

//*****************************//
//      Renderer Settings      //
//*****************************//
// Pier Heand Pier Column
let pierHeadColRenderer = {
type: "unique-value",
field: "Layer",
defaultSymbol: { type: "simple-fill" },  // autocasts as new SimpleFillSymbol()
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "Pier_Column",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [78, 78, 78, 0.5],
}
},
{
// All features with value of "North" will be blue
value: "Pier_Head",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [169, 169, 169, 0.7]
}
}
]
};

// PNR
let pnrRenderer = {
type: "unique-value",
valueExpression: "When($feature.LandOwner == 'BASES CONVERSION DEVELOPMENT AUTHORITY', 'BCDA', \
                   $feature.LandOwner == 'MANILA RAILROAD COMPANY' || $feature.LandOwner == 'Manila Railroad Company','PNR',$feature.LandOwner)",
uniqueValueInfos: [
{
value: "BCDA",
symbol: {
  type: "simple-fill",
  color: [204, 204, 204],
  style: "diagonal-cross",
  outline: {
    width: 0.5,
    color: "black"
  }
}
},
{
value: "PNR",
symbol: {
  type: "simple-fill",
  color: [204, 204, 204],
  style: "diagonal-cross",
  outline: {
    width: 0.5,
    color: "black"
  }
}
}
]
};


// Station Symbol
  function stationsSymbol(name) {
    return {
      type: "web-style", // autocasts as new WebStyleSymbol()
      name: name,
      styleName: "EsriIconsStyle"//EsriRealisticTransportationStyle, EsriIconsStyle
    };
  }
// Station
var stationsRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    field: "Station",
    defaultSymbol: stationsSymbol("Train"),//Backhoe, Train
  };

// Utility Point
/* 3D Web Style */
var utilTypePtRenderer = {
    type: "unique-value", //"unique-value", "simple"
    //Field: "UtilType2",
    //defaultSymbol: ,
    //valueExpression: "When($feature.UtilType == 1, 'Telecom', $feature.UtilType == 2, 'Water',$feature.UtilType == 3, 'Power', $feature.UtilType)",
    valueExpression: "When($feature.UtilType2 == 1, 'Telecom Pole (BTS)',$feature.UtilType2 == 2, 'Telecom Pole (CATV)', $feature.UtilType2 == 3, 'Water Meter', \
                           $feature.UtilType2 == 4, 'Water Valve', $feature.UtilType2 == 5, 'Manhole', $feature.UtilType2 == 6, 'Drain Box', \
                           $feature.UtilType2 == 7, 'Electric Pole', $feature.UtilType2 == 8, 'Street Light', $feature.UtilType)",
    uniqueValueInfos: [
      {
        value: "Telecom Pole (BTS)",
        symbol: customSymbol3D("3D_Telecom_BTS")
      },
      {
        value: "Telecom Pole (CATV)",
        symbol: customSymbol3D("3D_TelecomCATV_Pole")
      },
      {
        value: "Manhole",
        symbol: utilPtSymbolStreet("Storm_Drain")
      },
      {
        value: "Electric Pole",
        //symbol: utilPtSymbolInfra("Powerline_Pole")
        symbol: customSymbol3D("3D_Electric_Pole")
      },
      {
        value: "Street Light",
        symbol: utilPtSymbolStreet("Overhanging_Street_and_Sidewalk_-_Light_on")
      }
    ],
    visualVariables: [
      {
        type: "size",
        axis: "height",
        field: "SIZE",
        valueUnit: "meters"
      },
      {
        type: "rotation",
        field: "ROTATION"
      }
      /*
      {
        type: "opacity",
        //valueExpression: "($feature.Status * $feature.LAYER) / 2",
        valueExpression: "When($feature.Status == 1 && $feature.LAYER == 1, 0, 1)",
        field: "SIZE",
        stops: [
          {value: 0, opacity: 0.005}, //  want to delete
          {value: 1, opacity: 1}, // want to visualize
        ],
        legendOptions: {
          showLegend: false
        }
      }
*/
    ]
  };

/* Company and Utilty Relocation Status Symbols with Callout */
/// Symbol for Utility Existing feature layer
var utilExistSymbolRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    field: "Company",
    uniqueValueInfos: [
      {
        value: "Meralco",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Meralco_Gray.png",
          "#D13470",
          10,
          "Existing"
        )
      },
      {
        value: "Globe",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/GlobeGray.png",
          "#D13470",
          10,
          "Existing"
          )
      }
    ],
    visualVariables: [         
      {
        type: "opacity",
        field: "SIZE",
        stops: [
          {value: 0, opacity: 0.5},
          {value: 20, opacity: 0.5},
        ],
        legendOptions: {
          showLegend: false
        }
      }
      
    ]
  };
//IsEmpty($feature.LAYER)
/// Symbol for Utility Relocated feature layer
var utilReloSymbolRenderer = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    valueExpression: "When($feature.Remarks == 'pending', 'NoAction', \
                           $feature.Status == 1 && $feature.LAYER == 1, 'DemolishComplete',\
                           $feature.Status == 0 && $feature.LAYER == 1, 'DemolishIncomplete',\
                           $feature.Status == 0 && $feature.LAYER == 2, 'RelocIncomplete', \
                           $feature.Status == 1 && $feature.LAYER == 2, 'RelocComplete', \
                           $feature.Status == 0 && $feature.LAYER == 3, 'NewlyAdded', \
                           $feature.Status == 1 && $feature.LAYER == 3, 'NewlyAddedComplete',$feature.Comp_Agency)", 
    //field: "Company",
    uniqueValueInfos: [
      {
        value: "DemolishIncomplete",
        label: "To be Demolished",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Demolished.png",
          "#D13470",
          20,
          "Relocation"
        )
      },
      {
        value: "DemolishComplete",
        label: "Demolision Completed",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/DemolishComplete_v2.png",
          "#D13470",
          25,
          "Relocation"
          )
      },
      {
        value: "RelocIncomplete",
        label: "To be Relocated",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Relocatd.png",
          "#D13470",
          28,
          "Relocation"
          )
      },
      {
        value: "RelocComplete",
        label: "Relocation Completed",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Utility_Relocated_Completed_Symbol.png",
          "#D13470",
          28,
          "Relocation"
          )
      },
      {
        value: "NewlyAdded",
        label: "To be Newly Added",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/NewlyAdded.png",
          "#D13470",
          35,
          "Relocation"
          )
      },
      {
        value: "NewlyAddedComplete",
        label: "Newly Added Completed",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/NewlyAdded_Completed.png",
          "#D13470",
          35,
          "Relocation"
          )
      },
      {
        value: "NoAction",
        label: "Require Data Checking",
        symbol: getUniqueValueSymbol(
          "https://EijiGorilla.github.io/Symbols/Unknown_v2.png",
          "#D13470",
          35,
          "Relocation"
          )
      }
    ]
  };


// Existing Points

// Utility Line
/* UniqueValueRenderer for line3D: color, width, and line type*/
const options = { // Circle
    profile: "circle",
    cap: "none",
    join: "miter",
    width: 0.5,
    height: 0.5,
    //color: [200, 200, 200],
    profileRotation: "all"
  };

const options1 = { // rectangular
profile: "quad",
cap: "none",
join: "miter",
width: 0.5,
height: 0.5,
color: [200, 200, 200],
profileRotation: "heading"
};

/* The colors used for the each transit line */

const colorsRelocation = {
1: [32,178,170, 0.5], //Telecom Line
2: [112,128,144, 0.5], // Internet Cable Line
3: [0, 128, 255, 0.5], // Water Distribution Pipe
4: [224, 224, 224, 0.5], // Sewage
5: [105,105,105, 0.5], // Drainage
6: [205,133,63, 0.5], // Canal
7: [139,69,19, 0.5], // Creek
8: [211,211,211, 0.5] // Elecric Line
};

const colorsExisting = {
1: [229, 229, 229, 0.1], //Telecom/CA (Utility TYpe)
2: [229, 229, 229, 0.1], // Water
3: [229, 229, 229, 0.1], // Power
}; 


// Priority
// Default symbol
let defaultSymbol = {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
style: "solid",
outline: {  // autocasts as new SimpleLineSymbol()
color: [110, 110, 110],
width: 0.7
}
};

function colorPriority() {
return {
1: [255,255,0],
2: [112,173,71],
3: [0,112,255]
}
}

let lotPriorityRenderer = {
type: "unique-value",
//field: "HandOverDate",
defaultSymbol: defaultSymbol,  // autocasts as new SimpleFillSymbol()
valueExpression: "When($feature.HandOverDate1 == 'August 2022', '0', \
                   $feature.HandOverDate1 == 'September 2022', '1', \
                   $feature.HandOverDate1 == 'December 2022', '2', $feature.HandOverDate1)",
uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "0",
label: "August 2022",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 4,
    color: colorPriority()[1]
  }
}
},
{
// All features with value of "North" will be blue
value: "1",
label: "September 2022",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 4,
    color: colorPriority()[2]
  }
}
},
{
value: "2",
label: "December 2022",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [0,0,0,0],
outline: {
    width: 4,
    color: colorPriority()[3]
  }
}
},
]
}

// Tree cutting
const outlineColor = "gray";

function colorsCut() {
return {
1: [112,173,71],
2: [0,112,255],
3: [255,255,0],
4: [255,170,0]
}
}
const colorsCompen = ["#33FF0000", "#33FFFF00", "#3371AB48"]; //[1:Non-Compensable, 2:For Processing, 3:Compensated]

///////////////////
/////////////////////
let treeCuttingRenderer = {
type: "unique-value",
valueExpression: "When($feature.Status == 1, 'cutearthb', \
                   $feature.Status == 2, 'permit', $feature.Status == 3, 'submit', \
                   $feature.Status == 4, 'ongoing', $feature.Status)",
uniqueValueInfos: [
{
value: "cutearthb",
label: "Cut/Earthballed",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 8,
        resource: {
          primitive: "circle"
        },
        material: {
          color: [112,173,71]
        },
        outline: {
          color: "white",
          size: 0.5
        }
      }
    ]
}
},
{
value: "permit",
label: "Permit Acquired",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 8,
        resource: {
          primitive: "circle"
        },
        material: {
          color: [255,255,0]
        },
        outline: {
          color: "white",
          size: 0.5
        }
      }
    ]
}
},
{
value: "submit",
label: "Submitted to DENR",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 7,
        resource: {
          primitive: "circle"
        },
        material: {
          color: [255,170,0]
        },
        outline: {
          color: "white",
          size: 0.5
        }
      }
    ]
}
},
{
value: "ongoing",
label: "Ongoing Acquisition of Application Documents",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 7,
        resource: {
          primitive: "circle"
        },
        material: {
          color: [255,0,0]
        },
        outline: {
          color: "white",
          size: 0.5
        }
      }
    ]
}
},
]
};

let treeCompensationRenderer = {
type: "unique-value",
valueExpression: "When($feature.Compensation == 1, 'nonCompensable', $feature.Compensation == 2, 'process', \
                   $feature.Compensation == 3, 'compensated', $feature.Compensation)",
                   uniqueValueInfos: [
{
value: "nonCompensable",
label: "Non-Compensable",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 8,
        resource: {
          primitive: "circle"
        },
        material: {
          color: [0,112,255]
        },
        outline: {
          color: "white",
          size: 0.5
        }
      }
    ]
}
},
{
value: "process",
label: "For Processing",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 8,
        resource: {
          primitive: "circle"
        },
        material: {
          color: [255,255,0]
        },
        outline: {
          color: "white",
          size: 0.5
        }
      }
    ]
}
},
{
value: "compensated",
label: "Compensated",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 7,
        resource: {
          primitive: "circle"
        },
        material: {
          color: [113,171,72]
        },
        outline: {
          color: "white",
          size: 0.5
        }
      }
    ]
}
}
]
};


// Free and Clear

let fncRenderer = {
type: "simple",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: [76, 230, 0, 0.5],
}

}

// ISF Relocation
const isfSymbolColor = {
1: [0, 197, 255], // Relocated  (original: 255, 0, 197), // Relocated
    2: [112, 173, 71], // Paid
    3: [0, 112, 255], // For Payment Processing
    4: [255, 255, 0], // For Legal Pass 
    5: [255, 170, 0], // For Appraisal/OtC/Requirements for Other Entitlements
    6: [255, 0, 0] //LBP Account Opening
}

let isfRenderer = {
type: "unique-value",
valueExpression: "When($feature.StatusRC == 1, 'relocated', \
                   $feature.StatusRC == 2, 'paid', $feature.StatusRC == 3, 'payp', \
                   $feature.StatusRC == 4, 'legalpass', $feature.StatusRC == 5, 'otc', \
                   $feature.StatusRC == 6, 'lbp', $feature.StatusRC)",
uniqueValueInfos: [
{
value: "relocated",
label: "Relocated",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 7,
        resource: {
          primitive: "triangle"
        },
        material: {
          color: isfSymbolColor[1]
        },
        outline: {
          color: "white",
          size: 0.6
        }
      }
    ]
}
},
{
value: "paid",
label: "Paid",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 7,
        resource: {
          primitive: "triangle"
        },
        material: {
          color: isfSymbolColor[2]
        },
        outline: {
          color: "white",
          size: 0.6
        }
      }
    ]
}
},
{
value: "payp",
label: "For Payment Processing",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 7,
        resource: {
          primitive: "triangle"
        },
        material: {
          color: isfSymbolColor[3]
        },
        outline: {
          color: "white",
          size: 0.6
        }
      }
    ]
}
},
{
value: "legalpass",
label: "For Legal Pass",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 7,
        resource: {
          primitive: "triangle"
        },
        material: {
          color: isfSymbolColor[4]
        },
        outline: {
          color: "white",
          size: 0.6
        }
      }
    ]
}
},
{
value: "otc",
label: "For Appraisal/OtC/Reqs for Other Entitlements",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 7,
        resource: {
          primitive: "triangle"
        },
        material: {
          color: isfSymbolColor[5]
        },
        outline: {
          color: "white",
          size: 0.6
        }
      }
    ]
}
},
{
value: "lbp",
label: "LBP Account Opening",
symbol: {
type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [
      {
        type: "icon", // autocasts as new IconSymbol3DLayer()
        size: 7,
        resource: {
          primitive: "triangle"
        },
        material: {
          color: isfSymbolColor[6]
        },
        outline: {
          color: "white",
          size: 0.6
        }
      }
    ]
}
}
]
};


// Station Box
let stationBoxRenderer = {
type: "unique-value",
field: "Layer",
defaultSymbol: { type: "simple-fill"},
uniqueValueInfos: [
{
value: "00_Platform",
symbol: {
  type: "simple-fill",
  color: [160, 160, 160],
  style: "backward-diagonal",
  outline: {
    width: 1,
    color: "black"
  }
}
},
{
value: "00_Platform 10car",
symbol: {
  type: "simple-fill",
  color: [104, 104, 104],
  style: "cross",
  outline: {
    width: 1,
    color: "black",
    style: "short-dash"
  }
}
},
{
value: "00_Station",
symbol: {
  type: "simple-fill",
  color: [0, 0, 0, 0],
  outline: {
    width: 2,
    color: [115, 0, 0]
  }
}
}
]
};

function colorLotReqs(){
return {
0: [0, 197, 255], 
1: [112,173,71],
2: [0,112,255],
3: [255,255,0],
4: [255,170,0],
5: [255,0,0],
}
}

let lotLayerRenderer = {
type: "unique-value",
///field: "StatusLA",
defaultSymbol: defaultSymbol,  // autocasts as new SimpleFillSymbol()
valueExpression: "When($feature.StatusLA == 0, '0',$feature.StatusLA == 1, '1', $feature.StatusLA == 2, '2', \
                   $feature.StatusLA == 3, '3', $feature.StatusLA == 4, '4', \
                   $feature.StatusLA == 5, '5', $feature.StatusLA)",
                   uniqueValueInfos: [
{
// All features with value of "North" will be blue
value: "0",
label: "Handed-Over",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[0],
}
},
{
// All features with value of "North" will be blue
value: "1",
label: "Paid",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[1],
}
},
{
// All features with value of "North" will be blue
value: "2",
label: "For Payment Processing",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[2],
}
},
{
// All features with value of "North" will be blue
value: "3",
label: "For Legal Pass",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[3],
}
},
{
// All features with value of "North" will be blue
value: "4",
label: "For Appraisal/Offer to Buy",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[4],
}
},
{
// All features with value of "North" will be blue
value: "5",
label: "For Expro",
symbol: {
type: "simple-fill",  // autocasts as new SimpleFillSymbol()
color: colorLotReqs()[5],
}
}
]
}

/////////////////////////////////////////////////////////////////////////////////////////////////

//*****************************//
//      Layer Import           //
//*****************************//
// Station box
var stationBoxLayer = new FeatureLayer ({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 3,
renderer: stationBoxRenderer,
elevationInfo: {
mode: "on-the-ground"
},
title: "Station Box",
outFields: ["*"],
popupEnabled: false
});
map.add(stationBoxLayer,0);

// Pier head and column
var pierHeadColumnLayerLayer = new FeatureLayer ({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
title: "Pier Head/Column",
outFields: ["*"],
renderer: pierHeadColRenderer,
elevationInfo: {
mode: "on-the-ground"
},
popupEnabled: false
});
//pierHeadColumnLayerLayer.listMode = "hide";
map.add(pierHeadColumnLayerLayer, 1);


// PNR
var pnrLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 10,
elevationInfo: {
mode: "on-the-ground"
},
  outFields: ["*"],
  title: "PNR",
  labelsVisible: false,
  renderer: pnrRenderer,
  popupTemplate: {
    title: "<p>{LandOwner} ({LotID})</p>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "HandOverDate",
            label: "Hand-Over Date"
          },
          {
            fieldName: "Municipality"
          },
          {
            fieldName: "Barangay"
          }
        ]
      }
    ]
  }

});
map.add(pnrLayer, 1);

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
labelingInfo: [chainageNoLabelClass],
outFields: ["*"],
popupEnabled: false

});
//chainageLayer.listMode = "hide";
map.add(chainageLayer, 1);

// ROW //
const otherSym = {
type: "simple-line", // autocasts as new SimpleLineSymbol()
color: "red",
width: 4,
style: "short-dash"
};
let prowRenderer = {
type: "unique-value",  // autocasts as new UniqueValueRenderer()
field: "Extension",
defaultSymbol: otherSym,  // autocasts as new SimpleFillSymbol()
uniqueValueInfos: [
{
value: "N2",
label: "",
type: "simple-line",
color: "red",
width: 4,
style: "short-dash" 
}
]

};


var rowLayer = new FeatureLayer ({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
title: "ROW",
renderer: prowRenderer,
elevationInfo: {
           // this elevation mode will place points on top of
           // buildings or other SceneLayer 3D objects
           mode: "on-the-ground"
           },
definitionExpression: "Extension = 'N2'",
popupEnabled: false
});
map.add(rowLayer,2);



// Pier No. (point feature)
var PierNoLayer = new FeatureLayer ({
portalItem: {
id: "590680d19f2e48fdbd8bcddce3aaedb5",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 6,
labelingInfo: [pierNoLabelClass],
elevationInfo: {
    mode: "on-the-ground" //absolute-height, relative-to-ground
  },
title: "Pier No",
outFields: ["*"],
popupEnabled: false
});
map.add(PierNoLayer, 1);

// Structure
var structureLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 6,
  title: "Status of Structure",
  outFields: ["*"],
  elevationInfo: {
    mode: "on-the-ground"
  },
  popupTemplate: {
    title: "<p>{StrucID}</p>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "StrucOwner",
            label: "Structure Owner"
          },
          {
            fieldName: "StatusStruc",
            label: "<p>Status of Structure</p>"
          },               
          {
            fieldName: "LotID",
            label: "Lot ID"
          },
          {
            fieldName: "Municipality"
          },
          {
            fieldName: "Barangay"
          }
        ]
      }
    ]
  }
});
map.add(structureLayer);

const colors = {
    1: [0, 197, 255], // Dismantling/Clearing
    2: [112, 173, 71], // Paid
    3: [0, 112, 255], // For Payment Processing
    4: [255, 255, 0], // For Legal Pass 
    5: [255, 170, 0],// For Appraisal/Offer to Compensate
    6: [255, 0, 0] //LBP Account Opening
  };

function renderStructureLayer() {
    const renderer = new UniqueValueRenderer({
      field: "StatusStruc"
    });

    for (let property in colors) {
      if (colors.hasOwnProperty(property)) {
        renderer.addUniqueValueInfo({
          value: property,
          symbol: {
            type: "simple-fill",
            color: colors[property],
            style: "backward-diagonal",
            outline: {
              color: "#6E6E6E",
              width: 0.7
            }
           }
        });
      }
    }

    structureLayer.renderer = renderer;
  }

  renderStructureLayer();


// Relocation Status point layer
var reloISFLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 4,
renderer: isfRenderer,
  outFields: ["*"],
  title: "Status for Relocation (ISF)",
  popupTemplate: {
    title: "<p>{StrucID}</p>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "StrucOwner",
            label: "Structure Owner"
          },
          {
            fieldName: "Municipality"
          },
          {
            fieldName: "Barangay"
          },
          {
            fieldName: "StatusRC",
            label: "<p>Status for Relocation(ISF)</p>"
          },
          {
            fieldName: "Name",
          },
          {
            fieldName: "Status",
            label: "Status of NLO/LO"
          }
        ]
      }
    ]
  }
});
//reloISFLayer.listMode = "hide";
map.add(reloISFLayer);



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
       //definitionExpression: "Extension = 'N2'"
        //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
  });
  //stationLayer.listMode = "hide";
  map.add(stationLayer, 0);

// Status of Relocation (Occupancy)
var relocationPtLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 5,
//renderer: occupancyRenderer,
  outFields: ["*"],
  title: "Structure (Occupancy Status)",
  popupTemplate: {
    title: "<p>{StrucID}</p>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "StrucOwner",
            label: "Structure Owner"
          },
          {
            fieldName: "Municipality"
          },
          {
            fieldName: "Barangay"
          },
          {
            fieldName: "Occupancy",
            label: "<p>Status for Relocation(structure)</p>"
          },
          {
            fieldName: "Name",
          },
          {
            fieldName: "Status",
            label: "Status of NLO/LO"
          }
        ]
      }
    ]
  }
});
map.add(relocationPtLayer);

// Priority Layter
// Priority Lot
var priorityLayer = new FeatureLayer ({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
elevationInfo: {
mode: "on-the-ground"
},
renderer: lotPriorityRenderer,
definitionExpression: "HandOverDate1 IS NOT NULL",
title: "Priority Lot",
popupEnabled: false
});
map.add(priorityLayer,2);

// Land 
var lotLayer = new FeatureLayer({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 7,
renderer:lotLayerRenderer,
  outFields: ["*"],
  title: "Land Acquisition (Status)",
  labelsVisible: false,
  elevationInfo: {
    mode: "on-the-ground"
  },
  popupTemplate: {
    title: "<p>Lot No: {LotID} <br>Hand-Over Date: {HandOverDate}</br><br>Handed-Over Area: {percentHandedOver} %</br></p>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "StatusLA",
            label: "<p>Status</p>"
          },
        {
          fieldName: "LandUse",
          label: "Land Use"
        },
          {
            fieldName: "Municipality"
          },
          {
            fieldName: "Barangay"
          },
          {
            fieldName: "LandOwner",
            label: "Land Owner"
          }
        ]
      }
    ]
  }
});
map.add(lotLayer, 1);

// Tree Cutting
var treeCuttingLayer = new FeatureLayer ({
portalItem: {
id: "4da5697d684f4babad15aedfe74c5b36",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
outFields: ["*"],
title: "Status of Tree Cutting",
renderer: treeCuttingRenderer,
popupTemplate: {
title: "<h5>Tree Cutting Status: {Status}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
{
  type: "fields",
  fieldInfos: [
    {
      fieldName: "ScientificName",
      label: "Scientific Name"
    },
    {
      fieldName: "CommonName",
      label: "Common Name"
    },
    {
      fieldName: "Province"
    },
    {
      fieldName: "Municipality"
    },
    {
      fieldName: "TreeNo",
      label: "Tree No."
    },
    {
      fieldName: "CP",
      label: "<h5>CP</h5>"
    },
    {
      fieldName: "Compensation",
      label: "Status of Tree Compensation"
    },
    {
      fieldName: "Conservation",
      label: "Conservation Status"
    },
  ]
}
]
}
});
map.add(treeCuttingLayer);

// Tree Compensation
var compensationLayer = new FeatureLayer ({
portalItem: {
id: "4da5697d684f4babad15aedfe74c5b36",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
outFields: ["*"],
title: "Status of Tree Compensation",
renderer: treeCompensationRenderer,
popupTemplate: {
title: "<h5>Compensation Status: {Compensation}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
{
  type: "fields",
  fieldInfos: [
    {
      fieldName: "ScientificName",
      label: "Scientific Name"
    },
    {
      fieldName: "CommonName",
      label: "Common Name"
    },
    {
      fieldName: "Province"
    },
    {
      fieldName: "Municipality"
    },
    {
      fieldName: "TreeNo",
      label: "Tree No."
    },
    {
      fieldName: "CP",
      label: "<h5>CP</h5>"
    },
    {
      fieldName: "Status",
      label: "Status of Tree Cutting"
    },
    {
      fieldName: "Conservation",
      label: "Conservation Status"
    },
  ]
}
]
}
});
map.add(compensationLayer);

// Utility Point
// To locate a symbol with callout on the ground, 
// If basemap elevation layer is on, use "relative-to-ground"
// If basemap elevatio layer is off, use "absolute-height"
/* 3D Web Style */

var testUtilPt = new FeatureLayer({
portalItem: {
id: "109d4ef09fd946d1bda17396f35deb94",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
title: "Relocation Plan (Point)",
outFields: ["*"],
renderer: utilTypePtRenderer,
elevationInfo: {
mode: "relative-to-ground",
featureExpressionInfo: {
 expression: "$feature.Height"
},
unit: "meters"
//offset: 0
},
popupTemplate: {
title: "<h5>{Comp_Agency}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
actions: [
 {
  id: "find-relocated",
  title: "Go to Relocated"
 }
],
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "ID"
     },
     {
       fieldName: "UtilType",
       label: "Utility Type"
     },
     {
       fieldName: "UtilType2",
       label: "Utility Name"
     },
     {
       fieldName: "LAYER",
       label: "<h5>Action</h5>"
     },
     {
       fieldName: "Status",
       label: "<h5>Status</h5>"
     },
     {
       fieldName: "CP"
     },
     {
       fieldName: "Remarks"
     }
   ]
 }
]
}
});
testUtilPt.listMode = "hide";
map.add(testUtilPt, 3);

/* Symbols with callout */
// To locate a symbol with callout on the ground, 
// If basemap elevation layer is on, use "relative-to-ground"
// If basemap elevatio layer is off, use "absolute-height"

var testUtilPt1 = new FeatureLayer({
portalItem: {
id: "109d4ef09fd946d1bda17396f35deb94",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 1,
title: "Utility Point",
outFields: ["*"],
renderer: utilReloSymbolRenderer,
elevationInfo: {
mode: "relative-to-ground",
featureExpressionInfo: {
 expression: "$feature.Height"
},
unit: "meters"
//offset: 0
},
labelingInfo: [labelUtilPtSymbol],
popupTemplate: {
title: "<h5>{comp_agency}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
actions: [
 {
  id: "find-relocated",
  title: "Go to Relocated"
 }
],
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "ID"
     },
     {
       fieldName: "UtilType",
       label: "Utility Type"
     },
     {
       fieldName: "UtilType2",
       label: "Utility Name"
     },
     {
       fieldName: "LAYER",
       label: "<h5>Action</h5>"
     },
     {
       fieldName: "Status",
       label: "<h5>Status</h5>"
     },
     {
       fieldName: "cp"
     },
     {
       fieldName: "Remarks"
     }
   ]
 }
]
}
});
map.add(testUtilPt1);



// Utility Line
var testLine = new FeatureLayer({
portalItem: {
id: "109d4ef09fd946d1bda17396f35deb94",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 2,
title: "Utility Line",
elevationInfo: {
mode: "relative-to-ground",
featureExpressionInfo: {
 expression: "$feature.height"
},
unit: "meters"
//offset: 0
},
outFields: ["*"],
popupTemplate: {
title: "<h5>{comp_agency}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
actions: [
 {
  id: "find-relocated-line",
  title: "Go to Relocated"
 }
],
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "id"
     },
     {
       fieldName: "utiltype",
       label: "Utility Type"
     },
     {
       fieldName: "utiltype2",
       label: "Utility Name"
     },
     {
       fieldName: "layer",
       label: "<h5>Action</h5>"
     },
     {
       fieldName: "status",
       label: "<h5>Status</h5>"
     },
     {
       fieldName: "cp"
     },
     {
       fieldName: "remarks"
     }
   ]
 }
]
}
});
testLine.listMode = "hide";
map.add(testLine, 4);

/* Utility Line rendnerer*/
function lineSizeShapeSymbolLayers(profile, cap, join, width, height, profileRotation, property){
return {
      type: "line-3d",
      symbolLayers: [
          {
              type: "path",
                profile: profile,
                material: {
                  color: colorsRelocation[property]
                },
                width: width,
                height: height,
                join: join,
                cap: cap,
                anchor: "bottom",
                profileRotation: profileRotation
          }
      ]
}
}
  function rendertestLine() {
    const renderer = new UniqueValueRenderer({
      field: "utiltype2"
    });

    for (let property in colorsRelocation) { // For each utility type 2
      if (property == 1) { // If utility type2 === Telecom Line
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter",0.5,0.5,"all", property)
        });

      } else if (property == 2) { // "Internet Cable Line"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter",0.4,0.4,"all", property)
        });

      } else if (property == 3) { // "Water Distributin Pipe"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 1, 1, "all", property)
        });

      } else if (property == 4) { // "Sewerage"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 1, 1,"all", property)
        });

      } else if (property == 5) { // "Drainage"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 1, 1,"all", property)
        });
      
      } else if (property == 6) { // "Canal"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("quad","none","miter", 2, 2,"all", property)
        });

      } else if (property == 7) { // "Creek"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 1, 1,"all", property)
        });

      } else if (property == 8) { // "Electric Line"
          renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("circle","none","miter", 0.3, 0.3,"all", property)
        });

      } else {// end of 'property == '1'
        renderer.addUniqueValueInfo({
          value: property,
          symbol: lineSizeShapeSymbolLayers("quad","none","miter", 0.3, 0.3,"all", property)

        });
      }
      

    }

    testLine.renderer = renderer;
  }

  rendertestLine();

/*Line for Symbols */
var testLine1 = new FeatureLayer({
portalItem: {
id: "109d4ef09fd946d1bda17396f35deb94",
portal: {
  url: "https://gis.railway-sector.com/portal"
}
},
layerId: 2,
title: "Utility Line",
elevationInfo: {
mode: "relative-to-ground",
featureExpressionInfo: {
 expression: "$feature.height"
},
unit: "meters"
//offset: 0
},
outFields: ["*"],
renderer: utilReloSymbolRenderer,
labelingInfo: [testLineLabelClass],
popupTemplate: {
title: "<h5>{comp_agency}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
actions: [
 {
  id: "find-relocated-line",
  title: "Go to Relocated"
 }
],
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "id"
     },
     {
       fieldName: "utiltype",
       label: "Utility Type"
     },
     {
       fieldName: "utiltype2",
       label: "Utility Name"
     },
     {
       fieldName: "layer",
       label: "<h5>Action</h5>"
     },
     {
       fieldName: "status",
       label: "<h5>Status</h5>"
     },
     {
       fieldName: "cp"
     },
     {
       fieldName: "remarks"
     }
   ]
 }
]
}
});

map.add(testLine1);


// Free and Clear Lot //
var fncLayer = new FeatureLayer ({
portalItem: {
id: "dca1d785da0f458b8f87638a76918496",
portal: {
url: "https://gis.railway-sector.com/portal"
}
},
layerId: 2,
renderer: fncRenderer,
elevationInfo: {
mode: "on-the-ground"
},

title: "Free and Clear",
popupEnabled: false
});
map.add(fncLayer,0);

// Viaduct Layer
const colorsViaduct = {
    1: [225, 225, 225, 0.1], // To be Constructed (white)
    2: [130, 130, 130, 0.5], // Under Construction
    3: [255, 0, 0, 0.8], // Delayed
    4: [0, 112, 255, 0.8], // Bored Pile
    5: [0, 112, 255, 0.8], // Pile cap
    6: [0, 112, 255, 0.8], // Pier
    7: [0, 112, 255, 0.8], // Pier head
    8: [0, 112, 255, 0.8], // Pre-cast
  };

var viaductLayer = new SceneLayer({
portalItem: {
      id: "a9c0878766964fa794cc67bbf38b7a09",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      }
    },
   // popupTemplate: viadTemplate,
    elevationInfo: {
    mode: "absolute-height" //absolute-height, relative-to-ground
  },
      title: "Viaduct",
      outFields: ["*"],
      // when filter using date, example below. use this format
      //definitionExpression: "EndDate = date'2020-6-3'"
      /*
      popupTemplate: {
title: "<h5>{Status1}</h5>",
lastEditInfoEnabled: false,
returnGeometry: true,
content: [
 {
   type: "fields",
   fieldInfos: [
     {
       fieldName: "Type",
       label: "Type of Structure"
     },
     {
       fieldName: "PierNumber",
       Label: "Pier No."
     }
   ]
 }
]
}
*/      
    });
    map.add(viaductLayer);

    function renderViaductLayer() {
    const renderer = new UniqueValueRenderer({
      field: "Status1"
    });

    for (let property in colorsViaduct) {
      if (colorsViaduct.hasOwnProperty(property)) {
        renderer.addUniqueValueInfo({
          value: property,
          symbol: {
            type: "mesh-3d",
            symbolLayers: [
              {
                type: "fill",
                material: {
                  color: colorsViaduct[property],
                  colorMixMode: "replace"
                },
                edges: {
                  type: "solid", // autocasts as new SolidEdges3D()
                  color: [225, 225, 225, 0.3]
                  }
              }
            ]
           }
        });
      }
    }

    viaductLayer.renderer = renderer;
  }

  renderViaductLayer()







  /////////////////////////////////////////////////////////////////////////////
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

// Thousand separators function
function thousands_separators(num)
{
var num_parts = num.toString().split(".");
num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
return num_parts.join(".");
}

//
var opacityInput = document.getElementById("opacityInput");
var utilChartDiv = document.getElementById("utilChartDiv");
var structureChartDiv = document.getElementById("structureChartDiv");

const chartElement = document.getElementById("chartPanel");
const chartElementStructure = document.getElementById("structureChartPanel");
const chartElementTreeUL = document.getElementById("treeULchartPanel");

var cpSelect = document.getElementById("cpSelect");
var handoverdateSelect = document.getElementById("handoverdateSelect");


/// CP and HandedOver Dropdown list
//// Drop Down list for CP and Priority
// Query all features from the lot layer to add all CPs to a drop-down list

view.when(function() {
return lotLayer.when(function() {
  var query = lotLayer.createQuery();
  return lotLayer.queryFeatures(query);
});
})
.then(getValues)
.then(getUniqueValues)
.then(addToSelect)

// newValue1: CP
// newValue2: HandOverDate
function queryForLotGeometries() {
var lotQuery = lotLayer.createQuery();

return lotLayer.queryFeatures(lotQuery).then(function(response) {
  lotGeometries = response.features.map(function(feature) {
      return feature.geometry;
  });
  return lotGeometries;
});

// tree cutting layer
var treeQuery = treeCuttingLayer.createQuery();

return treeCuttingLayer.queryFeatures(treeQuery).then(function(response) {
treeGeometries = response.features.map(function(feature) {
  return feature.geometry;
});
return treeGeometries;
});

// Utility point
var utilityPointQuery = testUtilPt.createQuery();

return testUtilPt.queryFeatures(utilityPointQuery).then(function(response) {
utilityPointGeometries = response.features.map(function(feature) {
  return feature.geometry;
});
return utilityPointGeometries;
});

// Utility Line
var utilityLineQuery = testLine.createQuery();

return testLine.queryFeatures(utilityLineQuery).then(function(response) {
utilityLineGeometries = response.features.map(function(feature) {
  return feature.geometry;
});
return utilityLineGeometries;
});
// 
} // end of queryForLotGeometries()

// 1. Write Function to filter Barangay and Priority
/// 1.1. Filter Lot for CP List
function filterLotMunicipality() {
var query2 = lotLayer.createQuery();
query2.where = lotLayer.definitionExpression; // use filtered municipality. is this correct?

lotLayer.queryFeatures(query2)
.then(getQuery2Values)
.then(getUniqueValues2)
.then(addToSelectQuery2);
}

// 2. Get values and Return to list
//Return an array of all the values in the 'CP' field'
/// 2.1. CP
function getValues(response) {
var features = response.features;
var values = features.map(function(feature) {
  return feature.attributes.CP;
});
return values;
}

// Return an array of unique values in the 'Municipality' field of the lot Layer
function getUniqueValues(values) {
var uniqueValues = [];

values.forEach(function(item, i) {
  if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) && item !== "") {
      uniqueValues.push(item);
      //headerTitleDiv.innerHTML = uniqueValues;
  }
});
return uniqueValues;
}

// Add the unique values to the CP select element. this will allow the user
// to filter lot layer by CP.
function addToSelect(values) {
values.sort();
values.unshift('None'); // Add 'None' to the array and place it to the beginning of the array
values.forEach(function(value) {
  var option = document.createElement("option");
  option.text = value;
  cpSelect.add(option);
});
}

/// 2.2. HandOverDate
// Filter HandOverDay List when CP list changes
function getQuery2Values(response) {
var featuresQuery2 = response.features;
var query2Values = featuresQuery2.map(function(feature) {
return feature.attributes.HandOverDate1;
});
return query2Values;
}

function getUniqueValues2(values2) {
var uniqueValues2 = [];
values2.forEach(function(item, i) {
  if ((uniqueValues2.length < 1 || uniqueValues2.indexOf(item) === -1) && item !== "") {
      uniqueValues2.push(item);
  }
});
return uniqueValues2;
}

// Add the unique values to the second select element (Barangay)
function addToSelectQuery2(query2Values) {
handoverdateSelect.options.length = 0;
query2Values.sort();
query2Values.unshift('None');
query2Values.forEach(function(value) {
var option = document.createElement("option");
option.text = value;
handoverdateSelect.add(option);
});

//return setLotBarangayExpression(handoverdateSelect.value);
}



// Set the definition expression on the lot layer
// to reflect the selecction of the user
// Only for CP
function setMunicipalExpression() {
var municipal = cpSelect.options[cpSelect.selectedIndex].value;

if (municipal == 'None') {
lotLayer.definitionExpression = null;
priorityLayer.definitionExpression = null;
treeCuttingLayer.definitionExpression = null;
compensationLayer.definitionExpression = null;
testUtilPt.definitionExpression = null;
testUtilPt1.definitionExpression = null;
testLine.definitionExpression = null;
testLine1.definitionExpression = null;

} else {
lotLayer.definitionExpression = "CP = '" + municipal + "'";
priorityLayer.definitionExpression = "CP = '" + municipal + "'";
treeCuttingLayer.definitionExpression = "CP = '" + municipal + "'";
compensationLayer.definitionExpression = "CP = '" + municipal + "'";
testUtilPt.definitionExpression = "CP = '" + municipal + "'";
testUtilPt1.definitionExpression = "CP = '" + municipal + "'";
testLine.definitionExpression = "CP = '" + municipal + "'";
testLine1.definitionExpression = "CP = '" + municipal + "'";
viaductLayer.definitionExpression = "CP = '" + municipal + "'";
}

//var barang = handoverdateSelect.options[handoverdateSelect.selectedIndex].value;
if (!lotLayer.visible) {
  lotLayer.visible = true;
}
return queryForLotGeometries();
}

// Only for Municipcality + Barangay
function setMunicipalBarangDefinitionExpression() {
var municipal = cpSelect.options[cpSelect.selectedIndex].value;
var barang = handoverdateSelect.options[handoverdateSelect.selectedIndex].value;


// headerTitleDiv.innerHTML = municipal + ", " + barang;

if (municipal == 'None' && barang == 'None') {
lotLayer.definitionExpression = null;
priorityLayer.definitionExpression = null;
treeCuttingLayer.definitionExpression = null;
compensationLayer.definitionExpression = null;
testUtilPt.definitionExpression = null;
testUtilPt1.definitionExpression = null;
testLine.definitionExpression = null;
testLine1.definitionExpression = null;

} else if (municipal !== 'None' && barang == 'None') {
lotLayer.definitionExpression = "CP = '" + municipal + "'";
priorityLayer.definitionExpression = "CP = '" + municipal + "'";
treeCuttingLayer.definitionExpression = "CP = '" + municipal + "'";
compensationLayer.definitionExpression = "CP = '" + municipal + "'";
testUtilPt.definitionExpression = "CP = '" + municipal + "'";
testUtilPt1.definitionExpression = "CP = '" + municipal + "'";
testLine.definitionExpression = "CP = '" + municipal + "'";
testLine1.definitionExpression = "CP = '" + municipal + "'";
viaductLayer.definitionExpression = "CP = '" + municipal + "'";

} else if (municipal == 'None' && barang !== 'None') {
lotLayer.definitionExpression = "HandOverDate1 = '" + barang + "'";
priorityLayer.definitionExpression = "HandOverDate1 = '" + barang + "'";
treeCuttingLayer.definitionExpression = null;
compensationLayer.definitionExpression = null;
testUtilPt.definitionExpression = null;
testUtilPt1.definitionExpression = null;
testLine.definitionExpression = null;
testLine1.definitionExpression = null;

} else if (municipal !== 'None' && barang !== 'None') {
lotLayer.definitionExpression = "CP = '" + municipal + "'" + " AND " + "HandOverDate1 = '" + barang + "'";
priorityLayer.definitionExpression = "CP = '" + municipal + "'" + " AND " + "HandOverDate1 = '" + barang + "'";
viaductLayer.definitionExpression = "CP = '" + municipal + "'";
//treeCuttingLayer.definitionExpression = "CP = '" + municipal + "'" + " AND " + "HandOverDate1 = '" + barang + "'";
//compensationLayer.definitionExpression = "CP = '" + municipal + "'" + " AND " + "HandOverDate1 = '" + barang + "'";
//testUtilPt.definitionExpression = "CP = '" + municipal + "'" + " AND " + "HandOverDate1 = '" + barang + "'";
//testUtilPt1.definitionExpression = "CP = '" + municipal + "'" + " AND " + "HandOverDate1 = '" + barang + "'";
//testLine.definitionExpression = "CP = '" + municipal + "'" + " AND " + "HandOverDate1 = '" + barang + "'";

//testLine1.definitionExpression = "CP = '" + municipal + "'" + " AND " + "HandOverDate1 = '" + barang + "'";
}

//var barang = handoverdateSelect.options[handoverdateSelect.selectedIndex].value;
if (!lotLayer.visible) {
  lotLayer.visible = true;
}
return queryForLotGeometries();
}

// addEventListener for Municipality, Barangay, and Priority
cpSelect.addEventListener("change", function() {
var type = event.target.value;
var target = event.target;

setMunicipalExpression();
filterLotMunicipality();

view.whenLayerView(lotLayer).then(function (layerView) {
lotLayer.queryFeatures().then(function(results) {
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

lotLayer.queryExtent(queryExt).then(function(result) {
    if (result.extent) {
        view.goTo(result.extent)
    }
});

if (highlightSelect) {
    highlightSelect.remove();
}
highlightSelect = layerView.highlight(objID);

view.on("click", function() {
  layerView.filter = null;
  highlightSelect.remove();
});
}); // End of queryFeatures
layerView.filter = {
where: "CP = '" + type + "'"
}
}); // End of view.whenLayerView

});


let concatView = [];

// Event listener for Handed-Over date
handoverdateSelect.addEventListener("change", function() {
var type = event.target.value;

setMunicipalBarangDefinitionExpression();

view.when(function() {
view.whenLayerView(lotLayer).then(function (layerView) {
concatView.push(layerView);
lotLayer.queryFeatures().then(function(results) {
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

lotLayer.queryExtent(queryExt).then(function(result) {
  if (result.extent) {
      view.goTo(result.extent)
  }
});

if (highlightSelect) {
  highlightSelect.remove();
}
highlightSelect = layerView.highlight(objID);

view.on("click", function() {
layerView.filter = null;
highlightSelect.remove();
});
}); // End of queryFeatures
}); // End of view.whenLayerView

view.whenLayerView(priorityLayer).then(function (layerView) {
concatView.push(layerView);
priorityLayer.queryFeatures().then(function(results) {
const ggg = results.features;
    const rowN = ggg.length;

    let objID = [];
    for (var i=0; i < rowN; i++) {
        var obj = results.features[i].attributes.OBJECTID;
        objID.push(obj);
    }

    if (highlightSelect) {
        highlightSelect.remove();
    }
    highlightSelect = layerView.highlight(objID);

    view.on("click", function() {
    layerView.filter = null;
    highlightSelect.remove();
    });
}); // End of queryFeatures
}); // End of view.whenLayerView
});
for(var i = 0; i < concatView.length; i++) {
concatView[i].filter = {
where: "HandOverDate1 = '" + type + "'"
}
}
});


// Tree Chart switch button
/*
treeChartChangeButton.addEventListener("change", filterByType);
function filterByType(e) {
const selectedType = e.target.id;
if(selectedType == "Tree Cutting") {
compensationLayer.visible = false;
treeCuttingLayer.visible = true;

updateChartCutting();

} else if (selectedType == "Compensation") {
compensationLayer.visible = true;
treeCuttingLayer.visible = false;

updateChartCompensation();

}

}
*/




/// CP and HandedOver Dropdown list

////////////////////////////////////////////////////////////////////////////////////////////////////////
//*****************************//
//      PopUp Settig           //
//*****************************//
// Utility Point
var highlightSelect;

view.when(function() {
var popup = view.popup;
popup.viewModel.on("trigger-action", function(event) {
if (event.action.id == "find-relocated") {
var attributes = popup.viewModel.selectedFeature.attributes;
var info = attributes.Id;
var infoObjId = attributes.OBJECTID; //1

view.whenLayerView(testUtilPt).then(function(layerView) {
testUtilPt.queryFeatures().then(function(results) {
    const ggg = results.features;
    const rowN = ggg.length; //7
    //var rrr = results.features[0].attributes.Id;
    //var rrr = results.features[6].attributes.Id; // return Id of 7th row
    
    var i;
    let objID = [];
      for (i=0; i < rowN; i++) {
        if (results.features[i].attributes.Id == info) {
            if (results.features[i].attributes.OBJECTID == infoObjId) {
                continue;
            }
            var obj = results.features[i].attributes.OBJECTID;
            objID.push(obj);
          }
      }

var queryExt = new Query({
  //objectIds: [1,2,3,4,5]
  //objectIds: objID
  objectIds: objID
});

testUtilPt1.queryExtent(queryExt).then(function(result) {
  if (result.extent) {
    view.goTo(result.extent.expand(200))
  }
});

if (highlightSelect) {
  highlightSelect.remove();
}
highlightSelect = layerView.highlight(objID);

view.on("click", function() {
  highlightSelect.remove();
});

//



}); // End of queryFeatures()


}); // End of layerView

} // End of if (event.action.id...)
});
}); // End of view.when()

// Utility Line
view.when(function() {
var popup = view.popup;
popup.viewModel.on("trigger-action", function(event) {
if (event.action.id == "find-relocated-line") {
var attributes = popup.viewModel.selectedFeature.attributes;
var info = attributes.Id;
var infoObjId = attributes.OBJECTID; //1

view.whenLayerView(testLine).then(function(layerView) {
  testLine.queryFeatures().then(function(results) {
    const ggg = results.features;
    const rowN = ggg.length; //7
    //var rrr = results.features[0].attributes.Id;
    //var rrr = results.features[6].attributes.Id; // return Id of 7th row
    
    var i;
    let objID = [];
      for (i=0; i < rowN; i++) {
        if (results.features[i].attributes.Id == info) {
            if (results.features[i].attributes.OBJECTID == infoObjId) {
                continue;
            }
            var obj = results.features[i].attributes.OBJECTID;
            objID.push(obj);
          }
      }

var queryExt = new Query({
  //objectIds: [1,2,3,4,5]
  //objectIds: objID
  objectIds: objID
});

testLine1.queryExtent(queryExt).then(function(result) {
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
}); // End of queryFeatures()


}); // End of layerView

} // End of if (event.action.id...)
});
}); // End of view.when()


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
        if (item.title === "Chainage" || item.title === "Viaduct" || item.title === "Pier No" || item.title === "Status of Tree Compensation"){
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
layer: lotLayer,
title: "Land Acquisition"

},
{
layer: priorityLayer,
title: "Lot Priority"
},
{
layer: structureLayer,
title: "Status of Structure"
},
{
layer: reloISFLayer,
title: "ISF Relocation"
},
{
layer: relocationPtLayer,
title: "Occupancy"
},
{
layer: treeCuttingLayer,
title: "Tree Cutting"
},
{
layer: compensationLayer,
title: "Tree Compensation"
},
{
layer: pnrLayer,
title: "PNR"
},
{
layer: fncLayer,
title: "Free and Clear"

},
{
layer: rowLayer,
title: "PROW"
},
{
layer: stationBoxLayer,
title: "Station Box"
},
{
layer: testUtilPt,
title: "Utility Point"
},
{
layer: testLine,
title: "Utility Line"
},
{
layer: testUtilPt1,
title: "Utility Relocation"
}
]
});


/*
var legendExpand = new Expand({
view: view,
content: legend,
expandIconClass: "esri-icon-legend",
group: "bottom-right"
});
view.ui.add(legendExpand, {
position: "bottom-right"
});
*/
  var layerListExpand = new Expand ({
      view: view,
      content: layerList,
      expandIconClass: "esri-icon-visible",
      group: "bottom-right"
  });
  view.ui.add(layerListExpand, {
      position: "bottom-right"
  });
  // End of LayerList

  view.ui.empty("top-left");

  // Compass
  var compass = new Compass({
    view: view});
    // adds the compass to the top left corner of the MapView
  view.ui.add(compass, "top-right");

// Full screen logo
fullscreen = new Fullscreen({
view: view,
});
view.ui.add(fullscreen, "top-right");

//*****************************//
//      Search Widget          //
//*****************************//
var searchWidget = new Search({
view: view,
locationEnabled: false,
allPlaceholder: "Chainage or Utility ID",
includeDefaultSources: false,
sources: [
{
layer: priorityLayer,
searchFields: ["LotID"],
displayField: "LotID",
exactMatch: false,
outFields: ["LotID"],
name: "Lot ID",
placeholder: "example: 10083"
},
{
layer: PierNoLayer,
searchFields: ["PIER"],
displayField: "PIER",
exactMatch: false,
outFields: ["PIER"],
name: "Pier No",
zoomScale: 1000,
placeholder: "example: P-288"
},
{
layer: chainageLayer,
searchFields: ["KmSpot"],
displayField: "KmSpot",
exactMatch: false,
outFields: ["*"],
zoomScale: 1000,
name: "Main KM",
placeholder: "example: 80+400"
},
{
layer: testUtilPt,
searchFields: ["Id"],
displayField: "Id",
exactMatch: false,
outFields: ["Id"],
name: "Unique ID (Point)",
placeholder: "example: MER0001-X01"
},
{
layer: testLine1,
searchFields: ["Id"],
displayField: "Id",
exactMatch: false,
outFields: ["Id"],
name: "Unique ID (Line)",
placeholder: "example: MER0001-X01"
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
    
document
.getElementById("opacityInput")
.addEventListener("change", function(event) {
//map.ground.opacity = event.target.checked ? 0.1 : 0.9;
map.ground.opacity = event.target.checked ? 0.1 : 0.6;
});
view.ui.add("menu", "bottom-right");

});