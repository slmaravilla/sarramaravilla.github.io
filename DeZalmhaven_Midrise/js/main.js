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
    "esri/core/promiseUtils",
    "esri/widgets/FeatureForm",
    "esri/Graphic",
    "esri/form/FormTemplate",
    "esri/widgets/FeatureForm/FieldConfig",
    "esri/form/elements/FieldElement"],
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
        promiseUtil, FeatureForm, Graphic, FormTemplate, FieldConfig, FieldElement) {
        let editFeature, highlight, chartLayerView, featureForm, editArea, attributeEditing, updateInstructionDiv;


        /////////////

        const map = new Map({
            basemap: "dark-gray-vector",
            ground: "world-elevation"
        });

        const view = new SceneView({
            map: map,
            container: "viewDiv",
            camera: {
                position: [4.479484771121698, 51.90705030688716, 180],
                tilt: 65,
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


        //Add Basemap toggle
        const toggle = new BasemapToggle({
            view: view,
            nextBasemap: "hybrid"
        });
        view.ui.add(toggle, "top-right");



        const buildingLayer = new SceneLayer({
            url: "https://services3.arcgis.com/PDfv0I40sqpcaZxV/arcgis/rest/services/De_Zalmhaven_Midrise/SceneServer11",
            title: "De Zalmhaven Midrise",
            outFields: ["*"],

        });
        map.add(buildingLayer);


        /*
                        //EDITOR WIDGET
                        const editor = new Editor({
                view: view
                        }); view.ui.add(editor, "bottom-right");
            //END OF EDITOR WIDGET
            */

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
            title: "OpenStreetMap 3D Buildings",
            elevationInfo: {
                mode: "absolute-height"
            }
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
            title: "Esri Netherlands Textured 3D Buildings",
            elevationInfo: {
                mode: "absolute-height"
            }
        });
        map.add(city3D)
        //end




        /***********************
             ***Initialize Widgets**
             ***********************/



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

        view.ui.add("menu", "bottom-right");
        //end



        //Remove deafult widgets on the left
        view.ui.empty("top-left");
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




        // adding the amChart function
        am4core.ready(function () {
            am4core.useTheme(am4themes_animated);


            //buildingLayer.definitionExpression = null;
            //totalProgress();
            //updateChart();


            /*********************
             ***FILTER BY FLOOR***
             ********************/

            var dropdownValue = document.getElementById("floorSelect");

            function getValues() {
                var testArray = [];
                var query = buildingLayer.createQuery();
                query.outFields = ["BldgLevel"];
                buildingLayer.returnGeometry = true;
                return buildingLayer.queryFeatures(query).then(function (response) {
                    var stats = response.features;
                    stats.forEach((result, index) => {
                        var attributes = result.attributes;
                        const values = attributes.BldgLevel;
                        testArray.push(values);
                    });
                    return testArray;
                });
            }

            function getUniqueValues(values) {
                var uniqueValues = [];
                values.forEach(function (item, i) {
                    if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) && item !== "") {
                        uniqueValues.push(item);
                    }
                });
                return uniqueValues;
            }

            function addToSelect(values) {
                dropdownValue.options.length = 0;
                values.sort(function (a, b) { return a - b }); //ascending order
                values.unshift('All');
                values.forEach(function (value) {
                    var option = document.createElement("option");
                    option.text = value;
                    dropdownValue.add(option);
                });
            }

            getValues()
                .then(getUniqueValues)
                .then(addToSelect)




            dropdownValue.addEventListener("click", filterByTest);
            function filterByTest(event) {
                const selectedID = event.target.value;

                if (selectedID === "All") {
                    buildingLayer.definitionExpression = null;
                    totalProgress();
                    updateChart();
                } else {
                    buildingLayer.definitionExpression = "BldgLevel = " + selectedID;
                    totalProgress();
                    updateChart();
                }
            }


            /*********************
             *********END*********
             ********************/



            /*********************
             ***TOTAL PROGRESS***
             ********************/



            function totalProgress() {
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
                var query = buildingLayer.createQuery();
                query.outStatistics = [total_complete, total_obs];
                query.returnGeometry = true;
                buildingLayer.queryFeatures(query).then(function (response) {
                    var stats = response.features[0].attributes;

                    const total_complete = stats.total_complete;
                    const total_obs = stats.total_obs;
                    document.getElementById("totalProgress").innerHTML = ((total_complete / total_obs) * 100).toFixed(1) + " %";
                });
            } totalProgress();


            /*********************
             *********END*********
             ********************/




            /***********************
            *****PROGRESS CHART****
            ***********************/

            function updateChart() {
                //Column
                var total_column_tobeC = {
                    onStatisticField: "CASE WHEN (SubType = 1 and Status = 1) THEN 1 ELSE 0 END",  // Column and to be Constructed
                    outStatisticFieldName: "total_column_tobeC",
                    statisticType: "sum"
                };

                var total_column_underC = {
                    onStatisticField: "CASE WHEN (SubType = 1 and Status = 2) THEN 1 ELSE 0 END",  // Column and Under construction
                    outStatisticFieldName: "total_column_underC",
                    statisticType: "sum"
                };
                var total_column_done = {
                    onStatisticField: "CASE WHEN (SubType = 1 and Status = 4) THEN 1 ELSE 0 END",  // Column and Complete
                    outStatisticFieldName: "total_column_done",
                    statisticType: "sum"
                };
                var total_column_delayed = {
                    onStatisticField: "CASE WHEN (SubType = 1 and Status = 3) THEN 1 ELSE 0 END",  // Column and Delayed
                    outStatisticFieldName: "total_column_delayed",
                    statisticType: "sum"
                };

                //Slabs
                var total_slab_tobeC = {
                    onStatisticField: "CASE WHEN (SubType = 2 and Status = 1) THEN 1 ELSE 0 END",  // Slab and to be Constructed
                    outStatisticFieldName: "total_slab_tobeC",
                    statisticType: "sum"
                };

                var total_slab_underC = {
                    onStatisticField: "CASE WHEN (SubType = 2 and Status = 2) THEN 1 ELSE 0 END",  // Slab and Under construction
                    outStatisticFieldName: "total_slab_underC",
                    statisticType: "sum"
                };
                var total_slab_done = {
                    onStatisticField: "CASE WHEN (SubType = 2 and Status = 4) THEN 1 ELSE 0 END",  // Slab and Complete
                    outStatisticFieldName: "total_slab_done",
                    statisticType: "sum"
                };
                var total_slab_delayed = {
                    onStatisticField: "CASE WHEN (SubType = 2 and Status = 3) THEN 1 ELSE 0 END",  // Slab and Delayed
                    outStatisticFieldName: "total_slab_delayed",
                    statisticType: "sum"
                };

                //Walls
                var total_wall_tobeC = {
                    onStatisticField: "CASE WHEN (SubType = 3 and Status = 1) THEN 1 ELSE 0 END",  // Walls and to be Constructed
                    outStatisticFieldName: "total_wall_tobeC",
                    statisticType: "sum"
                };

                var total_wall_underC = {
                    onStatisticField: "CASE WHEN (SubType = 3 and Status = 2) THEN 1 ELSE 0 END",  // Walls and Under construction
                    outStatisticFieldName: "total_wall_underC",
                    statisticType: "sum"
                };
                var total_wall_done = {
                    onStatisticField: "CASE WHEN (SubType = 3 and Status = 4) THEN 1 ELSE 0 END",  // Walls and Complete
                    outStatisticFieldName: "total_wall_done",
                    statisticType: "sum"
                };
                var total_wall_delayed = {
                    onStatisticField: "CASE WHEN (SubType = 3 and Status = 3) THEN 1 ELSE 0 END",  // Walls and Delayed
                    outStatisticFieldName: "total_wall_delayed",
                    statisticType: "sum"
                };

                //Beams
                var total_beam_tobeC = {
                    onStatisticField: "CASE WHEN (SubType = 4 and Status = 1) THEN 1 ELSE 0 END",  // Beams and to be Constructed
                    outStatisticFieldName: "total_beam_tobeC",
                    statisticType: "sum"
                };

                var total_beam_underC = {
                    onStatisticField: "CASE WHEN (SubType = 4 and Status = 2) THEN 1 ELSE 0 END",  // Beams and Under construction
                    outStatisticFieldName: "total_beam_underC",
                    statisticType: "sum"
                };
                var total_beam_done = {
                    onStatisticField: "CASE WHEN (SubType = 4 and Status = 4) THEN 1 ELSE 0 END",  // Beams and Complete
                    outStatisticFieldName: "total_beam_done",
                    statisticType: "sum"
                };
                var total_beam_delayed = {
                    onStatisticField: "CASE WHEN (SubType = 4 and Status = 3) THEN 1 ELSE 0 END",  // Beams and Delayed
                    outStatisticFieldName: "total_beam_delayed",
                    statisticType: "sum"
                };

                //Structural Foundation
                var total_stFoundation_tobeC = {
                    onStatisticField: "CASE WHEN (SubType = 5 and Status = 1) THEN 1 ELSE 0 END",  // Structural Foundation and to be Constructed
                    outStatisticFieldName: "total_stFoundation_tobeC",
                    statisticType: "sum"
                };

                var total_stFoundation_underC = {
                    onStatisticField: "CASE WHEN (SubType = 5 and Status = 2) THEN 1 ELSE 0 END",  // Structural Foundation and Under construction
                    outStatisticFieldName: "total_stFoundation_underC",
                    statisticType: "sum"
                };
                var total_stFoundation_done = {
                    onStatisticField: "CASE WHEN (SubType = 5 and Status = 4) THEN 1 ELSE 0 END",  // Structural Foundation and Complete
                    outStatisticFieldName: "total_stFoundation_done",
                    statisticType: "sum"
                };
                var total_stFoundation_delayed = {
                    onStatisticField: "CASE WHEN (SubType = 5 and Status = 3) THEN 1 ELSE 0 END",  // Structural Foundation and Delayed
                    outStatisticFieldName: "total_stFoundation_delayed",
                    statisticType: "sum"
                };


                var query = buildingLayer.createQuery();
                query.outStatistics = [total_column_tobeC, total_column_underC, total_column_done, total_column_delayed,
                    total_slab_tobeC, total_slab_underC, total_slab_done, total_slab_delayed,
                    total_wall_tobeC, total_wall_underC, total_wall_done, total_wall_delayed,
                    total_beam_tobeC, total_beam_underC, total_beam_done, total_beam_delayed,
                    total_stFoundation_tobeC, total_stFoundation_underC, total_stFoundation_done, total_stFoundation_delayed]
                query.returnGeometry = true;

                buildingLayer.queryFeatures(query).then(function (response) {
                    var stats = response.features[0].attributes;

                    //Columns
                    const column_tobeC = stats.total_column_tobeC;
                    const column_underC = stats.total_column_underC;
                    const column_done = stats.total_column_done;
                    const column_delayed = stats.total_column_delayed;

                    //Slabs
                    const slab_tobeC = stats.total_slab_tobeC;
                    const slab_underC = stats.total_slab_underC;
                    const slab_done = stats.total_slab_done;
                    const slab_delayed = stats.total_slab_delayed;

                    //Walls
                    const wall_tobeC = stats.total_wall_tobeC;
                    const wall_underC = stats.total_wall_underC;
                    const wall_done = stats.total_wall_done;
                    const wall_delayed = stats.total_wall_delayed;

                    //Beams
                    const beam_tobeC = stats.total_beam_tobeC;
                    const beam_underC = stats.total_beam_underC;
                    const beam_done = stats.total_beam_done;
                    const beam_delayed = stats.total_beam_delayed;


                    //
                    const stFoundation_tobeC = stats.total_stFoundation_tobeC;
                    const stFoundation_underC = stats.total_stFoundation_underC;
                    const stFoundation_done = stats.total_stFoundation_done;
                    const stFoundation_delayed = stats.total_stFoundation_delayed;


                    var chart = am4core.create("chartdiv", am4charts.XYChart);
                    chart.hiddenState.properties.opacity = 0;

                    chart.data = [
                        {
                            category: "Column",
                            value1: column_done,
                            value2: column_underC,
                            value3: column_tobeC,
                            value4: column_delayed
                        },
                        {
                            category: "Slab",
                            value1: slab_done,
                            value2: slab_underC,
                            value3: slab_tobeC,
                            value4: slab_delayed
                        },
                        {
                            category: "Wall",
                            value1: wall_done,
                            value2: wall_underC,
                            value3: wall_tobeC,
                            value4: wall_delayed
                        },
                        {
                            category: "Beam",
                            value1: beam_done,
                            value2: beam_underC,
                            value3: beam_tobeC,
                            value4: beam_delayed
                        },
                        {
                            category: "St.Foundation",
                            value1: stFoundation_done,
                            value2: stFoundation_underC,
                            value3: stFoundation_tobeC,
                            value4: stFoundation_delayed
                        }

                    ]; //End of chart

                    chart.colors.step = 2;
                    chart.padding(10, 10, 10, 10);

                    //Legend
                    const LegendFontSize = 15;
                    chart.legend = new am4charts.Legend();

                    chart.legend.valueLabels.template.align = "right"
                    chart.legend.valueLabels.template.textAlign = "end";


                    chart.legend.position = "bottom";
                    chart.legend.labels.template.fontSize = LegendFontSize;
                    chart.legend.labels.template.fill = "#ffffff";
                    chart.legend.valueLabels.template.fill = am4core.color("#ffffff");
                    chart.legend.valueLabels.template.fontSize = LegendFontSize;


                    var marker = chart.legend.markers.template.children.getIndex(0);
                    var markerTemplate = chart.legend.markers.template;
                    marker.cornerRadius(12, 12, 12, 12);
                    marker.strokeWidth = 1;
                    marker.strokeOpacity = 1;
                    marker.stroke = am4core.color("#ccc");


                    // Change size of legend marker
                    markerTemplate.width = 16;
                    markerTemplate.height = 16;

                    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
                    categoryAxis.dataFields.category = "category";
                    categoryAxis.renderer.grid.template.location = 0;
                    categoryAxis.renderer.labels.template.fontSize = 16;
                    categoryAxis.renderer.labels.template.fill = "#ffffff";
                    categoryAxis.renderer.minGridDistance = 5; //can change label

                    var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
                    valueAxis.min = 0;
                    valueAxis.max = 100;
                    valueAxis.strictMinMax = true;
                    valueAxis.calculateTotals = true;
                    valueAxis.renderer.minWidth = 50;
                    valueAxis.renderer.labels.template.fontSize = 14;
                    valueAxis.renderer.labels.template.fill = "#ffffff";

                    function createSeries(field, name) {
                        var series = chart.series.push(new am4charts.ColumnSeries());
                        series.calculatePercen = true;
                        series.dataFields.valueX = field;
                        series.dataFields.categoryY = "category";
                        series.stacked = true;
                        series.dataFields.valueXShow = "totalPercent";
                        series.dataItems.template.locations.categoryY = 0.5;
                        // Bar chart line color and width
                        series.columns.template.stroke = am4core.color("#ffffff");
                        series.columns.template.strokeWidth = 0.5;
                        series.name = name;


                        var labelBullet = series.bullets.push(new am4charts.LabelBullet());

                        if (name == "To be Constructed") {
                            series.fill = am4core.color("#000000");

                            labelBullet.locationX = 0.5;
                            labelBullet.label.text = "";

                            //labelBullet.label.fill = am4core.color("#00FFFFFF");
                            labelBullet.label.fill = am4core.color("#000000");
                            labelBullet.interactionsEnabled = false;
                            labelBullet.label.fontSize = 14;
                            labelBullet.locationX = 0.5;

                        } else if (name == "Under Construction") {
                            series.fill = am4core.color("#c2c2c2");
                            labelBullet.locationX = 0.5;
                            labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
                            labelBullet.label.fill = am4core.color("#ffffff");
                            labelBullet.interactionsEnabled = false;
                            labelBullet.label.fontSize = 14;
                            labelBullet.locationX = 0.5;

                        } else if (name == "Completed") {
                            series.fill = am4core.color("#0070ff");
                            labelBullet.locationX = 0.5;
                            labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
                            labelBullet.label.fill = am4core.color("#ffffff");
                            labelBullet.interactionsEnabled = false;
                            labelBullet.label.fontSize = 14;
                            labelBullet.locationX = 0.5;

                        } else {
                            series.fill = am4core.color("#ff0000"); // delayed
                            labelBullet.locationX = 0.5;
                            labelBullet.label.text = "{valueX.totalPercent.formatNumber('#.')}%";
                            labelBullet.label.fill = am4core.color("#ffffff");
                            labelBullet.interactionsEnabled = false;
                            labelBullet.label.fontSize = 14;
                            labelBullet.locationX = 0.5;

                        }
                        series.columns.template.width = am4core.percent(60);
                        series.columns.template.tooltipText = "[font-size:12px]{name}: {valueX.value.formatNumber('#.')}"

                        // Click chart and filter, update maps
                        const chartElement = document.getElementById("progressPanel");


                        series.columns.template.events.on("hit", filterByChart, this);
                        function filterByChart(ev) {
                            const selectedC = ev.target.dataItem.component.name;
                            const selectedP = ev.target.dataItem.categoryY;


                            //Column
                            if (selectedP == "Column" && selectedC == "To be Constructed") {
                                selectedLayer = 1;
                                selectedStatus = 1;
                            } else if (selectedP == "Column" && selectedC == "Under Construction") {
                                selectedLayer = 1;
                                selectedStatus = 2;
                            } else if (selectedP == "Column" && selectedC == "Delayed") {
                                selectedLayer = 1;
                                selectedStatus = 3;
                            } else if (selectedP == "Column" && selectedC == "Completed") {
                                selectedLayer = 1;
                                selectedStatus = 4;
                                //Slab
                            } else if (selectedP == "Slab" && selectedC == "To be Constructed") {
                                selectedLayer = 2;
                                selectedStatus = 1;
                            } else if (selectedP == "Slab" && selectedC == "Under Construction") {
                                selectedLayer = 2;
                                selectedStatus = 2;
                            } else if (selectedP == "Slab" && selectedC == "Delayed") {
                                selectedLayer = 2;
                                selectedStatus = 3;
                            } else if (selectedP == "Slab" && selectedC == "Completed") {
                                selectedLayer = 2;
                                selectedStatus = 4;
                                //Walls
                            } else if (selectedP == "Wall" && selectedC == "To be Constructed") {
                                selectedLayer = 3;
                                selectedStatus = 1;
                            } else if (selectedP == "Wall" && selectedC == "Under Construction") {
                                selectedLayer = 3;
                                selectedStatus = 2;
                            } else if (selectedP == "Wall" && selectedC == "Delayed") {
                                selectedLayer = 3;
                                selectedStatus = 3;
                            } else if (selectedP == "Wall" && selectedC == "Completed") {
                                selectedLayer = 3;
                                selectedStatus = 4;
                                //Beams
                            } else if (selectedP == "Beam" && selectedC == "To be Constructed") {
                                selectedLayer = 4;
                                selectedStatus = 1;
                            } else if (selectedP == "Beam" && selectedC == "Under Construction") {
                                selectedLayer = 4;
                                selectedStatus = 2;
                            } else if (selectedP == "Beam" && selectedC == "Delayed") {
                                selectedLayer = 4;
                                selectedStatus = 3;
                            } else if (selectedP == "Beam" && selectedC == "Completed") {
                                selectedLayer = 4;
                                selectedStatus = 4;
                                //Structural Foundation
                            } else if (selectedP == "St.Foundation" && selectedC == "To be Constructed") {
                                selectedLayer = 5;
                                selectedStatus = 1;
                            } else if (selectedP == "St.Foundation" && selectedC == "Under Construction") {
                                selectedLayer = 5;
                                selectedStatus = 2;
                            } else if (selectedP == "St.Foundation" && selectedC == "Delayed") {
                                selectedLayer = 5;
                                selectedStatus = 3;
                            } else if (selectedP == "St.Foundation" && selectedC == "Completed") {
                                selectedLayer = 5;
                                selectedStatus = 4;


                            } else {
                                selectedLayer = null;
                            }

                            chartLayerView.filter = {
                                where: "SubType = " + selectedLayer + " AND " + "Status = " + selectedStatus
                            };

                        }

                        view.whenLayerView(buildingLayer).then(function (layerView) {
                            chartLayerView = layerView;

                            chartElement.style.visibility = "visible";

                            view.on("click", function () {
                                chartLayerView.filter = null;
                            });
                        });


                    }// End of createSeries function


                    createSeries("value1", "Completed");
                    createSeries("value2", "Under Construction");
                    createSeries("value3", "To be Constructed");
                    createSeries("value4", "Delayed");


                }); // End of queryFeatures function

            } updateChart();

        }); // End of am4Core.ready()

        /*********************
        *********END*********
        ********************/

    });