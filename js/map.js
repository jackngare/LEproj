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
                var mouseUSNG = usngConv.fromLonLat({lon:mouseLL.lng(),lat:mouseLL.lat()},5);

                var locati=mouseUSNG.substring(0,6);
                var leftBottomUSNG=mouseUSNG.substring(6,12);
                var rightTopUSNG=mouseUSNG.substring(12,18);
                

                //37N DC 7996 0840
                //37N DC 7999 0849
                //37N EB 99990 99990

                var leftBottomLL = usngConv.toLonLat(locati+leftBottomUSNG+'0'+rightTopUSNG+'0',null);
                southEast=locati+leftBottomUSNG+'0'+rightTopUSNG+'0';
                northWest=locati+leftBottomUSNG+'99'+rightTopUSNG+'99';

                
                var rightTopLL = usngConv.toLonLat(locati+leftBottomUSNG+'99'+rightTopUSNG+'99',null);


                console.log('Location Left Botoom :' + JSON.stringify(leftBottomLL));
                console.log('Location Right Top :' + JSON.stringify(rightTopLL));
                

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                map: map,   
                bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                });     

                map.setZoom(9);
                map.panTo(event.latLng);
                }
            });

            google.maps.event.addListener(map, 'mousemove', function (event) {
                var mouseLatLng = event.latLng;
                var mouseUSNG = usngConv.fromLonLat({lon: mouseLatLng.lng(), lat: mouseLatLng.lat()}, 5);
                document.getElementById("coordinateInfo").innerHTML = "<em>" + mouseUSNG + "<\/em>"+ "<br \/>"+ mouseLatLng+"<br \/>";
            });

            map.addListener('zoom_changed',function() {
                console.log("Current zoom level is: "+map.getZoom());

                    console.log("South East " + southEast);//South East 37N DB 537240 748440

                    console.log("North West " + northWest);//North West 37N DB 5372499 7484499


                    if(map.getZoom()==12){
                        
                        var baseAddress=southEast.substring(0,6);
                        var baseLon=southEast.substring(6,9);
                        var baseLat=southEast.substring(13,16);


                        var leftBottomLL = usngConv.toLonLat(baseAddress+baseLon+'00'+baseLat+'00',null);
                        var rightTopLL = usngConv.toLonLat(baseAddress+baseLon+'99'+baseLat+'99',null);


                        rectangle.setOptions({
                            map: map,  
                            bounds: new google.maps.LatLngBounds(
                                new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                                new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                                });     

                        var panLocation = new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon);
                        map.panTo(panLocation);

                    }else{
                        if(map.getZoom()==11){
                                
                                //37M CS 6580 7940
                                //37M DS 0490 4070
                                //36N VG 0740 3600
                                //37M ET 0260 7660

                                var baseAddress=southEast.substring(0,6);
                        var baseLon=southEast.substring(6,9);
                        var baseLat=southEast.substring(13,16);

                                var newBaseLon = parseInt(baseLon);
                                var newBaseLat =parseInt(baseLat);
                                newBaseLat+=1;
                                var newTopRightLon = parseInt(baseLon);
                                newTopRightLon+=1;
                                var newTopRightLat = parseInt(baseLat);
                                newTopRightLat+=1;

                                console.log('Base Lon : ' + baseLon + ' Base Lat: ' + baseLat + ' New Base Lon : ' + newBaseLon + ' : ' + newBaseLat);

                                var leftBottomLL = usngConv.toLonLat(baseAddress+baseLon+'00'+baseLat+'00',null);
                                var rightTopLL = usngConv.toLonLat(baseAddress+baseLon+'99'+baseLat+'99',null);

                                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                                
                                 rectangle.setOptions({
                                    map: map,  
                                bounds: new google.maps.LatLngBounds(
                                    new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                                    new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                                    });     

                                var panLocation = new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon);
                                map.panTo(panLocation);

                            }

                             if(map.getZoom()==10){
                                
                                //37M CS 6580 7940
                                //37M DS 0490 4070
                                //37N CD 2670 3990

                                console.log('Hapa ni zoom level 10');
                                
                                var baseAddress=southEast.substring(0,6);
                                var baseLon=southEast.substring(6,9);
                                 var baseLat=southEast.substring(13,16);

                               var leftBottomLL = usngConv.toLonLat(baseAddress+baseLon+'00'+baseLat+'00',null);
                                var rightTopLL = usngConv.toLonLat(baseAddress+baseLon+'99'+baseLat+'99',null);

                                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                                rectangle.setOptions({
                                map: map,   
                                bounds: new google.maps.LatLngBounds(
                                new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                                new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                                });     

                                var panLocation = new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon);
                                map.panTo(panLocation);
                            }

                            if(map.getZoom()==13){
                                
                                //37M CS 6580 7940
                                //37M DS 0490 4070
                                //37N CD 2670 3990

                                console.log('Hapa ni zoom level 10');
                                
                                var baseAddress=southEast.substring(0,6);
                                var baseLon=southEast.substring(6,10);
                                var baseLat=southEast.substring(13,17);

                               var leftBottomLL = usngConv.toLonLat(baseAddress+baseLon+'00'+baseLat+'00',null);
                                var rightTopLL = usngConv.toLonLat(baseAddress+baseLon+'99'+baseLat+'99',null);

                                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                                rectangle.setOptions({
                                map: map,   
                                bounds: new google.maps.LatLngBounds(
                                new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                                new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                                });     

                                var panLocation = new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon);
                                map.panTo(panLocation);
                            }

                            if(map.getZoom()==18){
                                
                                //37M CS 6580 7940
                                //37M DS 0490 4070
                                //37N CD 2670 3990

     //                           console.log('Hapa ni zoom level 10');
                                
                                var baseAddress=southEast.substring(0,6);
                                var baseLon=southEast.substring(6,10);
                                var baseLat=southEast.substring(13,17);

                               var leftBottomLL = usngConv.toLonLat(baseAddress+baseLon+'00'+baseLat+'00',null);
                                var rightTopLL = usngConv.toLonLat(baseAddress+baseLon+'99'+baseLat+'99',null);

                                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                                rectangle.setOptions({
                                map: map,   
                                bounds: new google.maps.LatLngBounds(
                                new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                                new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                                });     

                                var panLocation = new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon);
                                map.panTo(panLocation);
                            }

                            if(map.getZoom()>=19){
                                
                                //37M CS 6580 7940
                                //37M DS 0490 4070
                                //37N CD 2670 3990
                                //South East 37N DB 537240 748440

 //                               console.log('Hapa ni zoom level 19');
                                
                                var baseAddress=southEast.substring(0,6);
                                var baseLon=southEast.substring(6,11);
                                var baseLat=southEast.substring(13,18);

                               var leftBottomLL = usngConv.toLonLat(baseAddress+baseLon+'00'+baseLat+'00',null);
                                var rightTopLL = usngConv.toLonLat(baseAddress+baseLon+'99'+baseLat+'99',null);

                                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                                rectangle.setOptions({
                                map: map,   
                                bounds: new google.maps.LatLngBounds(
                                new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                                new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                                });     

                                var panLocation = new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon);
                                map.panTo(panLocation);
                            }

                            if(map.getZoom()==21){
                                
                                //37M CS 6580 7940
                                //37M DS 0490 4070
                                //37N CD 2670 3990

                                console.log('Hapa ni zoom level 10');
                                
                                var baseAddress=southEast.substring(0,6);
                                var baseLon=southEast.substring(6,12);
                                var baseLat=southEast.substring(13,19);

                               var leftBottomLL = usngConv.toLonLat(baseAddress+baseLon+'000'+baseLat+'000',null);
                                var rightTopLL = usngConv.toLonLat(baseAddress+baseLon+'999'+baseLat+'999',null);

                                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                                rectangle.setOptions({
                                map: map,   
                                bounds: new google.maps.LatLngBounds(
                                new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                                new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                                });     

                                var panLocation = new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon);
                                map.panTo(panLocation);
                            }
                            if(map.getZoom()==9){
                            
                            var baseAddress=southEast.substring(0,6);
                           
                            var leftBottomLL = usngConv.toLonLat(baseAddress+'0000'+'0000',null);
                            var rightTopLL = usngConv.toLonLat(baseAddress+'9999'+'9999',null);

                            console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                            console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                            rectangle.setOptions({
                            map: map,   
                            bounds: new google.maps.LatLngBounds(
                            new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                            new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                            });     

                            var panLocation = new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon);
                            map.panTo(panLocation);
                        }


                            if(map.getZoom()==6){
                               
                                var baseAddress=southEast.substring(0,6);
                               
                                var leftBottomLL = usngConv.toLonLat(baseAddress+'0000'+'0000',null);
                                var rightTopLL = usngConv.toLonLat(baseAddress+'9999'+'9999',null);

                                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                                rectangle.setOptions({
                                map: map,   
                                bounds: new google.maps.LatLngBounds(
                                new google.maps.LatLng(leftBottomLL.lat,leftBottomLL.lon),
                                new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon))
                                });     

                                var panLocation = new google.maps.LatLng(rightTopLL.lat,rightTopLL.lon);
                                map.panTo(panLocation);
                            }


                            if(map.getZoom()<=5){
                                /*
                                Calculating the eastern and western boundaries of a UTM is very straightforward.  
                                Developed by the U.S. Army, the Universal Transverse Mercator (UTM) is an international 
                                plane (rectangular) coordinate system. In the coordinate system, the world is divided into 
                                60 zones of 6 degrees longitude. Each zone extends 3 degrees east and west from its 
                                central meridian and are numbered consecutively west to east from the 180-degree meridian. 
                                Transverse Mercator projections may then be applied to each zone.


                                Here’s How:
                                    • UTM zones are all 6 degrees wide and increase from west to east starting at the -180 degree mark.
                                    • Calculate the eastern boundary of any UTM zone by multiplying the zone number by 6 and substract 180.
                                    • Subtract 6 degrees to obtain the western boundary.
                                    • Therefore to find the eastern boundary of UTM zone 11: Eastern boundary of zone 11 = (11 * 6) – 180 = -114 degrees.
                                    • Western boundary of zone 11 = -114 – 6 = -120 degrees.

                                Latitude is also divided into zones, but less regularly. Zones are lettered from A at the 
                                South Pole to Z at the North. The circle south of 80 degrees is divided into two zones, A and B. 
                                Thereafter zones are 8 degrees wide. Zone M is just south of the equator and N is north. Zone T, 
                                between 40 and 48 degrees north, includes Green Bay. Zone X, from 72 to 84 degrees north, 
                                is 12 degrees wide and zones Y and Z cover the north polar region north of 84 degrees. 
                                I and O are not used because they can be too easily confused with numbers.


                                */



                                var zoneNo=southEast.substring(0,2);
                                var latZone=southEast.substring(2,3);
                                
                                var easternBoundary = parseInt(zoneNo);
                                easternBoundary=(easternBoundary*6)-180;
                                var westernBoundary=easternBoundary-6;

                                var southernBoundary;

                                switch(latZone)
                                {
                                    case "F":
                                        southernBoundary=-56;
                                        break;
                                    case "G":
                                        southernBoundary=-48;
                                        break;
                                    case "H":
                                        southernBoundary=-40;
                                        break;
                                    case "J":
                                        southernBoundary=-32;
                                        break;
                                    case "K":
                                        southernBoundary=-24;
                                        break;
                                    case "L":
                                        southernBoundary=-16;
                                        break;
                                    case "M":
                                        southernBoundary=-8;
                                        break;
                                    case "N":
                                        southernBoundary=0;
                                        break;
                                    case "P":
                                        southernBoundary=8;
                                        break;
                                    case "Q":
                                        southernBoundary=16;
                                        break;
                                    case "R":
                                        southernBoundary=24;
                                        break;
                                    case "S":
                                        southernBoundary=32;
                                        break;
                                    case "T":
                                        southernBoundary=40;
                                        break;
                                    case "U":
                                        southernBoundary=48;
                                        break;
                                    case "V":
                                        southernBoundary=56;
                                        break;
                                    case "W":
                                        southernBoundary=64;
                                        break;
                                }

                
                                var northernBoundary=parseInt(southernBoundary);
                                northernBoundary += 8;



                                console.log('Location 11 North :' + northernBoundary + ' Southern' + southernBoundary);
                                console.log('Location 11 Eastern :' + easternBoundary + ' Western' + westernBoundary);
                                rectangle.setOptions({
                                map: map,   
                                bounds: new google.maps.LatLngBounds(
                                new google.maps.LatLng(southernBoundary,westernBoundary),
                                new google.maps.LatLng(northernBoundary,easternBoundary))
                                });  

                                var panLocation = new google.maps.LatLng(southernBoundary,easternBoundary)
                                map.setCenter(panLocation);   

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


