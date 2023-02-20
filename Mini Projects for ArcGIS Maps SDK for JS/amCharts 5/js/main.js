
//Version 2b
//Dropdown list is dynamic
//You can use filter using 2nd dropdown evern if first dropdown is null
//Call the getQuery2Values, getUniqueValues, addToSelectQuery2 at the end of the
//Of the second query so that "None" shows at the Barangay Dropdown

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
    "esri/layers/GraphicsLayer",
    "esri/widgets/Search",
    "esri/widgets/BasemapToggle"
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
    GraphicsLayer, Search, BasemapToggle) {



    //Create Map
    var map = new Map({
        basemap: "dark-gray-vector",
    });



    //Create MapView
    var view = new MapView({
        container: "viewDiv",
        map: map,
        //center: [120.57930, 15.100],
        zoom: 10,
    });



    //Remove default widgets on the left
    view.ui.empty("top-left");



    //Add toggle basemap
    var toggle = new BasemapToggle({
        view: view,
        nextBasemap: "hybrid",
    });
    view.ui.add(toggle, "top-right");



    //Add a relo ISF featureLayer and add it to the map
    var isf_layer = new FeatureLayer({
        portalItem: {
            id: "dca1d785da0f458b8f87638a76918496",
            portal: {
                url: "https://gis.railway-sector.com/portal"
            }
        },
        layerId: 4,
        title: "Status of Relocation (ISF)",
        outFields: ["*"],
    });
    map.add(isf_layer);



    //Add a structure featureLayer and add it to the map
    var struc_layer = new FeatureLayer({
        portalItem: {
            id: "dca1d785da0f458b8f87638a76918496",
            portal: {
                url: "https://gis.railway-sector.com/portal"
            }
        },
        layerId: 9,
        title: "Structure Boundary",
        outFields: ["*"],
    });
    map.add(struc_layer);



    //Add PROW featureLayer and add it to the map
    var rowLayer = new FeatureLayer({
        portalItem: {
            id: "590680d19f2e48fdbd8bcddce3aaedb5",
            portal: {
                url: "https://gis.railway-sector.com/portal"
            }
        },
        title: "ROW",
        popupEnabled: false,
    });
    map.add(rowLayer);



    //Adding layerlist with rowLayer and isf_layer
    var layerList = new LayerList({
        view: view,
        listItemCreatedFunction: function (event) {
            const item = event.item;
            if (item.title === "ROW") {
                item.visible = false
            }
        }
    });

    var layerListExpand = new Expand({
        view: view,
        content: layerList,
        expandIconClass: "esri-icon-visible",
    });
    view.ui.add(layerListExpand, "top-right");



    //Full Screen Logo
    view.ui.add(
        new Fullscreen({
            view: view,
            element: viewDiv
        }),
        "top-right"
    );



    // Zoom to selected layers
    function zoomToLayer(layer) {
        return layer.queryExtent().then(function (response) {
            view.goTo(response.extent, { //response.extent
                speedFactor: 2
            }).catch(function (error) {
                if (error.name != "AbortError") {
                    console.error(error);
                }
            });
        });
    }
    zoomToLayer(isf_layer);




    // CREATE TWO DROPDOWN LIST: FILTER BY MUNICIPALITY AND BARANGAY

    const muniDropdown = document.getElementById("muniSelect");
    const brgyDropdown = document.getElementById("brgySelect")


    //*********** */
    // Step 1: Query all the features from the feature layer
    //********** */

    view.when(function () {
        return isf_layer.when(function () {
            var query = isf_layer.createQuery();
            return isf_layer.queryFeatures(query);
        });
    })
        .then(getValues)
        .then(getUniqueValues)
        .then(addToSelect)



    function getValues(response) {
        var features = response.features;
        var values = features.map(function (feature) {
            return feature.attributes.Municipality;
        });
        return values;

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
        //muniDropdown.options.length = 0;
        values.sort();
        values.unshift('None');
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.text = value;
            muniDropdown.add(option);
        });
        //return muniExpression(muniDropdown.value);
    }



    //************* */
    // Step 4: Query all the features for the 2nd dropdown using the "Barangay" field
    //************* */

    function filterLotMunicipality() {

        function getQuery2Values() {
            var brgyArray = [];
            var query2 = isf_layer.createQuery();
            isf_layer.returnGeometry = true;
            return isf_layer.queryFeatures(query2).then(function (response) {
                var featuresQuery2 = response.features;
                featuresQuery2.forEach((result, index) => {
                    var attributes = result.attributes;
                    const query2Values = attributes.Barangay;
                    brgyArray.push(query2Values);
                    //console.log(query2Values);
                });
                return brgyArray;
            });
        }

        function getUniqueValues2(values2) {
            var uniqueValues2 = [];
            values2.forEach(function (item, i) {
                if ((uniqueValues2.length < 1 || uniqueValues2.indexOf(item) === -1) && item !== "") {
                    uniqueValues2.push(item);
                }
            }); return uniqueValues2;
        }

        function addToSelectQuery2(query2Values) {
            brgyDropdown.options.length = 0;
            query2Values.sort();
            query2Values.unshift('None');
            query2Values.forEach(function (value) {
                var option = document.createElement("option");
                option.text = value;
                brgyDropdown.add(option);
            });
        }

        //call this function so that 'None' will appear in the barangay dropdown

        getQuery2Values()
            .then(getUniqueValues2)
            .then(addToSelectQuery2)

    }
    filterLotMunicipality();




    //************* */
    // Step 2: Set the definitionExpression on the feature layer to reflect the selection of the user
    //************* */

    function muniExpression(newValue) {
        if (newValue == 'None') {
            isf_layer.definitionExpression = null;
        } else {
            isf_layer.definitionExpression = "Municipality = '" + newValue + "'";
        }
        //zoomToLayer(isf_layer);
        //return queryLotGeometry();
    }

    function muniBrgyExpression(newValue1, newValue2) {
        if (newValue1 === undefined && newValue2 === undefined) {
            isf_layer.definitionExpression = null;

        } else if (newValue1 == 'None' && newValue2 !== 'None') {
            isf_layer.definitionExpression = "Barangay = '" + newValue2 + "'";

        } else if (newValue1 == 'None' && newValue2 == 'None') {
            isf_layer.definitionExpression = null;

        } else if (newValue1 !== 'None' && newValue2 == 'None') {
            isf_layer.definitionExpression = "Municipality = '" + newValue1 + "'";

        } else if (newValue1 !== 'None' && newValue2 !== 'None') {
            isf_layer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
        }
        return queryLotGeometry();
    }



    //**************** */
    // Step. 3 Get all the geometries of the feature layer. The createQuery() method creates a query object
    // That repects the definitionExpression of the feature layer
    //**************** */


    function queryLotGeometry() {
        var lotQuery = isf_layer.createQuery();
        return isf_layer.queryFeatures(lotQuery).then(function (response) {
            lotGeometries = response.features.map(function (feature) {
                return feature.geometry;
            });
            return lotGeometries;
        });
    }


    //*************** */
    // Step 5: Add EventLister to the dropdown list
    /**************** */

    muniDropdown.addEventListener("change", function (event) {
        var municipal = event.target.value;

        muniExpression(municipal);
        filterLotMunicipality();

        zoomToLayer(isf_layer);

        changeSelected();


    })

    // this enables the 2nd dropdown to return to "None"
    // when "None" option is selected in the 1st dropdown
    const changeSelected = (e) => {
        const $select = document.querySelector('#brgySelect');
        $select.value = 'None'
    };


    brgyDropdown.addEventListener("change", function (event) {
        var municipal = muniDropdown.value;
        var barangay = event.target.value;

        muniBrgyExpression(municipal, barangay);

        zoomToLayer(isf_layer);
    });

    // End of Dropdown list

    // PROGRESS CHART


    // Create root and chart
    var root = am5.Root.new("chartdiv");

    root.setThemes([
        am5themes_Animated.new(root)
    ]);

    var chart = root.container.children.push(
        am5percent.PieChart.new(root, {
            layout: root.verticalLayout
        })
    );

    // Define data
    var data = [{
        country: "France",
        sales: 100000
    }, {
        country: "Spain",
        sales: 160000
    }, {
        country: "United Kingdom",
        sales: 80000
    }];

    // Create series
    var series = chart.series.push(
        am5percent.PieSeries.new(root, {
            name: "Series",
            valueField: "sales",
            categoryField: "country",
        })
    );
    series.data.setAll(data);
    series.appear();
    //chart.appear();
    

    // Add legend
    var legend = chart.children.push(am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: root.horizontalLayout
    }));

    legend.data.setAll(series.dataItems);







});