/*
 ****************************************************************************
 * Map.js
 * Author: Jack Ngare
 * Description: Initialize the map and grid
 *****************************************************************************
 */

// Declare & Initialize variables
var map;
var locationGeocoder;
var searchType = "address";
var defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(24.20689, -124.291994),
    new google.maps.LatLng(48.922499, -56.879885));

var autocOptions = {
    bounds: defaultBounds,
    types: ['geocode']
};
var disableClickListener = false;

// Instatiation of the USNG mapping function
var usngConv = new USNG2();
var utmMap = new usngConv.UTM();

//Graticules are another word for 'overlays', just implemented as a whole instead of individually
var graticuleDisplay = null;

var rectangle;
var southEast,northWest;

//Initialize Map: Set Map Center, Zoom Level & Map Type
function initialize() {
    //Geocoding is the process of converting addresses (like "1600 Amphitheatre Parkway, Mountain View, CA") into geographic coordinates
    locationGeocoder = new google.maps.Geocoder();
    var mapOptions = {
        center: new google.maps.LatLng(-2.150359, 35.243393),
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("mapArea"),
        mapOptions);

    //Input address
    var inputAddr = document.getElementById('inputAddr');

    //Set grid display
    map.zoneon = true;

    //Instatiated the graticuleDisplay
    graticuleDisplay = new USNGGraticule(map, gridstyle);
    map.grid100kon = false;
    map.grid1kon = false;
    map.grid100mon = false;

    // Future Styling the map.
    /* var styles = [
     {
     "featureType": "landscape",
     "stylers": [
     {
     "saturation": -100
     },
     {
     "lightness": 60
     }
     ]
     },
     {
     "featureType": "road.local",
     "stylers": [
     {
     "saturation": -100
     },
     {
     "lightness": 40
     },
     {
     "visibility": "on"
     }
     ]
     },
     {
     "featureType": "transit",
     "stylers": [
     {
     "saturation": -100
     },
     {
     "visibility": "simplified"
     }
     ]
     },
     {
     "featureType": "administrative.province",
     "stylers": [
     {
     "visibility": "off"
     }
     ]
     },
     {
     "featureType": "water",
     "stylers": [
     {
     "visibility": "on"
     },
     {
     "lightness": 30
     }
     ]
     },
     {
     "featureType": "road.highway",
     "elementType": "geometry.fill",
     "stylers": [
     {
     "color": "#ef8c25"
     },
     {
     "lightness": 40
     }
     ]
     },
     {
     "featureType": "road.highway",
     "elementType": "geometry.stroke",
     "stylers": [
     {
     "visibility": "off"
     }
     ]
     },
     {
     "featureType": "poi.park",
     "elementType": "geometry.fill",
     "stylers": [
     {
     "color": "#b6c54c"
     },
     {
     "lightness": 40
     },
     {
     "saturation": -40
     }
     ]
     },
     {}
     ];

     // Create a new StyledMapType object, passing it the array of styles,
     // as well as the name to be displayed on the map type control.
     var styledMap = new google.maps.StyledMapType(styles,
     {name: "Styled Map"});

     //Associate the styled map with the MapTypeId and set it to display.
     map.mapTypes.set('map_style', styledMap);
     map.setMapTypeId('map_style');
     */

    //initialize the autocomplete function on the address input
    autocomplete = new google.maps.places.Autocomplete(inputAddr, autocOptions);

    //add a listener for the autocomplete choice
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        document.getElementById('btnSearch').click();
    });


    //Marker Integrations
    google.maps.event.addListener(map, 'click', function (event) {
        if (disableClickListener) {
            return;
        } else {
            //place a marker at the point clicked
            createMarker(event.latLng);


        var mouseLL=event.latLng;
        var mouseUSNG = usngConv.fromLonLat({lon:mouseLL.lng(),lat:mouseLL.lat()},4);


        var locati=mouseUSNG.substring(0,6);
        var leftBottomUSNG=mouseUSNG.substring(6,10);
        var rightTopUSNG=mouseUSNG.substring(11,15);
        console.log('Location noma :' + locati);

        //usngZlev=8;
        //map.setZoom(usngZlev);

        //37N DC 7996 0840
        //37N DC 7999 0849

        var leftBottomLL = usngConv.toLonLat(locati+leftBottomUSNG+'0'+rightTopUSNG+'0',null);
        southEast=locati+leftBottomUSNG+'0'+rightTopUSNG+'0';
        northWest=locati+leftBottomUSNG+'99'+rightTopUSNG+'99';

        
        var rightTopLL = usngConv.toLonLat(locati+leftBottomUSNG+'99'+rightTopUSNG+'99',null);


        console.log('Location Left Botoom :' + JSON.stringify(leftBottomLL));
        //console.log('Location Top Botoom :' + JSON.stringify(leftTopLL));
        //console.log('Location Rigth Botoom :' + JSON.stringify(rightBottomLL));
        console.log('Location Right Top :' + JSON.stringify(rightTopLL));
        

        rectangle = new google.maps.Rectangle({ 
        
          
        fillColor: 'red',     
        map: map,   
        bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
        //new google.maps.LatLng(leftTopLL.lat,leftTopLL.lon),
        //new google.maps.LatLng(rightBottomLL.lat,rightBottomLL.lon),
        new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
        });     


        }
    });

    google.maps.event.addListener(map, 'mousemove', function (event) {
        var mouseLatLng = event.latLng;
        var mouseUSNG = usngConv.fromLonLat({lon: mouseLatLng.lng(), lat: mouseLatLng.lat()}, 4);
        document.getElementById("coordinateInfo").innerHTML = "<em>" + mouseUSNG + "<\/em>"+ "<br \/>"+ mouseLatLng+"<br \/>";
    });

    map.addListener('zoom_changed',function() {
        console.log("Current zoom level is: "+map.getZoom());

            console.log("South East " + southEast);////37M ET 3190 7660

            console.log("North West " + northWest);//37M ET 31999 76699


            if(map.getZoom()==12){
                console.log("Hapa");
                
                var baseAddress=southEast.substring(0,6);
                var baseLon=southEast.substring(6,9);
                var baseLat=southEast.substring(11,14);


                var leftBottomLL = usngConv.toLonLat(baseAddress+baseLon+'00'+baseLat+'00',null);
                var rightTopLL = usngConv.toLonLat(baseAddress+baseLon+'99'+baseLat+'99',null);


                rectangle.setOptions({ 
          
                  
                fillColor: 'red',  
               
                map: map,   
                bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                });     


            }else{
                if(map.getZoom()==11){
                        
                        //37M CS 6580 7940
                        //37M DS 0490 4070
                        //36N VG 0740 3600
                        var baseAddress=southEast.substring(0,6);
                        var baseLon=southEast.substring(6,9);
                        var baseLat=southEast.substring(11,14);

                        var newBaseLon = parseInt(baseLon);
                        var newBaseLat =parseInt(baseLat);
                        newBaseLat+=1;
                        var newTopRightLon = parseInt(baseLon);
                        newTopRightLon+=1;
                        var newTopRightLat = parseInt(baseLat);
                        newTopRightLat+=1;

                        console.log('Base Lon : ' + baseLon + ' Base Lat: ' + baseLat + ' New Base Lon : ' + newBaseLon + ' : ' + newBaseLat);

                        var leftBottomLL = usngConv.toLonLat(baseAddress+newBaseLon+'00'+baseLat+'00',null);
                        var rightTopLL = usngConv.toLonLat(baseAddress+newTopRightLon+'99'+newTopRightLat+'99',null);

                        console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                        console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                        rectangle.setOptions({ 
                  
                           
                        fillColor: 'red',  
                         
                        map: map,   
                        bounds: new google.maps.LatLngBounds(
                        new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                        new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                        });     

                    }

                     if(map.getZoom()==10){
                        
                        //37M CS 6580 7940
                        //37M DS 0490 4070
                        //37N CD 2670 3990
                        var baseAddress=southEast.substring(0,6);
                       
                        var leftBottomLL = usngConv.toLonLat(baseAddress+'0000'+'0000',null);
                        var rightTopLL = usngConv.toLonLat(baseAddress+'9999'+'9999',null);

                        console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                        console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                        rectangle.setOptions({ 
                  
                           
                        fillColor: 'red',  
                          
                        map: map,   
                        bounds: new google.maps.LatLngBounds(
                        new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                        new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                        });     

                    }

                    if(map.getZoom()<6){
                        
                        //37M CS 6580 7940
                        //37M DS 0490 4070
                        //37N CD 2670 3990
                        var baseAddress=southEast.substring(0,6);
                       
                        var leftBottomLL = usngConv.toLonLat(baseAddress,null);
                        var rightTopLL = usngConv.toLonLat(baseAddress,null);

                        console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                        console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                        rectangle.setOptions({ 
                  
                          
                        fillColor: 'red',   
                        map: map,   
                        bounds: new google.maps.LatLngBounds(
                        new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                        new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                        });     

                    }
                }

    });

}
//Start the search, depending on what has been entered (LongLat, Address and USGN)
function startSearch(addrTxt, USNGTxt) {
    //console.log("Starting Text Search of type: "+searchType);
    if (searchType === "address") {
        codeAddress(addrTxt);
    } else { //with only two search types, assume USNG if not address
        USNGTxt = USNGTxt.toLocaleUpperCase();
        convUSNG(USNGTxt);
    }
}

//Set searchType variable so it can be used later if necessary
function setSearchType(radiotype) {
    searchType = radiotype;
    if (searchType === "usng") {
        document.getElementById('radioUSNG').checked = true;
        //minimize the Address input in small screens. Hiding works, but not quite what we want
        var inputAddr = document.getElementById('inputAddrTxt');
        //inputAddr.style.visibility='hidden';
    } else {
        document.getElementById('radioAddress').checked = true;
        //minimize the USNG input in small screens
        var inputUSNG = document.getElementById('inputUSNGTxt');
        //inputUSNG.style.visibility='hidden';
    }
}

//Geocode the address, pan/zoom the map, and create a marker via the markers.js script
function codeAddress(addrTxt) {
    var address = addrTxt;
    locationGeocoder.geocode({'address': address}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            map.fitBounds(results[0].geometry.viewport);
            createMarker(results[0].geometry.location, results[0].formatted_address);
        } else {
            alert("Geocode was not found for the following reason: " + status);
        }
    });
}

//Convert a USNG string to a lat long for a marker and zooming
function convUSNG(txt) {
    var usngZlev = null; //set up a zoom level for use later
    try {
        var foundLLobj = usngConv.toLonLat(txt, null);
    }
    catch (err) {
        alert(err);
        return null;
    }
    //console.log("Lat long components are: Precision - "+foundLLobj.precision+" Lat:"+foundLLobj.lat+" Long:"+foundLLobj.lon);
    //trying to get to 0 = 100km, 1 = 10km, 2 = 1km, 3 = 100m, 4 = 10m, 5 = 1m, ...
    if (foundLLobj.precision === 0) {
        usngZlev = 6;
    }
    else if (foundLLobj.precision === 1) {
        usngZlev = 10;
    }
    else if (foundLLobj.precision === 2) {
        usngZlev = 12;
    }
    else if (foundLLobj.precision === 3) {
        usngZlev = 14;
    }
    else if (foundLLobj.precision === 4) {
        usngZlev = 16;
    }
    else if (foundLLobj.precision === 5) {
        usngZlev = 18;
    }
    else {
        usngZlev = 21;
    }

    map.setZoom(usngZlev);
    console.log("New zoom level is: "+usngZlev);
    var foundLatLng = new google.maps.LatLng(foundLLobj.lat, foundLLobj.lon);
    map.setCenter(foundLatLng);
    createMarker(foundLatLng, null);
}

//toggle the listener on the map click event
function mapClickListenerToggle() {
    if (disableClickListener) {
        //console.log("Turning ON the map click listener.");
        disableClickListener = false;
    } else {
        //console.log("Turning OFF the map click listener.");
        disableClickListener = true;
    }
}

// grid style passed to USNGGraticule
var gridstyle = {
    majorLineColor: "#0000ff",
    majorLineWeight: 4,
    majorLineOpacity: 0.2,
    semiMajorLineColor: "#0000",
    semiMajorLineWeight: 2,
    semiMajorLineOpacity: 0.2,
    minorLineColor: "blue",
    minorLineWeight: 1,
    minorLineOpacity: 0.3,
    fineLineColor: "#ff6633",
    fineLineWeight: 1,
    fineLineOpacity: 0.3,
    finestLineColor: "#000000",
    finestLineWeight: 1,
    finesterLineOpacity: 0.2,
    finesterLineColor: "#6600ff",
    finesterLineWeight: 1,
    finestLineOpacity: 0.2,
    majorLabelClass: "majorGridLabel",
    semiMajorLabelClass: "semiMajorGridLabel",
    minorLabelClass: "minorGridLabel",
    fineLabelClass: "fineGridLabel",
    finestLabelClass: "finestGridLabel",
    finesterLabelClass: "finesterGridLabel"

};

//Debug variable. Set to true while developing, false when testing
var debug = true;



