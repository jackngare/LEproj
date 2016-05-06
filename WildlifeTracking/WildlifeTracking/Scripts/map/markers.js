/**
 *  markers.js
 *  Date: 01/03/16
 *  Author: Jack Ngare
 *  Description:
 *  This code sets makers and diplays the USNG and LatLng co-ordinates on a balloon in the map
 *
 **/

//instantiate the marker window
var markerWindow = new google.maps.InfoWindow();
var thismarker;

// create and display a marker with usng, lat/lng, and other info
function createMarker(latlng, strAddress) {
    var marker = new google.maps.Marker({
        position: latlng,
        draggable: true,
        animation: google.maps.Animation.DROP,
        map: map
    });

//open window and content of marker
    google.maps.event.addListener(marker, "click", function () {
       // console.log("Building info window on click event.");
        mapClickListenerToggle();
        thismarker = marker;
        var zLev = map.getZoom();
        var displayBaloon = "";
        displayBaloon += buildCoordString1(latlng, zLev);
        displayBaloon += '<br \/><br \/><input type=\"button\" value=\"Delete marker\" onclick=removeOneMarker()>';
        markerWindow.setContent(displayBaloon);
        markerWindow.open(map, marker);
    });
}

//Close marker
function removeOneMarker() {
    markerWindow.close();
    thismarker.setMap(null);
    setTimeout(function () {
        mapClickListenerToggle();
    }, 5);
}

google.maps.event.addListener(markerWindow, "closeclick", function () {
    mapClickListenerToggle();
});


//TODO: Cleaner to manage zoom levels centrally
function buildCoordString1(point, zLev) {
    var lnglat = {lon: point.lng(), lat: point.lat()}; //convert the gmaps latlng object to the format the USNG2 function expects
    if (zLev < 8) {
        precision = 0;
    }
    else if (zLev < 12) {
        precision = 1;
    }
    else if (zLev < 14) {
        precision = 2;
    }
    else if (zLev < 18) {
        precision = 3;
    }
    else if (zLev < 21) {
        precision = 4;
    }
    else {
        precision = 5;
    }
    //Coordinates and grid display on the marker
    var ngCoords = usngConv.fromLonLat(lnglat, precision);
    coordStr = "<i>USNG:</i> <b>" + ngCoords + "</b>";
    console.log(ngCoords +" " + lltoDMin(lnglat).lat);
    var degDecMin = lltoDMin(lnglat);
    coordStr += "<br \/><i>Lng Lat:<\/i><b> " + degDecMin.lat + ", " + degDecMin.lng + "<\/b>"
    return (coordStr)
}