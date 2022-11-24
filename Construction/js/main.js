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
    "esri/widgets/BasemapToggle",
    "esri/widgets/Daylight",
    "esri/core/promiseUtils"],
    function (Basemap, Map, MapView, SceneView,
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
      SimpleRenderer, MeshSymbol3D, SolidEdges3D, GroupLayer, BasemapToggle, Daylight,
      promiseUtil) {


      // Create Map
      var map = new Map({
        basemap: "dark-gray-vector",
        ground: "world-elevation"
      });

      // Create the SceneView
      var view = new SceneView({
        container: "viewDiv",
        map: map,
        camera: {
          position: [4.479686585031793, 51.9071412859027, 200],
          tilt: 60,
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
      //end


      //Add Basemap toggle
      const toggle = new BasemapToggle({
        view: view,
        nextBasemap: "hybrid"
      });
      view.ui.add(toggle, "top-right");


      // Create BuildingSceneLayer and add to the map
      const buildingLayer = new BuildingSceneLayer({
        portalItem: {
          id: "aacb26501e824b36be4f307fdc86085c"
        },
        outFields: ["*"],
        title: "De Zalmhaven Midrise"
      });
      map.add(buildingLayer);


      //Discipline: Architectural
      var columnsLayer = null;
      var slabsLayer = null;
      var wallsLayer = null;

      //Discipline: Structural
      var beamsLayer = null;
      var stFoundationLayer = null;

      buildingLayer.when(() => {
        buildingLayer.allSublayers.forEach((layer) => {
          switch (layer.modelName) {
            case "FullModel":
              layer.visible = true;
              break;

            case "GenericModel":
            case "OpeningElement":
              layer.visible = false;
              break;

            case "Columns":
              columnsLayer = layer;
              break;

            case "Slabs":
              slabsLayer = layer;
              break;

            case "Walls":
              wallsLayer = layer;
              break;

            case "Beams":
              beamsLayer = layer;
              break;

            case "StructuralFoundation":
              stFoundationLayer = layer;
              break;

            default:
              layer.visible = true;
          }
        });
      });
      //end


      //Remove deafult widgets on the left
      view.ui.empty("top-left");
      //end

      //Adding building explorer
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
      //end



      // Adding OpenStreetMap 3D Buildings
      // Defining the osm 3D building symbol
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

      //Add the Open Street map with symbol "osmSymbol"
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
      //end


      //Add the 3D cities rotterdam
      var city3D = new SceneLayer({
        portalItem: {
          id: "84c714b47e9140d4afb4a52d46027523"
        },
        title: "Esri Netherlands Textured 3D Buildings"
      });
      map.add(city3D)
      //end






      /***************************
       * Creating charts
       ***************************/

      //FOR TOTAL PERCENTAGE

      //Architectural Column
      function totalProgressColumns() {
        var total_complete = {
          onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
          outStatisticFieldName: "total_complete",
          statisticType: "sum"
        };

        var total_obs = {
          onStatisticField: "Status",
          outStatisticFieldName: "total_obs",
          statisticType: 'count'
        };

        var query = columnsLayer.createQuery();
        query.outStatistics = [total_complete, total_obs];
        query.returnGeometry = true;

        return columnsLayer.queryFeatures(query).then(function (response) {
          var stats = response.features[0].attributes;

          const total_comp = stats.total_complete;
          const total_obs = stats.total_obs;
          const compile_columns = [total_comp, total_obs];

          return compile_columns;
        });
      }

      //Architectural Slabs
      function totalProgressSlabs(compile_columns) {
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

        var query = slabsLayer.createQuery();
        query.outStatistics = [total_complete, total_obs];
        query.returnGeometry = true;
        return slabsLayer.queryFeatures(query).then(function (response) {
          var stats = response.features[0].attributes;

          const total_comp = stats.total_complete;
          const total_obs = stats.total_obs;
          const comp_comp = total_comp + compile_columns[0];
          const comp_obs = total_obs + compile_columns[1];
          const compile_slabs = [comp_comp, comp_obs];

          return compile_slabs;
        });
      }

      //Architectural Walls
      function totalProgressWalls(compile_slabs) {
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
        return wallsLayer.queryFeatures(query).then(function (response) {
          var stats = response.features[0].attributes;

          const total_comp = stats.total_complete;
          const total_obs = stats.total_obs;
          const comp_comp = total_comp + compile_slabs[0];
          const comp_obs = total_obs + compile_slabs[1];
          const compile_walls = [comp_comp, comp_obs];

          return compile_walls;
        });
      }

      //Structural Beams
      function totalProgressBeams(compile_walls) {
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

        var query = beamsLayer.createQuery();
        query.outStatistics = [total_complete, total_obs];
        query.returnGeometry = true;
        return beamsLayer.queryFeatures(query).then(function (response) {
          var stats = response.features[0].attributes;

          const total_comp = stats.total_complete;
          const total_obs = stats.total_obs;
          const comp_comp = total_comp + compile_walls[0];
          const comp_obs = total_obs + compile_walls[1];
          const compile_beams = [comp_comp, comp_obs];

          return compile_beams;
        });
      }

      //Structural Foundation
      function totalProgressStFoundation(compile_beams) {
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
        return stFoundationLayer.queryFeatures(query).then(function (response) {
          var stats = response.features[0].attributes;

          const total_comp = stats.total_complete;
          const total_obs = stats.total_obs;
          const comp_comp = total_comp + compile_beams[0];
          const comp_obs = total_obs + compile_beams[1];
          const compile_stFoundation = [comp_comp, comp_obs];
          
          return compile_stFoundation;
        });
      }


      function progressAll(compile_stFoundation) {
        document.getElementById("totalProgress").innerHTML = ((compile_stFoundation[0] / compile_stFoundation[1]) * 100).toFixed(1) + " %";
      }

      function totalProgress() {
        totalProgressColumns()
          .then(totalProgressSlabs)
          .then(totalProgressWalls)
          .then(totalProgressBeams)
          .then(totalProgressStFoundation)
          .then(progressAll)
      }



















      /***************************
       * Initialize all widgets
       ***************************/

      //Adding LayerList with OSM 3D building & textured building being off
      var LayerList = new LayerList({
        view: view,
        listItemCreatedFunction: function (event) {
          const item = event.item;
          if (item.title === "OpenStreetMap 3D Buildings" ||
            item.title === "Esri Netherlands Textured 3D Buildings") {
            item.visible = false
          }
        }
      });

      var layerListExpand = new Expand({
        view: view,
        content: LayerList,
        expandIconClass: "esri-icon-visible",
        group: "top-right"
      });

      view.ui.add(layerListExpand, "top-right");
      //end


      //Adding the daylight widget
      const daylight = new Daylight({
        view: view,
        //play the animation twice as fast than the default one
        playSpeedMultiplier: 2,
        //disable the timezone selection button
        visibleElements: {
          timezone: false
        }
      }); view.ui.add(new Expand({ content: daylight, view: view, expanded: false }), "top-right");
      //end

      /*****Add Editor Widget
      view.when(() => {
        view.popup.autoOpenEnabled = true;

        let editor = new Editor ({
        view:view
      });

      view.ui.add(editor, "bottom-right");
      });******/


      //Compass
      const compass = new Compass({
        view: view
      });
      view.ui.add(compass, "top-right");
      //end



      //Full Screen Logo
      view.ui.add(
        new Fullscreen({
          view: view,
          element: viewDiv
        }),
        "top-right"
      );//end



      // See-through-Ground        
      view.when(function () {
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
        .addEventListener("change", function (event) {
          //map.ground.opacity = event.target.checked ? 0.1 : 0.9;
          map.ground.opacity = event.target.checked ? 0.1 : 0.6;
        });

      view.ui.add("menu", "bottom-left");
      //end

      ////Adding Camera Fly Through
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
          }, { animate: false });

          requestAnimationFrame(rotate);
        } else {
          abort = false;
          center = null;
          play.style.display = "block";
          pause.style.display = "none";
        }
      }

      play.onclick = rotate;
      pause.onclick = function () {
        abort = true;
      };
      //End of Camera Fly Through


    });