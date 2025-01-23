require([
    "esri/Map",
    "esri/widgets/Compass",
    "esri/widgets/Expand",
    "esri/widgets/Fullscreen",
    "esri/views/SceneView",
    "esri/layers/FeatureLayer",
    "esri/widgets/ElevationProfile",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Legend",
    "esri/Graphic",
    "esri/layers/GraphicsLayer"
], function (Map, Compass, Expand, Fullscreen, SceneView,
    FeatureLayer, ElevationProfile, BasemapGallery, Legend, Graphic, GraphicsLayer) {

    const map = new Map({
        basemap: "satellite",
        ground: "world-elevation",
    });

    const view = new SceneView({
        container: "viewDiv",
        map: map,
        camera: {
            spatialReference: { latestWkid: 3857, wkid: 102100 },
            position: [120.89, 16.62, 35000],
        },
        environment: {
            starsEnabled: true,
            atmosphereEnabled: true
        },
        popup: {
            dockOptions: {
                buttonEnabled: false,
                breakpoint: false
            }
        },
    });


    //Label Class for TrailPt
    var trailPtLabelClass = {
        symbol: {
            type: "label-3d",
            symbolLayers: [
                {
                    type: "text",
                    material: {
                        color: "white"
                    },
                    size: 13,
                    color: "black",
                    haloColor: "black",
                    haloSize: 1,
                    font: {
                        family: "Times New Roman",
                    },
                }
            ],
            verticalOffset: {
                screenLength: 50,
                maxWorldLength: 300,
                minWorldLength: 40
            },
            callout: {
                type: "line",
                color: "white",
                size: 0.5,
                offset: 1.0,
                border: {
                    color: "grey"
                }
            }
        },
        labelPlacement: "above-center",
        labelExpressionInfo: {
            expression: "$feature.Name"
        }
    }

    //Renderer for TrailPt
    let trailPtSymbol = {
        type: "simple",
        symbol: {
            type: "simple-marker",
            size: 5,
            color: "white",
            outline: {
                width: 0.5,
                color: [0, 0, 0, 0]
            }
        }
    };



    //Label Class for the Mountain
    var mountainLabelClass = {
        symbol: {
            type: "label-3d",
            symbolLayers: [
                {
                    type: "text",
                    material: {
                        color: "#white",
                    },
                    font: {
                        family: "Georgia",
                        size: 15,
                        weight: "bold",
                    },
                }
            ],
            verticalOffset: {
                screenLength: 50,
                maxWorldLength: 300,
                minWorldLength: 40
            },
            callout: {
                type: "line",
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
        }
    }


    //Renderer for Mountain
    function getUniqueValueSymbol(name, color) {
        return {
            type: "point-3d",
            symbolLayers: [
                {
                    type: "icon",
                    resource: {
                        href: name
                    },
                    size: 30,
                    outline: {
                        color: "white",
                        size: 2
                    }
                }
            ],
            verticalOffset: {
                screenLength: 60,
                maxWorldLength: 400,
                minWorldLength: 50
            },
            callout: {
                type: "line",
                color: "white",
                size: 0.5,
                border: {
                    color: "grey"
                }
            }
        };
    }

    var mountainSymbol = {
        type: "unique-value",
        field: "Name",
        uniqueValueInfos: [
            {
                value: "Mt. Pulag",
                symbol: getUniqueValueSymbol("https://sarramaravilla.github.io/3D Interactive Hiking Trail Map/images/mountain_symbol.png", "#D13470")
            }
        ]
    };


    //Trailheads feature layer (lines)
    const trailsLayer = new FeatureLayer({
        url: "https://services8.arcgis.com/Pepo4NIyzp8KLnWc/arcgis/rest/services/MtPulagTrails/FeatureServer",
        layerId: 0,
        //elevationInfo: {
        //    mode: "relative-to-ground"
        //},
        outFields: ["*"],
        //hasZ: true,
    });
    map.add(trailsLayer);


    const trailsLayerPt = new FeatureLayer({
        url: "https://services8.arcgis.com/Pepo4NIyzp8KLnWc/arcgis/rest/services/Mt_Pulag_Hiking_Data/FeatureServer",
        renderer: trailPtSymbol,
        labelingInfo: [trailPtLabelClass],
        layerId: 3,
        outFields: ["*"],
    });
    map.add(trailsLayerPt);


    const trailshead = new FeatureLayer({
        url: "https://services8.arcgis.com/Pepo4NIyzp8KLnWc/arcgis/rest/services/Mt_Pulag_Hiking_Data/FeatureServer",
        layerId: 2,
        outFields: ["*"],
        elevationInfo: {
            mode: "relative-to-ground"
        },
    });
    map.add(trailshead);


    const mountainPt = new FeatureLayer({
        url: "https://services8.arcgis.com/Pepo4NIyzp8KLnWc/arcgis/rest/services/Mt_Pulag_Hiking_Data/FeatureServer",
        layerId: 1,
        outFields: ["*"],
        labelingInfo: [mountainLabelClass],
        renderer: mountainSymbol,
        elevationInfo: {
            mode: "relative-to-ground"
        },
    });
    map.add(mountainPt);


    const POIs = new FeatureLayer({
        url: "https://services8.arcgis.com/Pepo4NIyzp8KLnWc/arcgis/rest/services/Mt_Pulag_Hiking_Data/FeatureServer",
        layerId: 0,
        elevationInfo: {
            mode: "relative-to-ground"
        },
        popupTemplate: {
            content: [
                {
                    type: "media",
                    mediaInfos: [
                        {
                            title: "{Name}",
                            type: "image",
                            caption: "Source: {source}",
                            value: {
                                sourceURL: "{imgURL}"
                            }
                        }
                    ]
                },
            ]
        },
        outFields: ["*"]
    });
    map.add(POIs);

    view.popup.viewModel.includeDefaultActions = false;




    // Zoom to selected layers with tilt
    function zoomToLayer(layer) {
        return layer.queryExtent().then(function (response) {
            view.goTo(
                {
                    target: response.extent,
                    tilt: 60
                }, {
                speedFactor: .5,
            },
            ).catch(function (error) {
                if (error.name != "AbortError") {
                    console.error(error);
                }
            });
        });
    }


    /*********************
    ****FILTER BY NAME****
    ********************/

    var hikeDesc = document.getElementById("hikeDesc");

    function updateDesc() {
        var descQuery = trailsLayer.createQuery();
        trailsLayer.queryFeatures(descQuery).then(function (result) {
            var stats = result.features[0].attributes;
            const name = stats.Name;
            const length = stats.Length;
            const elevGain = stats.ElevGain;
            const hrs2summit = stats.HoursToSummit;
            const specs = stats.Specs;
            const diff = stats.Difficulty;
            const trailclass = stats.TrailClass;
            const jumpOff = stats.JumpOff;
            const features = stats.Features;

            console.log(features);
            hikeDesc.innerHTML = `<h2>${name}</h2><br>
                                  Length: <b>${length} km.</b><br>
                                  Elevation Gain: <b>${elevGain} m.</b><br>
                                  Average Walktime: <b>${hrs2summit}</b><br>
                                  Specifications: <b>${specs}</b><br>
                                  Difficulty Level: <b>${diff}</b><br>
                                  Trail Class: <b>${trailclass}</b><br>
                                  Jump-off Trail: <b>${jumpOff}</b><br>
                                  Features: <b>${features}</b> 
                                  `;
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
        var selQuery = trailsLayer.createQuery();
        selQuery.outFields = ["Name"];
        trailsLayer.returnGeometry = true;
        return trailsLayer.queryFeatures(selQuery).then(function (response) {
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
            trailshead.definitionExpression = null;
            POIs.definitionExpression = null;

            zoomToLayer(trailsLayer);
            closePanel();

        } else {
            trailsLayer.definitionExpression = "Name = '" + selectedID + "'";
            trailsLayerPt.definitionExpression = "Name = '" + selectedID + "'";
            trailshead.definitionExpression = "Trail = '" + selectedID + "'";
            POIs.definitionExpression = "Trail = '" + selectedID + "'";

            zoomToLayer(trailsLayer);
            updateDesc();
            openPanel();
        }

    }




    let basemapGallery = new BasemapGallery({
        view: view
    });
    const basemapGalleryExpand = new Expand({
        view,
        content: basemapGallery,
        expandIconClass: "esri-icon-basemap",
        group: "top-left"
    });

    view.ui.add(basemapGalleryExpand, {
        position: "top-left"
    });



    // Legend
    var legend = new Legend({
        view: view,
        container: document.getElementById("legendDiv"),
        layerInfos: [
            {
                layer: trailsLayer,
                title: "Trails"
            },
            {
                layer: trailshead,
                title: "Jump-off"
            },
            {
                layer: mountainPt,
                title: "Mountain"
            },
            {
                layer: POIs,
                title: "POI"
            }
        ]
    });


    var legendExpand = new Expand({
        view: view,
        content: legend,
        expandIconClass: "esri-icon-legend",
        group: "top-left"
    });
    view.ui.add(legendExpand, {
        position: "top-left"
    });


    //Adding the daylight widget
    /*const daylight = new Daylight({
        view: view,
        //play the animation twice as fast than the default one
        playSpeedMultiplier: 2,
        //disable the timezone selection button
        visibleElements: {
            timezone: false
        }
    }); view.ui.add(new Expand({ content: daylight, view: view, expanded: false }), "top-left");
    //end*/


    //Compass
    const compass = new Compass({
        view: view
    });
    view.ui.add(compass, "top-left");
    //end


    //Full Screen Logo
    view.ui.add(
        new Fullscreen({
            view: view,
            element: viewDiv
        }),
        "top-left"
    );//end


    let polylineSymbol = {
        type: "simple-line",  // autocasts as SimpleLineSymbol()
        color: [226, 119, 40],
        width: 4
    };


    var resultsLayer = new GraphicsLayer ();
    map.add(resultsLayer);

    var profileQuery = trailsLayer.createQuery();
    profileQuery.where = "Name = 'Ambangeg Trail'"
    profileQuery.returnGeometry = true;
    profileQuery.returnZ= true;
    trailsLayer.queryFeatures(profileQuery).then(function (response){
        resultsLayer.removeAll();
        var sss =response.features;
        sss.forEach((result) =>{
            var resultGraphic = new Graphic({
                geometry: result.geometry,
                symbol: polylineSymbol,
            });resultsLayer.add(resultGraphic)
        });
    });

    

   /* let polylineGraphic = new Graphic({
        geometry: trailsLayer,
        symbol: polylineSymbol,
    });
    view.graphics.add(polylineGraphic);*/

    const elevationProfile = new ElevationProfile({
        view: view,
        //input: resultsLayer,
        profiles: [{
            type: "view" // second profile line samples the view and shows building profiles
        }],
        visibleElements: {
            legend: false,
            clearButton: false,
            settingsButton: false,
            sketchButton: false,
            selectButton: false,
            uniformChartScalingToggle: true,
        }
    }); view.ui.add(elevationProfile, "bottom-left");

    elevationProfile.viewModel.input = resultsLayer;
    

    /*var elevationProfileExpand = new Expand({
        view: view,
        content: elevationProfile,
        expandIconClass: "esri-icon-visible",
        group: "top-left"
    });
    view.ui.add(elevationProfileExpand, "top-left");*/



    //Adding Camera Fly Through
    const play = document.getElementById("play");
    const pause = document.getElementById("pause");
    pause.style.display = 'none';

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

    play.addEventListener("click", () => {
        play.onclick = rotate;
        pause.onclick = function () {
            abort = true;
        };
    });

    // Animation play button
    view.ui.add(play, {
        position: "top-left"
    });

    view.ui.add(pause, {
        position: "top-left"
    });


    //Remove the ui components
    view.ui.components = [];

});