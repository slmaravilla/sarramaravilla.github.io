
//Version 2b
//Dropdown list is dynamic
//You can use filter using 2nd dropdown evern if first dropdown is null
//Call the getQuery2Values, getUniqueValues, addToSelectQuery2 at the end of the
//Of the second query so that "None" shows at the Barangay Dropdown
//Adding pie chart series

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

    let highlightSelect;



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
                            label: "<p>Status for Relocation(ISF)</>"
                        },
                        {
                            fieldName: "Name"
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
    /*var rowLayer = new FeatureLayer({
        portalItem: {
            id: "590680d19f2e48fdbd8bcddce3aaedb5",
            portal: {
                url: "https://gis.railway-sector.com/portal"
            }
        },
        title: "ROW",
        popupEnabled: false,
    });
    map.add(rowLayer);*/



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

        updateChart();

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

        updateChart();
    });

    // End of Dropdown list





    /************************
    ***** PROGRESS CHART ****
    *************************/


    // Create root and chart
    var root = am5.Root.new("chartdiv");




    function updateChart() {

        //Query statistics

        var total_relocated = {
            onStatisticField: "CASE WHEN StatusRC = 1 THEN 1 ELSE 0 END",
            outStatisticFieldName: "total_relocated",
            statisticType: "sum"
        };

        var total_paid = {
            onStatisticField: "CASE WHEN StatusRC = 2 THEN 1 ELSE 0 END",
            outStatisticFieldName: "total_paid",
            statisticType: "sum"
        };

        var total_payp = {
            onStatisticField: "CASE WHEN StatusRC = 3 THEN 1 ELSE 0 END",
            outStatisticFieldName: "total_payp",
            statisticType: "sum"
        };

        var total_legalpass = {
            onStatisticField: "CASE WHEN StatusRC = 4 THEN 1 ELSE 0 END",
            outStatisticFieldName: "total_legalpass",
            statisticType: "sum"
        };

        var total_otc = {
            onStatisticField: "CASE WHEN StatusRC = 5 THEN 1 ELSE 0 END",
            outStatisticFieldName: "total_otc",
            statisticType: "sum"
        };

        var total_lbp = {
            onStatisticField: "CASE WHEN StatusRC = 6 THEN 1 ELSE 0 END",
            outStatisticFieldName: "total_lbp",
            statisticType: "sum"
        };


        //Start of query function
        var query = isf_layer.createQuery();
        query.outStatistics = [total_relocated, total_paid, total_payp, total_legalpass, total_otc, total_lbp];
        query.returnGeometry = true;

        isf_layer.queryFeatures(query).then(function (response) {
            var stats = response.features[0].attributes;

            const clear = stats.total_relocated;
            const paid = stats.total_paid;
            const payp = stats.total_payp;
            const legalpass = stats.total_legalpass;
            const otc = stats.total_otc;
            const lbp = stats.total_lbp;

            //console.log(clear);


            root.setThemes([
                am5themes_Animated.new(root),
                am5themes_Responsive.new(root)

            ]);

            var chart = root.container.children.push(
                am5percent.PieChart.new(root, {
                    layout: root.verticalLayout
                })
            );

            const statusISF = ["Relocated", "Paid", "For Payment Processing",
                "For Legal Pass", "For Appraisal/OtC/Requirements for Other Entitlements",
                "LBP Account Opening"]

            var data = [
                {
                    category: statusISF[0],
                    value: clear,
                },
                {
                    category: statusISF[1],
                    value: paid
                },
                {
                    category: statusISF[2],
                    value: payp
                },
                {
                    category: statusISF[3],
                    value: legalpass
                },
                {
                    category: statusISF[4],
                    value: otc
                },
                {
                    category: statusISF[5],
                    value: lbp
                }
            ];


            var series = chart.series.push(
                am5percent.PieSeries.new(root, {
                    name: "Series",
                    categoryField: "category",
                    valueField: "value",
                    radius: am5.percent(85),
                    innerRadius: am5.percent(40),
                    legendValueText: "{valuePercentTotal.formatNumber('#.')}%({value})",
                })
            );


            //Setting unique color on series color set
            series.get("colors").set("colors", [
                am5.color("#845EC2"),
                am5.color("#D65DB1"),
                am5.color("#FF6F91"),
                am5.color("#FF9671"),
                am5.color("#FFC75F"),
                am5.color("#F9F871")
            ]);


            //Customize default slice settings
            series.slices.template.setAll({
                fillOpacity: 0.9,
                stroke: am5.color("#ffffff"),
                strokeWidth: 1
            });

            series.slices.template.states.create("active", {
                shiftRadius: 0,
                stroke: am5.color("#ffffff"),
                strokeWidth: 2
            });


            // highlight and zoom to selected features



            series.slices.template.events.on("click", function (event) {
                const SELECTED = event.target.dataItem.dataContext.category;
                if (SELECTED == statusISF[0]) {
                    selectedStatus = 1
                } else if (SELECTED == statusISF[1]) {
                    selectedStatus = 2
                } else if (SELECTED == statusISF[2]) {
                    selectedStatus = 3
                } else if (SELECTED == statusISF[3]) {
                    selectedStatus = 4
                } else if (SELECTED == statusISF[4]) {
                    selectedStatus = 5
                } else if (SELECTED == statusISF[5]) {
                    selectedStatus = 6
                } else {
                    selectedStatus = null;
                }

                view.when(function () {
                    view.whenLayerView(isf_layer).then(function (layerView) {

                        
                        var query = isf_layer.createQuery();
                        query.where = "StatusRC =" + selectedStatus;
            

                        isf_layer.queryFeatures(query).then(function(result) {
                            const gg = result.features;
                            const hh = gg.length;

                            let objID = [];
                            for (var i = 0; i < hh; i++) {
                                var obj = result.features[i].attributes.OBJECTID;
                                objID.push(obj);
                                //console.log(hh);
                                //console.log(obj);
                            }

                            var queryExt = new Query({
                                objectIds: [objID]
                            });
                            console.log(objID);
                            //queryExt.returnGeometry = true;

                            isf_layer.queryExtent(queryExt).then(function (result) {
                                if (result.extent) {
                                    view.goTo(result.extent)
                                }
                            });

                            if (highlightSelect) {
                                highlightSelect.remove();
                            }
                            highlightSelect = layerView.highlight(objID);

                            view.on("click", function () {
                                layerView.filter = null;
                                highlightSelect.remove();
                            });
                        });
                        layerView.filter = {
                            where: "StatusRC =" + selectedStatus
                        }
                    });
                });
            });



            series.data.setAll(data);
            series.appear();
            series.labels.template.set("forceHidden", true);
            series.ticks.template.set("forceHidden", true);


            //Legend
            var legend = chart.children.push(am5.Legend.new(root, {
                centerY: am5.percent(50),
                y: am5.percent(80),
                layout: root.verticalLayout,
                truncate: "true",
            }));


            legend.labels.template.setAll({
                breakWords: true,
                fill: am5.color("#ffffff"),
                fontSize: 12,
            });

            //legend.valueLabels.template.set("forceHidden", true);
            legend.valueLabels.template.setAll({
                fill: am5.color("#ffffff"),
                fontSize: 12,
            });

            //Customize marker
            legend.markerRectangles.template.setAll({
                cornerRadiusTL: 10,
                cornerRadiusTR: 10,
                cornerRadiusBL: 10,
                cornerRadiusBR: 10
            });

            legend.data.setAll(series.dataItems);








        }); //End of query function

    } // End of updateChart
    updateChart();


    /*var chart = root.container.children.push(
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
 
    legend.data.setAll(series.dataItems);*/







});