require([
    "esri/config",
    "esri/Map",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Daylight",
    "esri/widgets/Compass",
    "esri/widgets/Expand",
    "esri/widgets/Fullscreen",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/layers/FeatureLayer",
    "esri/widgets/ElevationProfile",
    "esri/layers/ElevationLayer"
], function (esriConfig, Map, BasemapToggle, Daylight, Compass, Expand, Fullscreen, MapView, SceneView, FeatureLayer, ElevationProfile, ElevationLayer) {

    const map = new Map({
        basemap: "satellite",
        ground: "world-elevation"
    });

    const view = new SceneView({
        container: "viewDiv",
        map: map,
        camera: {
            spatialReference: { latestWkid: 3857, wkid: 102100 },
            position: [120.88, 16.60, 20000],

        },
        environment: {
            background: {
                type: "color", // autocasts as new ColorBackground()
                color: [0, 0, 0, 1]
            },
            // disable stars
            starsEnabled: false,
            //disable atmosphere
            atmosphereEnabled: true
        }
    });

    //Remove deafult widgets on the left
    view.ui.empty("top-left");
    //end

    //Add Basemap toggle
    const toggle = new BasemapToggle({
        view: view,
        nextBasemap: "topo-vector"
    });
    view.ui.add(toggle, "top-right");


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



    var trailPtLabelClass = {
        symbol: {
            type: "label-3d",// autocasts as new LabelSymbol3D()
            symbolLayers: [
                {
                    type: "text", // autocasts as new TextSymbol3DLayer()
                    material: {
                        color: "orange"
                    },
                    size: 12,
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
                screenLength: 50,
                maxWorldLength: 300,
                minWorldLength: 40
            },
            callout: {
                type: "line", // autocasts as new LineCallout3D()
                color: "white",
                size: 0.5,
                border: {
                    color: "grey"
                }
            }
        },
        labelPlacement: "above-center",
        labelExpressionInfo: {
            expression: "$feature.Name"
            //value: "{TEXTSTRING}"
        }
    }


    let trailPtSymbol = {
        type: "simple",  // autocasts as new SimpleRenderer()
        symbol: {
            type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
            size: 5,
            color: "white",
            outline: {  // autocasts as new SimpleLineSymbol()
                width: 0.5,
                color: [0, 0, 0, 0]
            }
        }
    };



    //Trailheads feature layer (lines)
    const trailsLayer = new FeatureLayer({
        url: "https://services8.arcgis.com/h9TUF6x5VzqLQaYx/arcgis/rest/services/MtPulagTrails/FeatureServer",
        outFields: ["*"],
    });
    map.add(trailsLayer);

    const trailsLayerPt = new FeatureLayer({
        url: "https://services8.arcgis.com/h9TUF6x5VzqLQaYx/arcgis/rest/services/MtPulagTrails_Pt/FeatureServer",
        renderer: trailPtSymbol,
        labelingInfo: [trailPtLabelClass],
        outFields: ["*"],
    });
    map.add(trailsLayerPt);


    // Zoom to selected layers with tilt
    function zoomToLayer(layer) {
        return layer.queryExtent().then(function (response) {
            view.goTo(
                {
                    target: response.extent,
                    tilt: 70
                }, {
                speedFactor: .5,
                //heading: view.camera.heading + 0.2
                //easing: "out-quint"
            },
            ).catch(function (error) {
                if (error.name != "AbortError") {
                    console.error(error);
                }
            });
        });
    }



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


    /*********************
    ****FILTER BY NAME****
    ********************/


    var hikeDesc = document.getElementById("hikeDesc");


    function updateDesc() {

        var query = trailsLayerPt.createQuery();
        trailsLayerPt.queryFeatures(query).then(function (response) {
            var stats = response.features[0].attributes;
            const type = stats.RouteType;

            console.log(type);
            hikeDesc.innerHTML = `${type}`;
        });

    }

    function openPanel() {
        document.getElementById("descPanel").style.display = "block";
    }

    function closePanel() {
        document.getElementById("descPanel").style.display = "none";
    }


    var hikeSelect = document.getElementById("hikeSelect");

    function getValues() {
        var testArray = [];
        var query = trailsLayer.createQuery();
        query.outFields = ["Name"];
        trailsLayer.returnGeometry = true;
        return trailsLayer.queryFeatures(query).then(function (response) {
            var stats = response.features;
            stats.forEach((result, index) => {
                var attributes = result.attributes;
                const values = attributes.Name;
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
        hikeSelect.options.length = 0;
        values.sort();
        values.unshift('All');
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.text = value;
            hikeSelect.add(option);
        });
    }

    getValues()
        .then(getUniqueValues)
        .then(addToSelect)




    hikeSelect.addEventListener("change", selectTrail);
    function selectTrail(event) {
        const selectedID = event.target.value;

        if (selectedID === "All") {
            trailsLayer.definitionExpression = null;
            trailsLayerPt.definitionExpression = null;

            zoomToLayer(trailsLayer);
            closePanel();

        } else {
            trailsLayer.definitionExpression = "Name = '" + selectedID + "'";
            trailsLayerPt.definitionExpression = "Name = '" + selectedID + "'";

            zoomToLayer(trailsLayer);
            updateDesc();
            openPanel();
        }

    }




    const elevationProfile = new ElevationProfile({
        view: view,
        profiles: [{
            //type: "query", // first profile line samples the ground elevation
            //source: {
            //queryElevation(geometry, options) {
            //return trailsLayer.queryElevation(geometry, { ...options, demResolution: 20 })
            //}
            //}
            //}, {
            type: "view" // second profile line samples the view and shows building profiles
        }],
        // hide the select button
        // this button can be displayed when there are polylines in the
        // scene to select and display the elevation profile for
        visibleElements: {
            selectButton: true
        }
    });
    //view.ui.add(elevationProfile, "bottom-right");

    var elevationProfileExpand = new Expand({
        view: view,
        content: elevationProfile,
        expandIconClass: "esri-icon-visible",
        group: "top-right"
    });
    view.ui.add(elevationProfileExpand, "top-right");

    //Remove the ui components
    view.ui.components = [];


});