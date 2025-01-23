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
    "esri/TimeExtent",
    "esri/layers/ElevationLayer",
    "esri/Ground",
    "esri/widgets/Search",
    "esri/widgets/BasemapToggle",
    "esri/geometry/geometryEngine",
    "esri/geometry/Polygon",
    "esri/geometry/support/webMercatorUtils",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/geometry/SpatialReference",
    "esri/core/reactiveUtils",
    "esri/widgets/ElevationProfile",
    "esri/widgets/ElevationProfile/ElevationProfileLineQuery",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/rest/support/RouteParameters",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/views/3d/externalRenderers",
    "esri/rest/support/FeatureSet",
    "esri/core/Accessor",
  ], function(Basemap, Map, MapView, SceneView, 
              FeatureLayer, FeatureFilter,
              SceneLayer, Layer, TileLayer, VectorTileLayer,
              LabelClass, LabelSymbol3D, WebMap,
              WebScene, PortalItem, Portal,
              TimeSlider, Legend, LayerList, Fullscreen,
              geometryService, Query,
              StatisticDefinition, WebStyleSymbol,
              TimeExtent, Expand, Editor, UniqueValueRenderer, DatePicker,
              FeatureTable, Compass, TimeExtent, ElevationLayer, Ground, Search,
              BasemapToggle, geometryEngine, Polygon,
              webMercatorUtils, GraphicsLayer, Graphic, SpatialReference, reactiveUtils,
              ElevationProfile, ElevationProfileLineQuery,
              GraphicsLayer, Graphic, RouteParameters,
              SimpleMarkerSymbol, SimpleLineSymbol, Point, Polyline,
              externalRenderers, FeatureSet, Accessor) {
  
  let chartLayerView;
  //const features = [];
  const spatialReference = SpatialReference.WebMercator;
  
// Route Layer for animatioin
      // The stops and route result will be stored in this layer
      var routeLyr = new GraphicsLayer();
  
      // Setup the route parameters
      var routeParams = new RouteParameters({
          stops: new FeatureSet(),
          outSpatialReference: { // autocasts as new SpatialReference()
              wkid: 3857
          }
      });
  
      // Define the symbology used to display the stops
      var stopSymbol = new SimpleMarkerSymbol({
          style: "cross",
          size: 0, // 15
          outline: { // autocasts as new SimpleLineSymbol()
              width: 0 // 4
          }
      });
  
      // Define the symbology used to display the route
      var routeSymbol = new SimpleLineSymbol({
          color: [0, 0, 255, 0], // [0, 0, 255, 0.5]
          width: 5
      });
//


    var basemap = new Basemap({
    baseLayers: [
      new VectorTileLayer({
        portalItem: {
          id: "3a62040541b84f528da3ac7b80cf4a63" 
        }
      })
    ]
  });
  
  // Add custom DEM to the default elevation layer of esri
  const worldElevation = new ElevationLayer({
    url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
    });
    
  const dem = new ElevationLayer({
    portalItem: {
      id: "dd2e85411a504182adb99215aa98ab68",
      portal: {
          url: "https://gis.railway-sector.com/portal"
      },
    }
    });
  
    var map = new Map({
          basemap: basemap, // "streets-night-vector", basemap, topo-vector
          ground: new Ground({
            layers: [worldElevation, dem]
          })
    });
    //map.ground.surfaceColor = "#FFFF";
    //map.ground.opacity = 0.1;
     
    var view = new SceneView ({
        map: map,
        container: "viewDiv",
        viewingMode: "local",
        camera: {
            position: {
                x: 121.0322874,
                y: 14.6750462,
                z: 1000
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
////// Train Animation using externalRenderers
  
      // Adds a graphic when the user clicks the map. If 2 or more points exist, route is solved.
      //on(view, "click", addStop);
      view.on("click", function() {
        addStop();

    });

    function addStop(event) {

        // Add a point at the location of the map click
        //var stop = new Graphic({
        //    geometry: event.mapPoint,
        //    symbol: stopSymbol
        //});

        var stop1 = new Graphic({
            geometry: new Point(
                {x: polylinePoints[0][0], 
                 y: polylinePoints[0][1],
                 z: polylinePoints[0][2],
                 spatialReference: SpatialReference.WebMercator}),
            symbol: stopSymbol
        });
        routeLyr.add(stop1);

        const lengthAnimeLine = polylinePoints.length;
        var stop2 = new Graphic({
            geometry: new Point(
                {x: polylinePoints[lengthAnimeLine - 1][0],
                 y: polylinePoints[lengthAnimeLine - 1][1],
                 z: polylinePoints[lengthAnimeLine - 1][2],
                 spatialReference: SpatialReference.WebMercator }),
            symbol: stopSymbol
        });
        routeLyr.add(stop2);

        routeParams.stops.features.push(stop1);
        routeParams.stops.features.push(stop2);

        // Execute the route task if 2 or more stops are input
        //routeParams.stops.features.push(stop);
        if (routeParams.stops.features.length >= 2) {
            //routeTask.solve(routeParams).then(showRoute);
            showRoute();
        }
    }

    // Adds the solved route to the map as a graphic
    function showRoute(data) {
        
        //var routeResult = data.routeResults[0].route;

        var polyline = new Polyline(polylinePoints);
        polyline.spatialReference = SpatialReference.WebMercator;

        var routeResult = new Graphic({
            geometry: polyline,
            symbol: routeSymbol
        });
        routeResult.symbol = routeSymbol;

        routeLyr.add(routeResult);
      
      // the speed of the object becomes low with maximum segment of length
      var pl = geometryEngine.densify(routeResult.geometry, 0.1, "meters");
        // register the external renderer
        const myExternalRenderer = new skeletonRenderer(view, pl);
        externalRenderers.add(view, myExternalRenderer);

    }
    // Disable lighting based on the current camera position.
    // We want to display the lighting according to the current time of day.
    //view.environment.lighting.cameraTrackingEnabled = false;

    // Create our custom external renderer
   //////////////////////////////////////////////////////////////////////////////////////
    //https://github.nicogis.it/externalRendererSkeleton/
    var skeletonRenderer = Accessor.createSubclass({ // if '|| {}' is not added beside null,
    // you will receive the following error 'Cannot destructure property of xx of 'null' as it is null'
        view: null,
        //pl: null,
        renderer: null,     // three.js renderer
        camera: null,       // three.js camera
        scene: null,        // three.js scene
        vertexIdx: 0,
        ambient: null,      // three.js ambient light source
        sun: null,          // three.js sun light source
        mixer: null,
        mixer2: null,
        clock: null,
        clips: null,
        animate: null,
        light: null,
        iss: null, 
        iss2: null,                                                   // ISS model
        issScale: 0.7,                                     // scale for the iss model
        issScale2: 10,
        path: null,
      count: null,
      up: null,
      timeDelta: null,
      markerMaterial: null,    // material for the markers left by the ISS
      markerGeometry: null,    // geometry for the markers left by the ISS
      issMaterial: new THREE.MeshLambertMaterial({ color: 0x2194ce, transparent: true, opacity: 0.5 }), 

        cameraPositionInitialized: false, // we focus the view on the ISS once we receive our first data point
        positionHistory: [],
      
        constructor: function (view, pl) {
          this.view = view;
            this.path = pl.paths[0]; //pl.paths[0];
        },
        /**
         * Setup function, called once by the ArcGIS JS API.
         */
        setup: function (context) {

            // initialize the three.js renderer
            /////////////////////////////////////////////////////////////////////////////////////
            this.renderer = new THREE.WebGLRenderer({
                context: context.gl,
                premultipliedAlpha: false
            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(context.camera.fullWidth, context.camera.fullHeight);
            this.renderer.setViewport(0, 0, view.width, view.height);

            // prevent three.js from clearing the buffers provided by the ArcGIS JS API.
            this.renderer.autoClearDepth = false;
            this.renderer.autoClearStencil = false;
            this.renderer.autoClearColor = false;

            // The ArcGIS JS API renders to custom offscreen buffers, and not to the default framebuffers.
            // We have to inject this bit of code into the three.js runtime in order for it to bind those
            // buffers instead of the default ones.
            var originalSetRenderTarget = this.renderer.setRenderTarget.bind(this.renderer);
            this.renderer.setRenderTarget = function (target) {
                originalSetRenderTarget(target);
                if (target == null) {
                    context.bindRenderTarget();
                }
            }

            // setup the three.js scene
            //////////////////////////////////////////////////////////////////////////////////////         
            this.scene = new THREE.Scene();

            // setup the camera
            this.camera = new THREE.PerspectiveCamera();

            // setup scene lighting
            this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(this.ambient);
            this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
            this.scene.add(this.sun);

          // setup markers
            this.markerGeometry = new THREE.SphereBufferGeometry(12*1000, 16, 16);
            this.markerMaterial = new THREE.MeshBasicMaterial({ color: 0xe03110, transparent: true, opacity: 0.5});

            this.clock = new THREE.Clock();

            var issMeshUrl = "https://EijiGorilla.github.io/WebApp/ArcGIS_API_for_JavaScript/Sample/Three_js/3d-model-gltf/assets/TBM2.glb"; 
            var loaderGLTF = new THREE.GLTFLoader(); // check this: https://qgenhate.hatenablog.com/ [object not an instance of THREE.Object3D]
            let example = new THREE.Object3D();

            loaderGLTF.load(issMeshUrl,
            function(gltf) {
                console.log("ISS mesh loaded.");
               
                example = gltf.scene;
                this.iss = example;

                // apply ISS material to all nodes in the geometry
                /*
                this.iss.traverse( function ( child ) {
                    if ( child instanceof THREE.Mesh ) {
                        child.material = this.issMaterial;
                    }
                }.bind(this));
                */

                // set the specified scale for the model
                this.iss.scale.set(this.issScale, this.issScale, this.issScale);
                
                // add the model
                this.scene.add(this.iss); // original: this.iss
                console.log("ISS mesh added.");

                // Mixer for animation
                this.mixer = new THREE.AnimationMixer(this.iss);
                this.mixer.clipAction(gltf.animations[0]).play();
            
            }.bind(this), undefined, function(error) {
                console.error("Error loading ISS mesh. ", error);
            });

            this.light = new THREE.DirectionalLight(0xffffff, 1);
            this.light.position.set(0, 1, 0);
            this.scene.add(this.light);
          
          // rotation 
              this.up = new THREE.Vector3(0, 0, 1); // used with lookAt: look at the next point at x-axis
              this.axis = new THREE.Vector3();
              this.n  = new THREE.Vector3( ); // normal,
              this.b  = new THREE.Vector3( ); // binormal
              this.M3 = new THREE.Matrix3( );
              this.M4 = new THREE.Matrix4( );
              this.pp = new THREE.Vector3( );
              this.quaternion = new THREE.Quaternion();

            // cleanup after ourselfs
            context.resetWebGLState();
        },
        render: function (context) {

            // update camera parameters
            ///////////////////////////////////////////////////////////////////////////////////
            var cam = context.camera;

            this.camera.position.set(cam.eye[0], cam.eye[1], cam.eye[2]);
            this.camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
            this.camera.lookAt(new THREE.Vector3(cam.center[0], cam.center[1], cam.center[2]));

            // Projection matrix can be copied directly
            this.camera.projectionMatrix.fromArray(cam.projectionMatrix);
          
            if (this.iss) {
                     
                // Add this.mixer.update first; otherwise, the object will not be animated.s
                if (this.mixer) {
                    var scale = 0.0001; //this.gui.getTimeScale();
                    var delta = this.clock.getDelta();

                  this.mixer.update(delta);         
                }

                    if (this.path.length == (this.vertexIdx + 1))
                {
                    this.vertexIdx = 0;
                }
              
                var p = this.path[this.vertexIdx]; // vertexIdx = 0
              var p1 = this.path[this.vertexIdx + 1];
              
            
              // Define Z:
              // It is important that the same Z values are set for both current (pt) and next points (pt1)
              // Otherwise, the object will be tilted.
              const changeZ = 0;
              const offset = 0;
              const offsetZ = 0.5;

                var pt = new Point({
                    x: p[0] + offset, // longitude
                    y: p[1], // latitude
                    z: p[2] + offsetZ
                });

                pt.spatialReference = SpatialReference.WebMercator;

                //z = offsetZ; // view.basemapTerrain.getElevation(p);

                pos = [pt.x, pt.y, pt.z];

                this.vertexIdx++;

                if (this.path.length == (this.vertexIdx)) {
                    this.vertexIdx--;
                }
              
                var transform = new THREE.Matrix4();
                transform.fromArray(externalRenderers.renderCoordinateTransformAt(view, pos, SpatialReference.WebMercator, new Array(16)));

               this.iss.position.set(transform.elements[12], transform.elements[13], transform.elements[14]);
              
                this.count ++;
                if (this.count === 1) {
                  console.log(transform.elements[12], transform.elements[13], transform.elements[14]);
                }

                var p0;
                var p1;

                if ((this.path.length - 1) == (this.vertexIdx))
                {
                    p0 = this.path[--this.vertexIdx];
                    p1 = this.path[this.vertexIdx];
                }
                else
                {
                    p0 = this.path[this.vertexIdx];
                    p1 = this.path[++this.vertexIdx];
                }
                            
              var rotation = new THREE.Matrix4();
              
                var pt1 = new Point({
                    x: p1[0] + offset, // longitude
                    y: p1[1], // latitude
                    z: p1[2] + offsetZ
                });
              posR = [pt1.x, pt1.y, pt1.z];
              rotation.fromArray(externalRenderers.renderCoordinateTransformAt(view, posR, SpatialReference.WebMercator, new Array(16)));
              // https://answers.unity.com/questions/36255/lookat-to-only-rotate-on-y-axis-how.html
              // how to use '.up' with lookAt?
              //geometry.applyMatrix4( new THREE.Matrix4().makeRotationX( Math.PI / 2 ) );
              this.iss.up = this.up;
              
              this.iss.lookAt(rotation.elements[12], rotation.elements[13], rotation.elements[14]);
            }


            // update lighting
            /////////////////////////////////////////////////////////////////////////////////////////////////////
            //view.environment.lighting.date = Date.now();

            var l = context.sunLight;
            this.sun.position.set(
              l.direction[0],
              l.direction[1],
              l.direction[2]
            );
            this.sun.intensity = l.diffuse.intensity;
            this.sun.color = new THREE.Color(l.diffuse.color[0], l.diffuse.color[1], l.diffuse.color[2]);

            this.ambient.intensity = l.ambient.intensity;
            this.ambient.color = new THREE.Color(l.ambient.color[0], l.ambient.color[1], l.ambient.color[2]);

            // draw the scene
            /////////////////////////////////////////////////////////////////////////////////////////////////////
            this.renderer.resetState();
            context.bindRenderTarget();
            this.renderer.render(this.scene, this.camera);
            externalRenderers.requestRender(view);

            // cleanup
            context.resetWebGLState();
        },
    })
    externalRenderers.add(view, skeletonRenderer);
    // End of externalRenderers


    //
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
    const chartTbmDiv = document.getElementById("chartTbmDiv");
  
  
  
  
  //*******************************//
  // Label Class Property Settings //
  //*******************************//
  
  //********* Define LabelingInfo *************//
  // Station labels
  var stationLabelClass = new LabelClass({
      symbol: {
        type: "label-3d",// autocasts as new LabelSymbol3D()
        symbolLayers: [
          {
            type: "text", // autocasts as new TextSymbol3DLayer()
            material: {
              color: "white"
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
      }
    });
  
  // TBM spot label class using transit layer
  
  var tbmSpotLabel2 = new LabelClass({
  symbol: {
  type: "label-3d", // autocast as new LabelSymbol3D()
  symbolLayers: [
  {
    type: "text",
    material: {
      color: "#E83618"
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
  maxWorldLength: 500,
  minWorldLength: 10
  },
  callout: {
  type: "line",
  size: 3,
  color: "#E83618",
  border: {
    color: "#E83618"
  }
  }
  },
  labelPlacement: "above-center",
  labelExpressionInfo: {
  expression: "IIF($feature.tbmSpot == 1, $feature.line, '')"
  //'DefaultValue($feature.GeoTechName, "no data")'
  //"IIF($feature.Score >= 13, '', '')"
  //value: "{Type}"
  },
  maxScale: 200,
  minScale: 1000,
  });
  
  
  
  // monitor buildings Label
    var monitorBuillabelClass = new LabelClass({
      symbol: {
        type: "label-3d", // autocast as new LabelSymbol3D()
        symbolLayers: [
          {
            type: "text",
            material: {
              color: [137, 205, 102]
            },
            size: 9,
            color: "black",
            haloColor: "black",
            haloSize: 1,
            font: {
              family: "Ubuntu Mono",
              weight: "normal"
            },
          }
        ],
        verticalOffset: {
          screenLength: 80,
          maxWorldLength: 500,
          minWorldLength: 30
        },
        callout: {
          type: "line",
          size: 0.5,
          color: [0, 0, 0],
          border: {
            color: [255, 255, 255, 0.7]
          }
        }
      },
      labelPlacement: "above-center",
      labelExpressionInfo: {
        expression: "IIF($feature.Type == 'Hospital' || $feature.Type == 'School' || $feature.Type == 'Government', $feature.Type, '')"
        //'DefaultValue($feature.GeoTechName, "no data")'
        //"IIF($feature.Score >= 13, '', '')"
        //value: "{Type}"
      }
    });
  
  
  //*****************************//
  //      Renderer Settings      //
  //*****************************//        
    // convenience function to retrieve the WebStyleSymbols based on their name
    function stationsSymbol(name) {
      return {
        type: "web-style", // autocasts as new WebStyleSymbol()
        name: name,
        styleName: "EsriIconsStyle"//EsriRealisticTransportationStyle, EsriIconsStyle
      };
    }
  
    function tbmspotSymbol(name) { // TBM Spot 
      return {
        type: "web-style",
        name: name,
        styleName: "EsriRealisticTransportationStyle"
      };
    }
  
  // Statin Renderer
    var stationsRenderer = {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      field: "Name",
      defaultSymbol: stationsSymbol("Train"),//Backhoe, Train
    };
   
  // Geotechnical information Renderer:-------------------
    ///-- Profile Options for rendering geotechnical informatino (polyline Z)
    const options_g = {
      profile: "circle",
      cap: "none",
      join: "miter",
      width: 6,
      height: 6,
      color: [200, 200, 200],
      profileRotation: "all"
    };
  
    ///-- Color
    const colors_g = {
      'Sandy Sand': [0, 112, 255, 1],
      'Silty Sand': [230, 230, 0, 1],
      'Rock Type': [197, 0, 255, 1]
    };

  
    /* The colors used for the each transit line */
    const colors = {
      1: [225, 225, 225, 0.1], // To be Constructed (white)
      2: [130, 130, 130, 0.5], // Under Construction
      3: [255, 0, 0, 0.8], // Delayed
      4: [0, 112, 255, 0.8], // Completed
    };
  
  // Bridge: -----------
  const colorsBridge = {
      'Minor': [112, 168, 0, 0.4], // To be Constructed (white)
      'Moderate': [230, 230, 0, 0.4], // Excavation (Dark brown)
      'Severe': [230, 0, 0, 0.7], // Rebar (Yellow)
    };
  
  // Monitored Buildings:-----
  /*****************************************************************
     * Define symbols for each unique type of building. One each for
     * Government, Septic Tank, Ordinary House, Gas Station, Hospital, School, Pedestrian.
     * Good, Fair, and Dilapidated
     *****************************************************************/
  
     var goodSym = {
      type: "polygon-3d", // autocasts as new PolygonSymbol3D()
      symbolLayers: [
        {
          type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
          material: {
            color: [112, 168, 0, 0.4]
          },
          edges: {
            type: "solid",
            color: "#4E4E4E",
            size: 1.0
          }
        }
      ]
    };
  
    var fairSym = {
      type: "polygon-3d", // autocasts as new PolygonSymbol3D()
      symbolLayers: [
        {
          type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
          material: {
            color: [230, 230, 0, 0.4]
          },
          edges: {
            type: "solid",
            color: "#4E4E4E",
            size: 1.0
          }
        }
      ]
    };
  
    var dilapSym = {
      type: "polygon-3d", // autocasts as new PolygonSymbol3D()
      symbolLayers: [
        {
          type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
          material: {
            color: [230, 0, 0, 0.7]
          },
          edges: {
            type: "solid",
            color: "#4E4E4E",
            size: 1.0
          }
        }
      ]
    };
  
  
  var obstructionRenderer = {
      type: "unique-value", // autocasts as new UniqueValueRenderer()
      defaultSymbol: {
        type: "polygon-3d", // autocasts as new PolygonSymbol3D()
        symbolLayers: [
          {
            type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
            material: {
              color: "#E1E1E1"
            },
            edges: {
              type: "solid",
              color: "#4E4E4E",
              size: 1.0
            }
          }
        ]
      },
      defaultLabel: "Other",
      field: "Rating",
      legendOptions: {
        title: "Rating for Defects"
        },
      uniqueValueInfos: [
        {
          value: "Good",
          symbol: goodSym,
          label: "Good"
        },
        {
          value: "Fair",
          symbol: fairSym,
          label: "Fair"
        },
        {
          value: "Dilapidated",
          symbol: dilapSym,
          label: "Dilapidated"
        }          
      ],
      visualVariables: [
        {
          type: "size",
          field: "Height",
          valueUnit: "meters" // Converts and extrudes all data values in feet
        }
      ]
    };
  
  
  //*******************************//
  // Import Layers                 //
  //*******************************//
  // Land and Structure
  // Lot Layer Renderer ---------
  let defaultLotSymbolBoundary = {
      type: "simple-fill",
      color: [0, 0, 0, 0],
      style: "solid",
      outline: {
        style: "short-dash",
        color: [215, 215, 158],
        width: 1.5
      }
    };
  
  let lotDefaultSymbol = {
      type: "simple-fill",  // autocasts as new SimpleFillSymbol()
      color: [0,0,0,0],
      style: "solid",
      outline: {  // autocasts as new SimpleLineSymbol()
        color: [110, 110, 110],
        width: 0.7
      }
    };
    
    function colorLotReqs(){
      return {
        1: [112,173,71, 0.5],
        2: [0,112,255, 0.5],
        3: [255,255,0, 0.5],
        4: [255,170,0, 0.5],
        5: [255,0,0, 0.5],
        6: [0,115,76, 0.5]
      }
    }
    
    
    let lotLayerRenderer = {
      type: "unique-value",
      //field: "StatusLA",
      defaultSymbol: lotDefaultSymbol,  // autocasts as new SimpleFillSymbol()
      valueExpression: "When($feature.StatusNVS3 == 1, '1',$feature.StatusNVS3 == 2, '2', $feature.StatusNVS3 == 3, '3', \
                             $feature.StatusNVS3 == 4, '4', $feature.StatusNVS3 == 5, '5', \
                             $feature.StatusNVS3 == 6, '6', $feature.StatusNVS3)",
      uniqueValueInfos: [
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
      },
      {
        // All features with value of "North" will be blue
        value: "6",
        label: "with WOP Fully Turned-over",
        symbol: {
          type: "simple-fill",  // autocasts as new SimpleFillSymbol()
          color: colorLotReqs()[6],
        }
      }
      /*
      {
        // All features with value of "North" will be blue
        value: "others",
        label: "Others",
        symbol: {
          type: "simple-fill",  // autocasts as new SimpleFillSymbol()
          color: colorLotReqs()[6],
          outline: {
            width: 2,
            color: "grey"
          }
        }
      }
      */
      ]
    }
    
     const LOT_LABEL_CLASS = {
      // autocasts as new LabelClass()
      symbol: {
        type: "text",  // autocasts as new TextSymbol()
        color: "black",
        font: {  // autocast as new Font()
          family: "Gill Sans",
          size: 8
        }
      },
      labelPlacement: "above-center",
      labelExpressionInfo: {
        expression: "$feature.CN"
      }
    };
  
    var lotLayer = new FeatureLayer({
      portalItem: {
        id: "032432d931624de9bf5ff03f1f9d7016",
        portal: {
          url: "https://gis.railway-sector.com/portal"
        }
      },
      layerId: 1,
      outFields: ["*"],
      title: "Status of Land Acquisition",
            
    //labelsVisible: false,
      labelingInfo: [LOT_LABEL_CLASS],
      renderer: lotLayerRenderer,
      popupTemplate: {
        title: "<p>{Id}</p>",
        lastEditInfoEnabled: false,
        returnGeometry: true,
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "OWNER",
                label: "Land Owner"
              },
              {
                fieldName: "Station1"
              },
              {
                fieldName: "StatusNVS3",
                label: "<p>Status of Land Acquisition</p>"
              }
            ]
          }
        ]
      }
    });
    map.add(lotLayer, 0);
    
    
  // Construction boundary
  // Construction boundary
  let ConstructionBoundaryFill = {
            type: "unique-value",
            valueExpression: "When($feature.MappingBoundary == 1, 'Boundary',$feature.MappingBoundary)",
            uniqueValueInfos: [
                {
                    value: "Boundary",
                    symbol: {
                        type: "simple-fill",
                        color: [0, 0, 0,0],
                        outline: {
                            width: 2.5,
                            color: [220,220,220],
                            style: "short-dash"
                        }
                    }
                }
  
            ]
  };
  
  
  // Construction Boundary
  var constBoundary = new FeatureLayer({
    portalItem: {
      id: "b0cf28b499a54de7b085725bca08deee",
      portal: {
        url: "https://gis.railway-sector.com/portal"
      }
  },
  layerId: 4,
  outFields: ["*"],
  renderer: ConstructionBoundaryFill,
  definitionExpression: "MappingBoundary = 1",
  title: "Construction Boundary",
  elevationInfo: {
  mode: "on-the-ground",
  },
  popupEnabled: false
  });
  constBoundary.listMode = "hide";
  map.add(constBoundary);
  
  // Station Layer:-------------------
  var stationLayer = new SceneLayer({
      portalItem: {
        id: "6d8d606fee5841ea80fa133adbb028fc",
        portal: {
          url: "https://gis.railway-sector.com/portal"
        },
      },
         labelingInfo: [stationLabelClass],
         renderer: stationsRenderer,
         definitionExpression: "sector = 'MMSP'",
         popupEnabled: false,
         elevationInfo: {
             // this elevation mode will place points on top of
             // buildings or other SceneLayer 3D objects
             mode: "relative-to-ground"
             },
          //screenSizePerspectiveEnabled: false, // gives constant size regardless of zoom
    });
    stationLayer.listMode = "hide";
    map.add(stationLayer);
  
  // Geotechnical information:-------------------
  var geotech = new FeatureLayer({
    portalItem: {
        id: "30cdb9f9775146308a05dd17cfbfa87a",
        portal: {
          url: "https://gis.railway-sector.com/portal"
        }
      },
      layerId: 3,
      elevationInfo: {
      mode: "absolute-height", //absolute-height
      offset: 0,
    },
    hasZ: true,
     //renderer: roundTubeSymbol,
     title: "Soil Profile",
     //definitionExpression: "sens='Aller'",
     outFields: ["*"]
    });
    map.add(geotech);
  
    function renderGeotechLayer() {
      const renderer = new UniqueValueRenderer({
        field: "Class"
      });
  
      for (let property in colors_g) {
        if (colors_g.hasOwnProperty(property)) {
          renderer.addUniqueValueInfo({
            value: property,
            symbol: {
              type: "line-3d",
              symbolLayers: [
                {
                  type: "path",
                  profile: options_g.profile,
                  material: {
                    color: colors_g[property]
                  },
                  width: options_g.width,
                  height: options_g.height,
                  join: options_g.join,
                  cap: options_g.cap,
                  anchor: "bottom",
                  profileRotation: options_g.profileRotation
                }
              ]
            }
          });
        }
      }
  
      geotech.renderer = renderer;
    }
    renderGeotechLayer();
  
  // NATM
  
  const colors_NATM = {
      1: [225, 225, 225, 0.1], // To be Constructed (white)
      2: [130, 130, 130, 0.5], // Under Construction
      3: [255, 0, 0, 0.8], // Delayed
      4: [0, 112, 255, 0.8], // Completed
    };
  
  var natmLayer = new SceneLayer({
    portalItem: {
      id: "d8a87f380b69495a9906fb7035ca84a9",
      portal: {
    url: "https://gis.railway-sector.com/portal"
  }
    },
    elevationInfo: {
      mode: "absolute-height",//"on-the-ground", relative-to-ground, absolute-height
      offset: 0
    },
  
     //renderer: roundTubeSymbol,
     title: "NATM",
     //definitionExpression: "sens='Aller'",
     outFields: ["*"]
    });
    map.add(natmLayer);
  
  // Symbology for natmLayer
  function renderNATMLayer() {
  // Obtain unique values from Status1
  const renderer = new UniqueValueRenderer({
  field: "status"
  });
  
  for (let property in colors_NATM) {
  if (colors_NATM.hasOwnProperty(property)) {
  renderer.addUniqueValueInfo({
    value: property,
    symbol: {
      type: "mesh-3d",
      symbolLayers: [
        {
          type: "fill",
          material: {
            color: colors_NATM[property],
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
  natmLayer.renderer = renderer;
  }
  renderNATMLayer();
  
  
  // TBM segmented line:-------------------
    // TBM Alignment:-------------------
const options = {
    profile: "circle",
    cap: "butt", // butt
    join: "miter",
    width: 5,
    height: 5,
    color: [200, 200, 200, 0.3],
    profileRotation: "all"
};

  var tbmTunnelLayer = new FeatureLayer({
    portalItem: {
      id: "af9539f5e41e4bd8b694973972e3faf4",
      portal: {
    url: "https://gis.railway-sector.com/portal"
  }
    },
    elevationInfo: {
      mode: "absolute-height",//"on-the-ground", relative-to-ground, absolute-height
      offset: -2
    },
    hasZ: true,
    layerId: 2,
    labelingInfo: [tbmSpotLabel2],
     title: "TBM Segment",
     outFields: ["*"]
    });
    map.add(tbmTunnelLayer);
  
    function renderTransitLayer() {
      const renderer = new UniqueValueRenderer({
        field: "status"
      });
  
      for (let property in colors) {
        if (colors.hasOwnProperty(property)) {
          renderer.addUniqueValueInfo({
            value: property,
            symbol: {
              type: "line-3d",
              symbolLayers: [
                {
                  type: "path",
                  profile: options.profile,
                  material: {
                    color: colors[property]
                  },
                  width: options.width,
                  height: options.height,
                  join: options.join,
                  cap: options.cap,
                  anchor: "bottom",
                  profileRotation: options.profileRotation
                }
              ]
            }
          });
        }
      }
  
      tbmTunnelLayer.renderer = renderer;
    }
  
    renderTransitLayer();
  
  // River Layer:-------------------
    const riverLayer = new FeatureLayer({
      portalItem: {
        id: "5ebdee597f3540d1baed240034532883",
        portal: {
          url: "https://gis.railway-sector.com/portal"
        },
      },
      layerId: 1,
    elevationInfo: {
      mode: "on-the-ground",
      offset: 0
    },
    renderer: {
        type: "simple",
        symbol: {
            type: "polygon-3d",
            symbolLayers: [
                {
                    type: "water",
                    waveDirection: 260,
                    color: "#005B66", //#005B66, #25427c
                    waveStrength: "moderate",
                    waterbodySize: "medium"
                }
            ]
        }
    }
    });
    riverLayer.listMode = "hide";
    map.add(riverLayer, 0);
  
  // Station structure: reference only
  const colors3D = {
      1: [225, 225, 225, 0.1], // To be Constructed (white)
      2: [225, 225, 225, 0.1], // Under Construction
      3: [225, 225, 225, 0.1], // Delayed
      4: [225, 225, 225, 0.1], // Completed
    };
  
  var stationStructure = new SceneLayer({ //structureLayer
      portalItem: {
        id: "09f1e6d86cf34567bebcd22afcad8b4b",
        portal: {
          url: "https://gis.railway-sector.com/portal"
        }
      },
      definitionExpression: "Type = 1",
      popupEnabled: false,
        elevationInfo: {
            mode: "absolute-height",
            offset: 0
        },
        title: "Station Structure",
        outFields: ["*"]
        // when filter using date, example below. use this format
        //definitionExpression: "EndDate = date'2020-6-3'"
    });
    //stationStructure.listMode = "hide";
    map.add(stationStructure, 1);
  
    function renderStructureLayer() {
      const renderer = new UniqueValueRenderer({
        field: "Status"
      });
  
      for (let property in colors3D) {
        if (colors3D.hasOwnProperty(property)) {
          renderer.addUniqueValueInfo({
            value: property,
            symbol: {
              type: "mesh-3d",
              symbolLayers: [
                {
                  type: "fill",
                  material: {
                    color: colors3D[property],
                    colorMixMode: "replace"
                  },
                  edges: {
                    type: "solid", // autocasts as new SolidEdges3D()
                    color: [225, 225, 225, 0.8]
                    }
                }
              ]
             }
          });
        }
      }
  
      stationStructure.renderer = renderer;
    }
  
    renderStructureLayer();

    // TBM Shaft
    var tbmShaft = new SceneLayer({ //structureLayer
      portalItem: {
        id: "0bba3bc8c087412b89a3d72a47a1c6aa",
        portal: {
          url: "https://gis.railway-sector.com/portal"
        }
      },
      popupEnabled: false,
        elevationInfo: {
            mode: "absolute-height",
            offset: 0
        },
        title: "TBM Shaft"
        // when filter using date, example below. use this format
        //definitionExpression: "EndDate = date'2020-6-3'"
    });
    map.add(tbmShaft, 1);
  
    function renderTbmShaftLayer() {
      const renderer = new UniqueValueRenderer({
        field: "Status"
      });
  
      for (let property in colors3D) {
        if (colors3D.hasOwnProperty(property)) {
          renderer.addUniqueValueInfo({
            value: property,
            symbol: {
              type: "mesh-3d",
              symbolLayers: [
                {
                  type: "fill",
                  material: {
                    color: colors3D[property],
                    colorMixMode: "replace"
                  },
                  edges: {
                    type: "solid", // autocasts as new SolidEdges3D()
                    color: [225, 225, 225, 0.8], //225, 225, 225, 0.3
                    size: 1
                    }
                }
              ]
             }
          });
        }
      }
  
      tbmShaft.renderer = renderer;
    }
  
    renderTbmShaftLayer();
  
  
  // Bridge Layer:-------------------        
    var bridgeLayer = new SceneLayer({
      portalItem: {
        id: "33801e0fd57a420e8f2dfc814b4fbf96", //8d867de4d0034e08afed516372f8dd86
        portal: {
            url: "https://gis.railway-sector.com/portal"
        },
      },
      /*
      portalItem: {
      id: "e01d0321d29f4239a383be1ba056d2aa",  
      portal: {
        url: "https://mmspgc-gis.mmspgc.local/portal"
      }
      },
      */
      elevationInfo: {
        mode: "absolute-height",
        offset: 0
      },
      title: "Monitoring Bridge",
      outFields: ["*"],
    });
    map.add(bridgeLayer, 0);
  
    function renderBridgeLayer() {
      const renderer = new UniqueValueRenderer({
        field: "Rating",
        legendOptions: {
        title: "Rating for Defects"
        }
      });
  
      for (let property in colorsBridge) {
        if (colorsBridge.hasOwnProperty(property)) {
          renderer.addUniqueValueInfo({
            value: property,
            symbol: {
              type: "mesh-3d",
              symbolLayers: [
                {
                  type: "fill",
                  material: {
                    color: colorsBridge[property],
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
  
      bridgeLayer.renderer = renderer;
    }
  
    renderBridgeLayer();
  
  
  // Monitored Buildings:-----------
    /*****************************************************************
     * Set each unique value directly in the renderer's constructor.
     * At least one field must be used (in this case the "DESCLU" field).
     * The label property of each unique value will be used to indicate
     * the field value and symbol in the legend.
     *
     * The size visual variable sets the height of each building as it
     * exists in the real world according to the "ELEVATION" field.
     *****************************************************************/
  var obstructionLayer = new FeatureLayer({
  portalItem: {
        id: "5ebdee597f3540d1baed240034532883",
        portal: {
          url: "https://gis.railway-sector.com/portal"
        },
      },
      layerId: 2,
      elevationInfo: {
        mode: "on-the-ground",
        offset: 0
      },
      title: "Monitoring Structures",
      labelingInfo: [monitorBuillabelClass],
      renderer: obstructionRenderer,
      popupTemplate: {
        // autocasts as new PopupTemplate()
        title: "{Rating}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "Type",
                label: "Type of Building"
              },
              {
                fieldName: "Score",
                label: "Score"
              },
              {
                fieldName: "Rating",
                label: "Rating"
              }
            ]
          }
        ]
      },
      outFields: ["*"],
      definitionExpression: "Remarks IS NULL" // show only buildings with height, 
    });
    map.add(obstructionLayer, 0);
  
  // Dilapidation survey Extent line
  var dilapSurveyExtent = new FeatureLayer({
  portalItem: {
  id: "30cdb9f9775146308a05dd17cfbfa87a",
  portal: {
    url: "https://gis.railway-sector.com/portal"
  },
  },
  layerId: 2,
    /*
      portalItem: {
      id: "8f53ab5eed324f5d9272a09b243198a6",
      portal: {
        url: "https://mmspgc-gis.mmspgc.local/portal"
      }
      },
      */
      elevationInfo: {
        mode: "on-the-ground",
        offset: 0
      },
      title: "Survey Extent Line"
    });
    map.add(dilapSurveyExtent, 0);
  
  // TBM Alignment reference line:--------------
  let defaultTBMAlign = {
            type: "simple-line",
            color: [211, 211, 211, 0.5],
            style: "solid",
            width: 0.5
  };
  
  let tbmAlignRenderer = {
  type: "unique-value",
  field: "LAYER",
  defaultSymbol: defaultTBMAlign
  };
  
  // Add graphics Layer
  var graphicsLayer = new GraphicsLayer({
    elevationInfo: {
      mode: "relative-to-ground"
    },
    hasZ: true,
    screenSizePerspectiveEnabled: true,
    outFields: ["*"],
    title: "TBM Spot"
  });
  
  map.add(graphicsLayer);
  //*******************************//
  //      Progress Chart           //
  //*******************************//
  //const totalProgressDiv = document.getElementById("totalProgressDiv");
  const segmentedDateDiv = document.getElementById("segmentedDateDiv");
  
  // Find current position of TBM
  // The current position refers to the spot of minimum segment No.
  
  var query = tbmTunnelLayer.createQuery();
  query.returnGeometry = true;
  query.where = "tbmSpot = 1"; // to be constructed
  query.groupByFieldsForStatistics = ["line"];
  
  tbmTunnelLayer.queryFeatures(query).then(function(response) {
  const stats = response.features;   
  
  stats.forEach((result, index) => {
    const attributes = result.attributes;
    const lineType = attributes.line;
    const segmentNo = attributes.segmentno;
    const vertex = result.geometry.paths[0];
    
    const long = (vertex[0][0] + vertex[1][0]) / 2;
    const lat = (vertex[0][1] + vertex[1][1]) / 2;
    // longitude: vertex[0][0]
    // latitude: vertex[0][1]
  
        view.graphics.add({
            geometry: {
                spatialReference: spatialReference,
                type: "point",
                x: long,
                y: lat,
                z: 15
            },
            symbol: {
            type: "point-3d",
            symbolLayers: [
                {
                    type: "icon",
                    resource: {
                      href: "https://EijiGorilla.github.io/Symbols/TBM_LOGO2.png"
                    },
                    size: 30
                    //resource: {primitive: "circle"},
                    //material: {color: "green"}
                }
            ],
            verticalOffset: {
                screenLength: 100,
                maxWorldLength: 500,
                minWorldLength: 40
            },
            callout: {
                type: "line",
                size: 1.5,
                color: "#E83618",
                border: {
                    color: "#E83618"
                }
            },
            maxScale: 1000,
            minScale: 25000000
        }
        });
  
  
  });
  
  });
  
  /////////////////////////////////////
  
  
  
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
  
  var highlightSelect;
  

 
  // Create a Bar chart to calculate % completion for each viaduct sample
  am4core.ready(function() {
  am4core.useTheme(am4themes_animated);
  tbmTunnelLayer.definitionExpression = "Package = 'CP101'";
    // Default
    function defaultRender(){
      
      tbmTunnelLayer.visible = true;
      natmLayer.visible = false;
  
      tbmChart();
      //natmChart();
      surveyChart();
    }
    defaultRender();

  
  // Add Section and tunnel type to drop-down lists
  /// 1. Section
  function contractPackageValues() {
    var cpArray = [];
    var query = tbmTunnelLayer.createQuery();
    query.outField = ["Package"];
    query.where = "Package IS NOT NULL";
    query.returnGeometry = true;
    return tbmTunnelLayer.queryFeatures(query).then(function(response) {
      var stats = response.features;
      stats.forEach((result, index) => {
      var attributes = result.attributes;
      const SectionValues = attributes.Package;
      cpArray.push(SectionValues);
    });
    return cpArray;
  });
  }
  
  function getUniqueValueSection(values) {
  var uniqueValues = [];
  values.forEach(function(item, i) {
  if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) && item !== "") {
    uniqueValues.push(item);
  }
  });
  return uniqueValues;
  }
  
  function addToSelectSection(values) {
  values.sort();
  //values.unshift('None');
  values.forEach(function(value) {
  var option = document.createElement("option");
  option.text = value;
  cpSelect.add(option);
  });
  }
  function cpListQuery(){
    contractPackageValues()
  .then(getUniqueValueSection)
  .then(addToSelectSection)
  }
  cpListQuery();
  
  /// 2. Tunnel Type
  
  function filterForTunnelType(cpValue) {
    if (cpValue === 'CP104') {
      allArray = ['TBM', 'NATM'];
    
    } else {
      allArray = ['TBM'];
    }

    var uniqueValues2 = [];
    allArray.forEach(function(item, i) {
      if ((uniqueValues2.length < 1 || uniqueValues2.indexOf(item) === -1) && item !== "") {
          uniqueValues2.push(item);
      }
    });
  
    tunnelSelect.options.length = 0;
    uniqueValues2.sort();
    uniqueValues2.unshift('None');
    uniqueValues2.forEach(function(value) {
      var option = document.createElement("option");
      option.text = value;
      tunnelSelect.add(option);
    });
    

  }
  
  
  function sectionOnlyExpression(cpValue) {
      tbmTunnelLayer.definitionExpression = "Package = '" + cpValue + "'";
      natmLayer.definitionExpression = "Package = '" + cpValue + "'";
      natmLayer.visible = true;
  }
  
  function sectionTunnelTypeExpression(cpValue, tunnelValue) {
  
    if (cpValue !== 'CP104' && tunnelValue === 'TBM') {
      tbmTunnelLayer.definitionExpression = "Package = '" + cpValue + "'";
      natmLayer.visible = false;
      zoomToLayer(tbmTunnelLayer);

    } else if (cpValue === 'CP104' && tunnelValue === 'NATM') {
      tbmTunnelLayer.visible = false;
      natmLayer.visible = true;
      zoomToLayer(natmLayer);

    } else if (cpValue === 'CP104' && tunnelValue === 'TBM') {
      tbmTunnelLayer.definitionExpression = "Package = '" + cpValue + "'";
      tbmTunnelLayer.visible = true;
      natmLayer.visible = false;
      zoomToLayer(tbmTunnelLayer);
  
    } else if (cpValue !== 'CP104' && tunnelValue === 'None') {
      tbmTunnelLayer.visible = "Package = '" + cpValue + "'";
      natmLayer.visible = false;
      zoomToLayer(tbmTunnelLayer);
  
    } else if (cpValue === 'CP104' && tunnelValue === 'None') {
      tbmTunnelLayer.definitionExpression = "Package = '" + cpValue + "'";
      tbmTunnelLayer.visible = true;
      natmLayer.visible = true;
      zoomToLayer(tbmTunnelLayer);

    }
  }
  
  function filterTbm() {
    var query2 = tbmTunnelLayer.createQuery();
    query2.where = tbmTunnelLayer.definitionExpression; // use filtered municipality. is this correct?
  }
  
  function filterNatm() {
    var query2 = natmLayer.createQuery();
    query2.where = natmLayer.definitionExpression; // use filtered municipality. is this correct?
  }
  
  // Dropdown List
  // When section is changed, tunnel type is reset to 'None'
  const changeSelected = (e) => {
    const $select = document.querySelector('#tunnelSelect');
    $select.value = 'None'
    };
  
  /// 1. Section dropdown list ('PO', 'Remaining')
  cpSelect.addEventListener("change", function(event) {
  var cpValue = event.target.value;
  //headerTitleDiv.innerHTML = sectionType;
  //testFunction(cpValue);

  changeSelected();

  if (cpValue === 'CP104') { // i.e., TBM and NATM
    document.getElementById("chartNatmDiv").style.display = 'block';
    document.getElementById("chartTbmDiv").style.display = 'block';
    filterForTunnelType(cpValue);
    sectionOnlyExpression(cpValue);

    tbmChart();
    natmChart();
    
    filterTbm();
    filterNatm();

  } else { // Only TBM
    document.getElementById("chartTbmDiv").style.display = 'block';
    filterForTunnelType(cpValue);
    sectionOnlyExpression(cpValue);

    tbmChart();
    filterTbm();

  }
  });
  
  
  /// 2. Tunnel Type dropdown list ('TBM', 'NATM')
  tunnelSelect.addEventListener("change", function(event) {
  var tunnelType = event.target.value;
  var cpValue = cpSelect.value;
  
  sectionTunnelTypeExpression(cpValue, tunnelType);
  
  if (tunnelType === 'TBM') {
    zoomToLayer(tbmTunnelLayer);
    tbmChart();
    filterTbm();
    document.getElementById("chartNatmDiv").style.display = 'none';
    document.getElementById("chartTbmDiv").style.display = 'block';

  } else if (tunnelType === 'NATM') {
    zoomToLayer(natmLayer);
    tbmChart();
    natmChart();
    filterNatm();
    document.getElementById("chartNatmDiv").style.display = 'block';
    document.getElementById("chartTbmDiv").style.display = 'none';

  } else {
    tbmChart();
    filterTbm();
    natmChart();
    filterNatm();
    zoomToLayer(tbmTunnelLayer);
    document.getElementById("chartNatmDiv").style.display = 'block';
    document.getElementById("chartTbmDiv").style.display = 'block';
  }
  });
  
  //
  // Bottom Title Color
const BOTTOM_LABEL_COL = am4core.color("#FFA500");
const TOP_TITLE_COL = am4core.color("#FFFFFF");
const LABEL_FILL_COL = am4core.color("#00C3FF");

var axis1TickColor = "#C5C5C5";
const chartPadding = 15;

// Gauge Needle (hand) length
const NEEDLE_LENGTH = am4core.percent(70);
  
  ///////// PIE CHART /////////
  // 1. TBM
 
  function tbmChart() {
    var total_number = {
      onStatisticField: "line",
      outStatisticFieldName: "total_number",
      statisticType: "count"
    }
    
    var total_complete = {
      onStatisticField: "CASE WHEN status = 4 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_complete",
      statisticType: "sum"
    }
    
    var query = tbmTunnelLayer.createQuery();
    query.outStatistics = [total_number, total_complete];
    query.returnGeometry = true;
    
    tbmTunnelLayer.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    
    
    const totalNumber = stats.total_number;
    const handedOver = stats.total_complete;
    const LOT_HANDOVER_PERC = (handedOver/totalNumber)*100;

    // create chart
    var chart = am4core.create("chartTbmDiv", am4charts.GaugeChart);
    chart.hiddenState.properties.opacity = 0;
    chart.innerRadius = am4core.percent(82);
    chart.responsive.enabled = true;

    chart.padding(chartPadding, chartPadding, chartPadding, chartPadding);
    chart.radius = am4core.percent(100); // size of pie chart
    chart.resizable = true;
    //chart.scale = 1;
    
    // Add bottom label
    var label = chart.chartContainer.createChild(am4core.Label);
    label.text = "Segmented";
    label.fontSize = "0.9em";
    label.align = "center";
    label.marginTop = -20;
    label.fill = LABEL_FILL_COL;

    /**
    * Normal axis
    */
    
    var axis = chart.xAxes.push(new am4charts.ValueAxis());
    axis.min = 0;
    axis.max = 100;
    axis.strictMinMax = true;
    axis.renderer.radius = am4core.percent(80);
    axis.renderer.inside = true;
    axis.renderer.line.strokeOpacity = 1;
    axis.renderer.ticks.template.disabled = false
    axis.renderer.ticks.template.strokeOpacity = 1;
    axis.renderer.ticks.template.length = 10;
    axis.renderer.ticks.template.stroke = am4core.color(axis1TickColor);
    axis.renderer.grid.template.disabled = true;
    axis.renderer.labels.template.fontSize = "0.7em";
    axis.renderer.labels.template.radius = 40;
    axis.renderer.labels.template.fill = am4core.color(axis1TickColor);
    axis.renderer.labels.template.adapter.add("text", function(text) {
    return text + "";
    })
    
    /**
    * Axis for ranges
    */
    
    var colorSet = new am4core.ColorSet();
    
    var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
    axis2.min = 0;
    axis2.max = 100;
    axis2.strictMinMax = true;
    axis2.renderer.labels.template.disabled = true;
    axis2.renderer.ticks.template.disabled = true;
    axis2.renderer.grid.template.disabled = true;
    
    var range0 = axis2.axisRanges.create();
    range0.value = 0;
    range0.endValue = LOT_HANDOVER_PERC;
    range0.axisFill.fillOpacity = 1;
    range0.axisFill.fill = LABEL_FILL_COL;
    
    var range1 = axis2.axisRanges.create();
    range1.value = LOT_HANDOVER_PERC;
    range1.endValue = 100;
    range1.axisFill.fillOpacity = 1;
    range1.axisFill.fill = am4core.color("#C5C5C5");
    range1.axisFill.fillOpacity = 0.3;
    
    /**
    * Label
    */       
    var label = chart.radarContainer.createChild(am4core.Label);
    label.isMeasured = false;
    label.fontSize = "2em";
    label.x = am4core.percent(50);
    label.y = am4core.percent(100);
    label.horizontalCenter = "middle";
    label.verticalCenter = "bottom";
    
    const LABEL_TEXT = LOT_HANDOVER_PERC.toFixed(0).toString() + "%";
    label.text = LABEL_TEXT;
    label.fill =  LABEL_FILL_COL;
    
    
    /**
    * Hand
    */
    
    var hand = chart.hands.push(new am4charts.ClockHand());
    hand.axis = axis2;
    hand.innerRadius = NEEDLE_LENGTH;
    hand.startWidth = 10;
    hand.pin.disabled = true;
    hand.value = LOT_HANDOVER_PERC;
    hand.fill = am4core.color("#FFA500");
    hand.fillOpacity = 0.5;
    hand.axis.strokeOpacity = 0.5;
    
    
    // Add chart title
    var title = chart.titles.create();
    title.text = "[bold]TBM Tunnel";
    title.fontSize = "1.1em";
    title.align = "center";
    title.marginBottom = -25;
    title.marginTop = 0;
    title.fill = TOP_TITLE_COL; 
    });
    }

  
  // 2. NATM
  function natmChart() {
    var total_number = {
      onStatisticField: "Layer",
      outStatisticFieldName: "total_number",
      statisticType: "count"
    }
    
    var total_complete = {
      onStatisticField: "CASE WHEN status = 4 THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_complete",
      statisticType: "sum"
    }
    
    var query = natmLayer.createQuery();
    query.outStatistics = [total_number, total_complete];
    query.returnGeometry = true;
    
    natmLayer.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    
    
    const totalNumber = stats.total_number;
    const handedOver = stats.total_complete;
    const LOT_HANDOVER_PERC = (handedOver/totalNumber)*100;

    // create chart
    var chart = am4core.create("chartNatmDiv", am4charts.GaugeChart);
    chart.hiddenState.properties.opacity = 0;
    chart.innerRadius = am4core.percent(82);
    chart.responsive.enabled = true;

    chart.padding(chartPadding, chartPadding, chartPadding, chartPadding);
    chart.radius = am4core.percent(100); // size of pie chart
    chart.resizable = true;
    //chart.scale = 1;
    
    // Add bottom label
    var label = chart.chartContainer.createChild(am4core.Label);
    label.text = "Segmented";
    label.fontSize = "0.9em";
    label.align = "center";
    label.marginTop = -20;
    label.fill = LABEL_FILL_COL;
  
    /**
    * Normal axis
    */
    
    var axis = chart.xAxes.push(new am4charts.ValueAxis());
    axis.min = 0;
    axis.max = 100;
    axis.strictMinMax = true;
    axis.renderer.radius = am4core.percent(80);
    axis.renderer.inside = true;
    axis.renderer.line.strokeOpacity = 1;
    axis.renderer.ticks.template.disabled = false
    axis.renderer.ticks.template.strokeOpacity = 1;
    axis.renderer.ticks.template.length = 10;
    axis.renderer.ticks.template.stroke = am4core.color(axis1TickColor);
    axis.renderer.grid.template.disabled = true;
    axis.renderer.labels.template.fontSize = "0.7em";
    axis.renderer.labels.template.radius = 40;
    axis.renderer.labels.template.fill = am4core.color(axis1TickColor);
    axis.renderer.labels.template.adapter.add("text", function(text) {
    return text + "";
    })
    
    /**
    * Axis for ranges
    */
    
    var colorSet = new am4core.ColorSet();
    
    var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
    axis2.min = 0;
    axis2.max = 100;
    axis2.strictMinMax = true;
    axis2.renderer.labels.template.disabled = true;
    axis2.renderer.ticks.template.disabled = true;
    axis2.renderer.grid.template.disabled = true;
    
    var range0 = axis2.axisRanges.create();
    range0.value = 0;
    range0.endValue = LOT_HANDOVER_PERC;
    range0.axisFill.fillOpacity = 1;
    range0.axisFill.fill = LABEL_FILL_COL;
    
    var range1 = axis2.axisRanges.create();
    range1.value = LOT_HANDOVER_PERC;
    range1.endValue = 100;
    range1.axisFill.fillOpacity = 1;
    range1.axisFill.fill = am4core.color("#C5C5C5");
    range1.axisFill.fillOpacity = 0.3;
    
    /**
    * Label
    */
    var label = chart.radarContainer.createChild(am4core.Label);
    label.isMeasured = false;
    label.fontSize = "2em";
    label.x = am4core.percent(50);
    label.y = am4core.percent(100);
    label.horizontalCenter = "middle";
    label.verticalCenter = "bottom";
    
    const LABEL_TEXT = LOT_HANDOVER_PERC.toFixed(0).toString() + "%";
    label.text = LABEL_TEXT;
    label.fill =  LABEL_FILL_COL;
    
    
    /**
    * Hand
    */
    
    var hand = chart.hands.push(new am4charts.ClockHand());
    hand.axis = axis2;
    hand.innerRadius = NEEDLE_LENGTH;
    hand.startWidth = 10;
    hand.pin.disabled = true;
    hand.value = LOT_HANDOVER_PERC;
    hand.fill = am4core.color("#FFA500");
    hand.fillOpacity = 0.5;
    hand.axis.strokeOpacity = 0.5;
    
    
    // Add chart title
    var title = chart.titles.create();
    title.text = "[bold]NATM Tunnel";
    title.fontSize = "1.2em";
    title.align = "center";
    title.marginBottom = -25;
    title.marginTop = 0;
    title.fill = TOP_TITLE_COL; 
    });
    }

  
  // 3. Dilapidation Survey
  function surveyChart() {
    var total_good = {
      onStatisticField: "CASE WHEN Rating = 'Good' THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_good",
      statisticType: "sum"
    };

    var total_fair = {
      onStatisticField: "CASE WHEN Rating = 'Fair' THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_fair",
      statisticType: "sum"
    };
    
    var total_dilapidated = {
      onStatisticField: "CASE WHEN Rating = 'Dilapidated' THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_dilapidated",
      statisticType: "sum"
    };

    var total_others = {
      onStatisticField: "CASE WHEN Rating IS NULL THEN 1 ELSE 0 END",
      outStatisticFieldName: "total_others",
      statisticType: "sum"
    };

    
    var query = obstructionLayer.createQuery();
    query.outStatistics = [total_good, total_fair, total_dilapidated, total_others];
    query.returnGeometry = true;
    
    obstructionLayer.queryFeatures(query).then(function(response) {
    var stats = response.features[0].attributes;
    
    const goodScore = stats.total_good;
    const fairScore = stats.total_fair;
    const dilapidatedScore = stats.total_dilapidated;
    const otherScore = stats.total_others;
    
    var chart = am4core.create("chartSurveyDiv", am4charts.PieChart);
    
    // Add data
    chart.data = [
    {
      "name": "Good",
      "status": goodScore,
      "color": am4core.color("#70A800")
    },
    {
      "name": "Fair",
      "status": fairScore,
      "color": am4core.color("#E6E600")   
    },
    {
      "name": "Dilapidated",
      "status": dilapidatedScore,
      "color": am4core.color("#E60000") 
    },
    {
      "name": "Others",
      "status": otherScore,
      "color": am4core.color("#FFFFFF")
    },
    ];
    
    // Set inner radius
    chart.innerRadius = am4core.percent(30);
    chart.padding(0, 0, 0, 0);
    
    // Add and configure Series
    function createSlices(field, status){
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = field;
    pieSeries.dataFields.category = status;
    
    pieSeries.slices.template.propertyFields.fill = "color";
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 1;
    pieSeries.slices.template.strokeOpacity = 1;
    pieSeries.slices.template
    // change the cursor on hover to make it apparent the object can be interacted with
    .cursorOverStyle = [
      {
        "property": "cursor",
        "value": "pointer"
      }
    ];
    
    // Hover setting
    pieSeries.tooltip.label.fontSize = 9;
    
    // Pie
    //pieSeries.alignLabels = false;
    //pieSeries.labels.template.bent = false;
    pieSeries.labels.template.disabled = true;
    pieSeries.labels.template.radius = 3;
    pieSeries.labels.template.padding(0,0,0,0);
    pieSeries.labels.template.fontSize = 9;
    pieSeries.labels.template.fill = "#ffffff";
    
    // Ticks (a straight line)
    //pieSeries.ticks.template.disabled = true;
    pieSeries.ticks.template.fill = "#ffff00";
    
    // Create a base filter effect (as if it's not there) for the hover to return to
    var shadow = pieSeries.slices.template.filters.push(new am4core.DropShadowFilter);
    shadow.opacity = 0;
    
    // Chart Title
    let title = chart.titles.create();
    title.text = "DILAPIDATION SURVEY";
    title.fontSize = "1.1em";
    title.fontWeight = "bold";
    title.align = "center";
    title.marginBottom = 0;
    title.marginTop = 15;
    title.fill = TOP_TITLE_COL; 
    
    // Create hover state
    var hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists
    
    // Slightly shift the shadow and make it more prominent on hover
    var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter);
    hoverShadow.opacity = 0.7;
    hoverShadow.blur = 5;
    
    // Add a legend
    const LEGEND_FONT_SIZE = 13;
    chart.legend = new am4charts.Legend();
    chart.legend.valueLabels.template.align = "right"
    chart.legend.valueLabels.template.textAlign = "end";
    
    //chart.legend.position = "bottom";
    chart.legend.labels.template.fontSize = LEGEND_FONT_SIZE;
    chart.legend.labels.template.fill = "#ffffff";
    chart.legend.valueLabels.template.fill = am4core.color("#ffffff"); 
    chart.legend.valueLabels.template.fontSize = LEGEND_FONT_SIZE; 
    chart.legend.itemContainers.template.paddingTop = 4;
    chart.legend.itemContainers.template.paddingBottom = 4;


    pieSeries.legendSettings.valueText = "{value.percent.formatNumber('#.')}% ({value})";
    //pieSeries.legendSettings.labelText = "Series: [bold {color}]{category}[/]";
    
    // Responsive code for chart
    chart.responsive.enabled = true;
    
    chart.responsive.rules.push({
      relevant: function(target) {
        if (target.pixelWidth <= 400) {
          return true;
        }
        return false;
      },
      state: function(target, stateId) {
        if (target instanceof am4charts.PieSeries) {
          var state = target.states.create(stateId);
          
          var labelState = target.labels.template.states.create(stateId);
          labelState.properties.disabled = true;
          
          var tickState = target.ticks.template.states.create(stateId);
          tickState.properties.disabled = true;
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
        return null;
      }
    });
    // Responsive code for chart
    
    /// Define marker symbols properties
    var marker = chart.legend.markers.template.children.getIndex(0);
    var markerTemplate = chart.legend.markers.template;
    marker.cornerRadius(12, 12, 12, 12);
    marker.strokeWidth = 1;
    marker.strokeOpacity = 1;
    marker.stroke = am4core.color("#ccc");
    markerTemplate.width = 14;
    markerTemplate.height = 14;
    
    // This creates initial animation
    //pieSeries.hiddenState.properties.opacity = 1;
    //pieSeries.hiddenState.properties.endAngle = -90;
    //pieSeries.hiddenState.properties.startAngle = -90;
    
    // Click chart and filter, update maps
    pieSeries.slices.template.events.on("hit", filterByChart, this);
    function filterByChart(ev) {
      const SELECTED = ev.target.dataItem.category;
      
      view.when(function() {
        view.whenLayerView(obstructionLayer).then(function (layerView) {
          chartLayerView = layerView;
          //CHART_ELEMENT.style.visibility = "visible";
          
          obstructionLayer.queryFeatures().then(function(results) {
            const RESULT_LENGTH = results.features;
            const ROW_N = RESULT_LENGTH.length;
    
            let objID = [];
            for (var i=0; i < ROW_N; i++) {
                var obj = results.features[i].attributes.OBJECTID;
                objID.push(obj);
            }
    
            var queryExt = new Query({
               objectIds: objID
            });
    
            obstructionLayer.queryExtent(queryExt).then(function(result) {
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
            where: "Rating = '" + SELECTED + "'"
          }
        }); // End of view.whenLayerView
      }); // End of view.when
    } // End of filterByChart
    } // End of createSlices function
    
    createSlices("status", "name");
    
    //return TOTAL_NUMBER_LOTS;
    }); // End of queryFeatures
    } // End of updateChartLot()
    

  
  am4core.options.autoDispose = true;
  }); // end am4core.ready()
  
  //////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////
  // Timeslider
  /*
  const start = new Date(2022, 9, 1);
  const end = new Date(2022, 10, 1);
  
  var timeContainer = document.getElementById("timeContainer");
  
  const timeSlider = new TimeSlider({
  container: "timeContainer",
  mode: "cumulative-from-start",
  layout: "compact",
  fullTimeExtent: {
    start: start,
    end: end
  },
  values: [start],
  stops: {
    interval: {
        value: 1,
        unit: "days"
    },
    timeExtent: { start, end }
  },
  //disabled: true,
  });
  
  timeContainer.style.display = 'none';
  
  // Expand widget for timeSlider
  var timesliderExpand = new Expand({
    view: view,
    content: timeSlider,
    expandIconClass: "esri-icon-time-clock",
    group: "bottom-right"
  });
  view.ui.add(timesliderExpand, {position: "bottom-left"});
  
  // Segment Plan Date needs to be displayed only when timesliderExpand widget is open; otherwise, hidden
  segmentedDateDiv.style.display = 'none';
  reactiveUtils.when(() => timesliderExpand?.expanded === false, () => segmentedDateDiv.style.display = 'none');
  reactiveUtils.when(() => timesliderExpand?.expanded === false, () => graphicsLayer.removeAll());
  reactiveUtils.when(() => timesliderExpand?.expanded === true, () => segmentedDateDiv.style.display = 'block');

  // When segmentedDate slider is closed, tbm tunnel is re-rendered based on the section chosen (PO or Remaining)

// When CP is initially selected as CP101:
  function testFunction(selectedCPValue) {
      reactiveUtils.when(() => timesliderExpand?.expanded === false, () => tbmTunnelLayer.definitionExpression = "Package = '" + selectedCPValue + "'");
      natmLayer.visible = false;

  }

  // Watch update on timeSlider
  timeSlider.watch("timeExtent", function(timeExtent) {
      
    // Reset graphics layer
    graphicsLayer.removeAll();
    
    const dateFilterExpression = "startdate <= date'" + timeExtent.end.getFullYear() + "-" + (timeExtent.end.getMonth()+1) + "-" + (timeExtent.end.getDate()) +"'";
    
    // Run based on selected Section values
    const selectValue = cpSelect.value;
    tbmTunnelLayer.definitionExpression = "Package = '" + selectValue + "'" + " AND " + dateFilterExpression;
    
    const tunnelStart = timeExtent.end.getFullYear() + "-" + (timeExtent.end.getMonth()+1) + "-" + (timeExtent.end.getDate());
    const tunnelStartTitle = "Segmentation Plan Date:";
    segmentedDateDiv.innerHTML = "<pre>" + "<b>" + tunnelStartTitle + "</b>" + "\n" + tunnelStart + "</pre>";
    
    
    var query = tbmTunnelLayer.createQuery();
    //query.where = "startdate <= date'" + timeExtent.end.getFullYear() + "-" + (timeExtent.end.getMonth()+1) + "-" + (timeExtent.end.getDate()) +"'";
    //query.returnGeometry = true;
    //query.outFields = ["OBJECTID"];
    
    tbmTunnelLayer.queryFeatures(query).then(function(response) {
      var stats = response.features;
      stats.forEach((result, index) => {
        const vertex = result.geometry.paths[0];
        const objectId = result.attributes.OBJECTID;
        
        const long = (vertex[0][0] + vertex[1][0]) / 2;
        const lat = (vertex[0][1] + vertex[1][1]) / 2;
        // longitude: vertex[0][0]
        // latitude: vertex[0][1]
      
        var graphic = new Graphic({
          geometry: {
            spatialReference: spatialReference,
            type: "point",
            x: long,
            y: lat,
            z: 0
          },
          type: "simple",
          symbol: {
            type: "picture-marker", // simple-marker
            url: "https://static.arcgis.com/images/Symbols/Firefly/FireflyC8.png",
            width: 12,
            height: 12,
            //outline: { width: 1, color: [255, 255, 255, 1] },
            //size: 8,
            //color: [89, 229, 56, 1]
          }
        });
        graphicsLayer.add(graphic);
      });
      });
  });
*/
    /*
  let timeLayerView;
  view.whenLayerView(tbmTunnelLayer).then(function (layerView) {
  timeLayerView = layerView;


  // WHen page is opened, we need to following to display tunnel for PO section
  view.on("click", function() {
      timeLayerView.filter = null;
      const cpValue = cpSelect.value;
      const tunnelTypeValue = tunnelSelect.value;
      console.log(cpValue + "; " + tunnelTypeValue);

      if (cpValue === 'CP104' && (tunnelTypeValue === 'NATM' || tunnelTypeValue === 'None')) {
        tbmTunnelLayer.definitionExpression = "Package = '" + cpValue + "'";
        natmLayer.visible = true;

      } else if (cpValue === 'CP104' && tunnelTypeValue === 'TBM') {
        tbmTunnelLayer.definitionExpression = "Package = '" + cpValue + "'";
        natmLayer.visible = false;

      } else if (cpValue !== 'CP104' && (tunnelTypeValue === 'None' || tunnelTypeValue === 'TBM')) {
        tbmTunnelLayer.definitionExpression = "Package = '" + cpValue + "'";
        natmLayer.visible = false;

      } 
      

      graphicsLayer.removeAll();
      segmentedDateDiv.style.display = 'none';
    });

  });
    */
  
  //*****************************//
  //      LayerList             //
  //*****************************//
  var layerList = new LayerList({
        view: view,
        listItemCreatedFunction: function(event) {
          const item = event.item;
          if (item.title === "Monitoring Structures" ||
              item.title === "Monitoring Bridge" ||
              item.title === "Soil Profile" ||
              item.title === "Survey Extent Line" ||
              item.title === "OpenStreetMap 3D Buildings" ||
              item.title === "Status of Land Acquisition" ||
              item.title === "Status of Structure"){
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
    // End of LayerList
    // End of LayerList
  
  view.ui.empty("top-left");
  
  // Legend
  var legend = new Legend({
  view: view,
  container: document.getElementById("legendDiv"),
  layerInfos: [
  {
  layer: tbmTunnelLayer,
  title: "TBM Tunnel"
  },
  {
  layer: geotech,
  title: "Soil Profile"
  },
  {
  layer: obstructionLayer,
  title: "OBS Structure"
  },
  {
  layer: bridgeLayer,
  title: "OBS Bridge"
  },
  {
  layer: riverLayer,
  title: "Creek or River"
  },
  {
    layer: natmLayer,
    title: "NATM"
  },
  {
      layer: lotLayer,
      title: "Land Acquisition Status"
  },
  ]
  });
  
  var legendExpand = new Expand({
  view: view,
  content: legend,
  expandIconClass: "esri-icon-legend",
  group: "top-right"
  });
  view.ui.add(legendExpand, {
  position: "top-right"
  });
  
  
  
  // Compass Widget
  var compass = new Compass({
  view: view});
  // adds the compass to the top left corner of the MapView
  view.ui.add(compass, "top-right");
      
  // Full Screen Widget
  var applicationDiv = document.getElementById('applicationDiv');
  
  view.ui.add(
  new Fullscreen({
  view: view,
  element: applicationDiv
  }),
  "top-right"
  );

    // Instruction Expand
    const instructionsExpand = new Expand({
      expandIconClass: "esri-icon-question",
      expandTooltip: "How to use this map",
      view: view,
      expanded: true,
      content: `
      <div style='width:400px; padding:10px; background-color:black; color:white'>
      <p><b>General Instruction</b></p>
      <p>1. <b>Filter</b> section (PO or Remaining) from the dropdown list.</p>
      <p>2. <b>Filter</b> tunnel type (TBM or NATM) from the 2nd dropdown list if needed.</p>
      <p>3. <b>Click</b> the sliced sections of dilapidation survey chart. It only highlights the associated buildings on the map.</p>
      <p>4. <b>Click and Expand</b> time slider widget at the bottom left, which shows segmentation plan date over time.</p>
      <p>5. <b>Toggle</b> 'See through ground' at the bottom right to view underground.</p>
      <p>6. <b>Click once</b> anywhere on the map to <b>animate</b> 3D TBM that moves between Depot and Quirino Highway station.</div>
      `
    });
    view.ui.add(instructionsExpand, "top-right");
  
    // Close the 'help' popup when view is focused
        view.watch("focused", (isFocused) => {
          if (isFocused) {
            instructionsExpand.expanded = false;
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
  
  // Elevation Profile
  /*
          // create the elevation profile widget
          const elevationProfile = new ElevationProfile({
            view: view,
            // configure widget with desired profile lines
            profiles: [
              {
                type: "ground" // first profile line samples the ground elevation
              },
              {
                type: "view" // second profile samples the view and shows building profiles
              }
            ],
            // hide the select button
            // this button can be displayed when there are polylines in the
            // scene to select and display the elevation profile for
            visibleElements: {
              selectButton: true
            }
          });
  
          // add the widget to the view
          view.ui.add(elevationProfile, "top-right");
    */      



  });