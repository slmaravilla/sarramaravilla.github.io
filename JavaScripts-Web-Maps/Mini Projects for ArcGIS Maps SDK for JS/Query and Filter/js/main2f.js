
//Version 2b
//Dropdown list is dynamic
//You can use filter using 2nd dropdown evern if first dropdown is null
//Call the getQuery2Values, getUniqueValues, addToSelectQuery2 at the end of the
//Of the second query so that "None" shows at the Barangay Dropdown
//Editing the Layerlist and uses calcite design

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
    "esri/widgets/Print",
    "esri/widgets/BasemapGallery"
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
    GraphicsLayer, Search, Print, BasemapGallery) {



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



    /*const print = new Print({
        view: view,
        printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
        container: "printDiv"
    });
    var printExpand = new Expand({
        view: view,
        content: print,
        expandIconClass: "esri-icon-printer",
        group: "bottom-right"
    });
    view.ui.add(printExpand, {
        position: "bottom-right"
    });*/


    //symbolizing lot layer
    const colors = [[0, 197, 255], [112, 173, 71], [0, 112, 255], [255, 255, 0], [255, 170, 0], [255, 0, 0], [0, 0, 0, 0]];

    const commonProperties = {
        type: "simple-fill",
        width: "4px",
        style: "solid"
    };

    // Symbol for Handed-Over
    const handedSym = {
        ...commonProperties,
        color: colors[0]
    };

    // Symbol for U.S. Highways
    const paidSym = {
        ...commonProperties,
        color: colors[1]
    };

    // Symbol for state highways
    const paymentSym = {
        ...commonProperties,
        color: colors[2]
    };

    // Symbol for other major highways
    const legalSym = {
        ...commonProperties,
        color: colors[3]
    };

    const appraiSym = {
        ...commonProperties,
        color: colors[4]
    };

    const exproSym = {
        ...commonProperties,
        color: colors[5]
    };

    // Symbol for other major highways
    const otherSym = {
        ...commonProperties,
        color: colors[6]
    };



    const hwyRenderer = {
        type: "unique-value", // autocasts as new UniqueValueRenderer()
        defaultSymbol: otherSym,
        defaultLabel: "Other",
        field: "StatusLA",

        uniqueValueInfos: [
            {
                value: "0", // code for interstates/freeways
                symbol: handedSym,
                label: "Handed-Over"
            },
            {
                value: "1", // code for U.S. highways
                symbol: paidSym,
                label: "Paid"
            },
            {
                value: "2", // code for U.S. highways
                symbol: paymentSym,
                label: "For Payment Processing"
            },
            {
                value: "3", // code for U.S. highways
                symbol: legalSym,
                label: "For Legal Pass"
            },
            {
                value: "4", // code for U.S. highways
                symbol: appraiSym,
                label: "For Appraisal/Offer to Buy"
            },
            {
                value: "5", // code for U.S. highways
                symbol: exproSym,
                label: "For Expro"
            },
        ]
    };

    //Add lot Layer

    var lotLayer = new FeatureLayer({
        portalItem: {
            id: "dca1d785da0f458b8f87638a76918496",
            portal: {
                url: "https://gis.railway-sector.com/portal"
            }
        },
        layerId: 7,
        renderer: hwyRenderer,
    });
    map.add(lotLayer);

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
    map.add(isf_layer)



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



    //Adding layerlist
    var layerList = new LayerList({
        view: view,
        selectionEnabled: true,
        container: "layers-container",
        listItemCreatedFunction: function (event) {
            const item = event.item;
            if (
                item.title === "ROW" ||
                item.title === "Structure Boundary" ||
                item.title === 'Status of Relocation (ISF)'
            ){
                item.visible = false;
            }
            if (item.layer.type != "group"){ // don't show legend twice
              item.panel = {
                content: "legend",
                open: true
              };
            }
          }
    });
    

    //Adding basemaps
    const basemaps = new BasemapGallery({
        view,
        container: "basemaps-container"
    });



    //Full Screen Logo
    view.ui.add(
        new Fullscreen({
            view: view,
            element: viewDiv
        }),
        "top-right"
    );

    //Adding legends

    const land_legend = new Legend ({
        view: view,
        container: "legend-container",
        layerInfos: [
            {
                layer: lotLayer,
                title: ""
            },
        ],

    });


    //Calcite Action Bar
    let activeWidget;

    const handleActionBarClick = ({ target }) => {
        if (target.tagName !== "CALCITE-ACTION") {
            return;
        }

        if (activeWidget) {
            document.querySelector(`[data-action-id=${activeWidget}]`).active = false;
            document.querySelector(`[data-panel-id=${activeWidget}]`).hidden = true;
        }

        const nextWidget = target.dataset.actionId;
        if (nextWidget !== activeWidget) {
            document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
            document.querySelector(`[data-panel-id=${nextWidget}]`).hidden = false;
            activeWidget = nextWidget;
        } else {
            activeWidget = null;
        }
    };

    document.querySelector("calcite-action-bar").addEventListener("click", handleActionBarClick);

    let actionBarExpanded = false;

    document.addEventListener("calciteActionBarToggle", event => {
        actionBarExpanded = !actionBarExpanded;
        view.padding = {
            left: actionBarExpanded ? 135 : 45,
        };
    });

    document.querySelector("calcite-shell").hidden = false;
    document.querySelector("calcite-loader").hidden = true;

    //end of calcite action bar




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
    zoomToLayer(lotLayer);




    // CREATE TWO DROPDOWN LIST: FILTER BY MUNICIPALITY AND BARANGAY

    const muniDropdown = document.getElementById("muniSelect");
    const brgyDropdown = document.getElementById("brgySelect")


    //*********** */
    // Step 1: Query all the features from the feature layer
    //********** */

    view.when(function () {
        return lotLayer.when(function () {
            var query = lotLayer.createQuery();
            return lotLayer.queryFeatures(query);
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
            //var brgyArray = [];
            var query2 = lotLayer.createQuery();
            lotLayer.returnGeometry = true;
            return lotLayer.queryFeatures(query2).then(function (response) {
                var featuresQuery2 = response.features;
                var values = featuresQuery2.map(function (feature) {
                    return feature.attributes.Barangay;
                    /*var attributes = result.attributes;
                    const query2Values = attributes.Barangay;
                    brgyArray.push(query2Values);
                    console.log(query2Values);*/
                });
                return values;
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
            lotLayer.definitionExpression = null;
        } else {
            lotLayer.definitionExpression = "Municipality = '" + newValue + "'";
        }
        //zoomToLayer(lotLayer);
        //return queryLotGeometry();
    }

    function muniBrgyExpression(newValue1, newValue2) {
        if (newValue1 === undefined && newValue2 === undefined) {
            lotLayer.definitionExpression = null;

        } else if (newValue1 == 'None' && newValue2 !== 'None') {
            lotLayer.definitionExpression = "Barangay = '" + newValue2 + "'";

        } else if (newValue1 == 'None' && newValue2 == 'None') {
            lotLayer.definitionExpression = null;

        } else if (newValue1 !== 'None' && newValue2 == 'None') {
            lotLayer.definitionExpression = "Municipality = '" + newValue1 + "'";

        } else if (newValue1 !== 'None' && newValue2 !== 'None') {
            lotLayer.definitionExpression = "Municipality = '" + newValue1 + "'" + " AND " + "Barangay = '" + newValue2 + "'";
        }
        return queryLotGeometry();
    }



    //**************** */
    // Step. 3 Get all the geometries of the feature layer. The createQuery() method creates a query object
    // That repects the definitionExpression of the feature layer
    //**************** */


    function queryLotGeometry() {
        var lotQuery = lotLayer.createQuery();
        return lotLayer.queryFeatures(lotQuery).then(function (response) {
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

        zoomToLayer(lotLayer);

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

        zoomToLayer(lotLayer);
    });


    var dateList = new FeatureLayer({
        url: "https://services8.arcgis.com/h9TUF6x5VzqLQaYx/arcgis/rest/services/smartMap_dateList/FeatureServer/0",
    });
    dateList.load().then(function () { });

    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


    var query3 = dateList.createQuery();
    query3.where = "code='LA' AND extension='n2'";
    dateList.queryFeatures(query3).then(function (response) {
        var values3 = response.features.map(function (feature) {
            return feature.attributes.latestDate;
        });

        //console.log(values3);
        const val = Math.max(...values3);
        const date = new Date(val);
        const yyyy = date.getFullYear();
        const mm = month[date.getMonth()];
        const dd = date.getDate();
        const latestDate = `As of ${mm} ${dd}, ${yyyy}`;
        console.log(latestDate);
        document.getElementById("dateDiv").innerHTML = latestDate;
    });

    // End of Dropdown list

    // PROGRESS CHART





});