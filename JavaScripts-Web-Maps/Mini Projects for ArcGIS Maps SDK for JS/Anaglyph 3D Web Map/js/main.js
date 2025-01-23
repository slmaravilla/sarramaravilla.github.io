var b1 = 'average';
var b2 = 'color-burn';
var b3 = 'color-dodge';
var b4 = 'color';
var b5 = 'darken';
var b6 = 'destination-atop';
var b7 = 'destination-in';
var b8 = 'destination-out';
var b9 = 'destination-over';
var b10 = 'difference';
var b11 = 'exclusion';
var b12 = 'hard-light';
var b13 = 'hue';
var b14 = 'invert';
var b15 = 'lighten';
var b16 = 'lighter';
var b17 = 'luminosity';
var b18 = 'minus';
var b19 = 'multiply';
var b20 = 'normal';
var b21 = 'overlay';
var b22 = 'plus';
var b23 = 'reflect';
var b24 = 'saturation';
var b25 = 'screen';
var b26 = 'soft-light';
var b27 = 'source-atop';
var b28 = 'source-in';
var b29 = 'source-out';
var b30 = 'vivid-light';
var b31 = 'xor';

var lat = 35.383223;
var lng = 139.3288247;


require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Home",
    "esri/widgets/Fullscreen",
    "esri/layers/TileLayer",
    "esri/layers/WebTileLayer",
    "esri/layers/VectorTileLayer",
], function (
    Map,
    MapView,
    Home,
    Fullscreen,
    TileLayer,
    WebTileLayer,
    VectorTileLayer) {


        const imagery = new TileLayer({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
            blendMode: b2,
            opacity: 0.8,
            copyright: 
                    '<a href="https://staridasgeo.maps.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9" target="_blank" rel="nofollow">' + 
                        'World Imagery' + 
                    '</a>'
            });

        const transportation = new TileLayer({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer',
            blendMode: b17,
            opacity: 0.6,
            copyright: 
                    '<a href="https://staridasgeo.maps.arcgis.com/home/item.html?id=94f838a535334cf1aa061846514b77c7" target="_blank" rel="nofollow">' + 
                        'World Transportation' + 
                    '</a>'
            });

        const anaglyph = new WebTileLayer({
            urlTemplate: 'https://maps.gsi.go.jp/xyz/anaglyphmap_gray/{level}/{col}/{row}.png',
            blendMode: b19,
            opacity:1.0,
            copyright:
                    '<a href="https://staridasgeo.maps.arcgis.com/home/item.html?id=5003e6487cf44d388606284e20c655f9" target="_blank" rel="nofollow">' + 
                        'Anaglyph Gray' + 
                    '</a>'
            });

        const labels = new TileLayer({
            url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Reference/MapServer',
            blendMode: b20,
            opacity:1.0,
            copyright:
                    '<a href="https://staridasgeo.maps.arcgis.com/home/item.html?id=87fcdf91a0f14e4a9fda40a763c6f2b8" target="_blank" rel="nofollow">' + 
                        'World Light Gray Reference' + 
                    '</a>'
            });

        const contours = new VectorTileLayer({
            url: 'https://basemaps.arcgis.com/arcgis/rest/services/World_Contours_v2/VectorTileServer',
            blendMode: b20,
            opacity:1.0,
            copyright:
                    '<a href="https://www.arcgis.com/home/item.html?id=51ca3ce6a16d4080ad955dacd6dd2fe2" target="_blank" rel="nofollow">' + 
                        'World Contours' + 
                    '</a>'
            });

        const map = new Map({
          //basemap: 'satellite',
            layers: [
                imagery,
                contours,
                transportation,
                anaglyph,
                labels
                ]
            });

        const view = new MapView({
            container: 'viewDiv',
            map: map,
            scale: 550000,
            center: [lng,lat],
            background: {
                color: '#f9f9f9'
              }
            });

        const homeBtn = new Home({
            view: view
            });
 
        fullscreen = new Fullscreen({
            view: view
            });

        view.ui.add(homeBtn, 'top-left');
        view.ui.add(fullscreen, 'top-left');
        view.ui.add('mapTitle', 'top-right');
        view.ui.add('logo', 'bottom-right');
        






});