
//userController
app.controller('landingController', function ($scope, $filter,$q, userService, wildlifesightingService, speciesService, $timeout, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, NgMap) {
    $scope.OperType = 1;//1 Means New Entry
    $scope.searchMode = true;
    $scope.isAddress = true;
    $scope.date_rdv = $filter('date')(Date.now(), 'MM/dd/yyyy');
   

    // Instatiation of the USNG mapping function
    var usngConv = new USNG2();
    var utmMap = new usngConv.UTM();

    //Graticules are another word for 'overlays', just implemented as a whole instead of individually
    var graticuleDisplay = null;

    var rectangle, southEast, northWest;
    var markers = [];
    var rectangles = [];
    var infowindow = null;

    var vm = this;
    NgMap.getMap().then(function (map) {
        vm.map = map;

        //Instatiated the graticuleDisplay
        graticuleDisplay = new USNGGraticule(vm.map, gridstyle);
        getAllWildlifeSightings();
    });

    //changeAddressType
    $scope.changeAddressType = function () {
        if (!$scope.isAddress)
            $scope.isAddress = true;
        else
            $scope.isAddress = false;
        console.log('The value of IsAddress is ' + $scope.isAddress);
    }

    vm.shadeMarkerUTMZones = function () {
        clearRectangles();
        for (var i = 0; i < markers.length; i++) {
            drawUTMZone(markers[i].position);
        }
    }

    //get the number of species sighted
    getSpeciesCount = function (SpeciesID) {
        var speciesCount=0;
        
        for (var i = 0; i < vm.Wildlifesightings.length; i++) {
            if (vm.Wildlifesightings[i].Species.SpeciesID == SpeciesID) {
                speciesCount++;
            }
        }

        return speciesCount;
    }

    //get all the species 
    getAllSpecies();
    function getAllSpecies() {
        speciesService.getAllSpecies()
            .success(function (species) {
                $scope.Species = species;
            })
            .error(function (error) {
                $scope.status = 'Unable to load species data: ' + error.message;
            });
    };

    //get all the users
    getAllUsers();
    function getAllUsers(){
        userService.getAllUser()
            .success(function (users) {
                $scope.Users = users;
            })
            .error(function (error) {
                $scope.status = 'Unable to load users data: ' + error.message;
            });
    };

    function getAllWildlifeSightings() {
        wildlifesightingService.getAllWildlifesightings()
            .success(function (wildlifesightings) {
                vm.Wildlifesightings = wildlifesightings;
                var length = vm.Wildlifesightings.length;

                /* now inside your initialise function */
                infowindow = new google.maps.InfoWindow({
                    content: "holding..."
                });

                for (var i = 0; i < length; i++) {
                    // Do something with yourArray[i].
                    var loc = vm.Wildlifesightings[i].Location.split(",");
                    var lat = parseFloat(loc[0]);
                    var lng = parseFloat(loc[1]);
                    var newlatlng = new google.maps.LatLng(lat, lng);

                    var marker = new google.maps.Marker({
                        position: newlatlng,
                        map: vm.map,
                        content: '<div>' +
                                    '<img height="90" width="90" src="data:' + vm.Wildlifesightings[i].Photo + '" hspace="5" align="left" /> Address (USNG) : ' + vm.Wildlifesightings[i].USNG + '  <br> Species Name : ' + vm.Wildlifesightings[i].Species.SpeciesName + ' <br>' +
                        ' Number Sighted : ' + vm.Wildlifesightings[i].NumberSighted + ' <br> Sighted by : ' + vm.Wildlifesightings[i].User.UserFullNames + ' <br> Notes: ' + vm.Wildlifesightings[i].Notes + '',
                        clickable: true,
                        animation: google.maps.Animation.DROP
                    });

                    google.maps.event.addListener(marker, 'click', function () {
                        console.log(this.content);
                        infowindow.setContent(this.content);
                        infowindow.open(vm.map, this);
                    });

                    switch (vm.Wildlifesightings[i].SpeciesID) {
                        case 1:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                            break;
                        case 4:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/orange-dot.png');
                            break;
                        case 6:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                            break;
                        case 7:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
                            break;
                        case 10:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                            break;
                        default:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                            break;
                    }

                    markers.push(marker);
                    clearRectangles();
                    for (var i = 0; i < markers.length; i++) {
                        drawUTMZone(markers[i].position);
                    }
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load wildlife sighitngs data: ' + error.message;
            });
    };

    $scope.getWildlifeSightingsBySpeciesId = function () {
        console.log($scope.SpeciesID);
        if ($scope.SpeciesID == null) {
            getAllWildlifeSightings();
        } else {
            wildlifesightingService.getWildlifesighitingsbySpeciesId($scope.SpeciesID)
            .success(function (wildlifesightings) {
                clearMarkers();//clear all previous markers
                clearRectangles();
                vm.Wildlifesightings = wildlifesightings;
                var length = vm.Wildlifesightings.length;


                /* now inside your initialise function */
                infowindow = new google.maps.InfoWindow({
                    content: "holding..."
                });

                for (var i = 0; i < length; i++) {
                    // Do something with yourArray[i].
                    var loc = vm.Wildlifesightings[i].Location.split(",");
                    var lat = parseFloat(loc[0]);
                    var lng = parseFloat(loc[1]);
                    var newlatlng = new google.maps.LatLng(lat, lng);

                    var marker = new google.maps.Marker({
                        position: newlatlng,
                        map: vm.map,
                        content: '<div>' +
                                    '<img height="90" width="90" src="data:' + vm.Wildlifesightings[i].Photo + '" hspace="5" align="left" /> Address (USNG) : ' + vm.Wildlifesightings[i].USNG + '  <br> Species Name : ' + vm.Wildlifesightings[i].Species.SpeciesName + ' <br>' +
                        ' Number Sighted : ' + vm.Wildlifesightings[i].NumberSighted + ' <br> Sighted by : ' + vm.Wildlifesightings[i].User.UserFullNames + ' <br> Notes: ' + vm.Wildlifesightings[i].Notes + '',
                        clickable: true,
                        animation: google.maps.Animation.DROP
                    });


                    google.maps.event.addListener(marker, 'click', function () {
                        console.log(this.content);
                        infowindow.setContent(this.content);
                        infowindow.open(vm.map, this);
                    });

                    switch (vm.Wildlifesightings[i].SpeciesID) {
                        case 1:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                            break;
                        case 4:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/orange-dot.png');
                            break;
                        case 6:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                            break;
                        case 7:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
                            break;
                        case 10:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                            break;
                        default:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                            break;
                    }

                    markers.push(marker);
                }

                for (var i = 0; i < markers.length; i++) {
                    drawUTMZone(markers[i].position);
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load wildlife sighitngs data: ' + error.message;
            });
        }
    };

    $scope.getWildlifeSightingsByUserId= function () {
        console.log($scope.UserID);
        if ($scope.UserID == null) {
            getAllWildlifeSightings();
        } else {
            wildlifesightingService.getWildlifesightingbyUserId($scope.UserID)
            .success(function (wildlifesightings) {
                clearMarkers();//clear all previous markers
                clearRectangles();
                vm.Wildlifesightings = wildlifesightings;
                var length = vm.Wildlifesightings.length;

                /* now inside your initialise function */
                infowindow = new google.maps.InfoWindow({
                    content: "holding..."
                });

                for (var i = 0; i < length; i++) {
                    // Do something with yourArray[i].
                    var loc = vm.Wildlifesightings[i].Location.split(",");
                    var lat = parseFloat(loc[0]);
                    var lng = parseFloat(loc[1]);
                    var newlatlng = new google.maps.LatLng(lat, lng);


                    var marker = new google.maps.Marker({
                        position: newlatlng,
                        map: vm.map,
                        content: '<div>' +
                                    '<img height="90" width="90" src="data:' + vm.Wildlifesightings[i].Photo + '" hspace="5" align="left" /> Address (USNG) : ' + vm.Wildlifesightings[i].USNG + '  <br> Species Name : ' + vm.Wildlifesightings[i].Species.SpeciesName + ' <br>' +
                        ' Number Sighted : ' + vm.Wildlifesightings[i].NumberSighted + ' <br> Sighted by : ' + vm.Wildlifesightings[i].User.UserFullNames + ' <br> Notes: ' + vm.Wildlifesightings[i].Notes + '',
                        clickable: true,
                        animation: google.maps.Animation.DROP
                    });

                    google.maps.event.addListener(marker, 'click', function () {
                        console.log(this.content);
                        infowindow.setContent(this.content);
                        infowindow.open(vm.map, this);
                    });

                    switch (vm.Wildlifesightings[i].SpeciesID) {
                        case 1:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                            break;
                        case 4:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/orange-dot.png');
                            break;
                        case 6:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                            break;
                        case 7:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
                            break;
                        case 10:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                            break;
                        default:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                            break;
                    }

                    markers.push(marker);
                }

                for (var i = 0; i < markers.length; i++) {
                    drawUTMZone(markers[i].position);
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load wildlife sighitngs data: ' + error.message;
            });
        }
    };

    // Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {
        setMapOnAll(null);
        markers = [];
    }

    // Sets the map on all markers in the array.
    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

    // Removes the markers from the map, but keeps them in the array.
    function clearRectangles() {
        for (var i = 0; i < rectangles.length; i++) {
            rectangles[i].setMap(null);
        }
        rectangles = [];
    }

    vm.shadeMarkerUTMZones = function () {
        clearRectangles();
        for (var i = 0; i < markers.length; i++) {
            drawUTMZone(markers[i].position);
        }
    }

    function shadeUTMZone(location) {

        var mouseLL = location;
        var mouseUSNG = usngConv.fromLonLat({ lon: mouseLL.lng(), lat: mouseLL.lat() }, 5);

        var locati = mouseUSNG.substring(0, 6);
        var leftBottomUSNG = mouseUSNG.substring(6, 12);
        var rightTopUSNG = mouseUSNG.substring(12, 18);


        //37N DC 7996 0840
        //37N DC 7999 0849
        //37N EB 99990 99990

        var leftBottomLL = usngConv.toLonLat(locati + leftBottomUSNG + '0' + rightTopUSNG + '0', null);
        southEast = locati + leftBottomUSNG + '0' + rightTopUSNG + '0';
        northWest = locati + leftBottomUSNG + '99' + rightTopUSNG + '99';


        var rightTopLL = usngConv.toLonLat(locati + leftBottomUSNG + '99' + rightTopUSNG + '99', null);


        console.log('Location Left Botoom :' + JSON.stringify(leftBottomLL));
        console.log('Location Right Top :' + JSON.stringify(rightTopLL));

        rectangle = new google.maps.Rectangle({
            strokeColor: '#00cc66',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#00cc66',
            fillOpacity: 0.35,
            map: vm.map,
            bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
            new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
        });
        rectangles.push(rectangle);
        //vm.map.setZoom(9);
        //vm.map.panTo(location);

    }

    function drawUTMZone(location) {
        console.log("Current zoom level is: " + vm.map.getZoom());



        var mouseLL = location;
        var mouseUSNG = usngConv.fromLonLat({ lon: mouseLL.lng(), lat: mouseLL.lat() }, 5);

        var locati = mouseUSNG.substring(0, 6);
        var leftBottomUSNG = mouseUSNG.substring(6, 12);
        var rightTopUSNG = mouseUSNG.substring(12, 18);


        //37N DC 7996 0840
        //37N DC 7999 0849
        //37N EB 99990 99990

        var leftBottomLL = usngConv.toLonLat(locati + leftBottomUSNG + '0' + rightTopUSNG + '0', null);
        southEast = locati + leftBottomUSNG + '0' + rightTopUSNG + '0';
        northWest = locati + leftBottomUSNG + '99' + rightTopUSNG + '99';


        if (vm.map.getZoom() == 12) {

            var baseAddress = southEast.substring(0, 6);
            var baseLon = southEast.substring(6, 9);
            var baseLat = southEast.substring(13, 16);


            var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
            var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);


            rectangle = new google.maps.Rectangle({
                strokeColor: '#00cc66',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#00cc66',
                fillOpacity: 0.35,
                map: vm.map,
                bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
            });

            rectangles.push(rectangle);
            //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
            //vm.map.panTo(panLocation);

        } else {
            if (vm.map.getZoom() == 11) {

                //37M CS 6580 7940
                //37M DS 0490 4070
                //36N VG 0740 3600
                //37M ET 0260 7660

                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 9);
                var baseLat = southEast.substring(13, 16);

                var newBaseLon = parseInt(baseLon);
                var newBaseLat = parseInt(baseLat);
                newBaseLat += 1;
                var newTopRightLon = parseInt(baseLon);
                newTopRightLon += 1;
                var newTopRightLat = parseInt(baseLat);
                newTopRightLat += 1;

                console.log('Base Lon : ' + baseLon + ' Base Lat: ' + baseLat + ' New Base Lon : ' + newBaseLon + ' : ' + newBaseLat);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon);
                //vm.map.panTo(panLocation);

            }

            if (vm.map.getZoom() == 10) {

                //37M CS 6580 7940
                //37M DS 0490 4070
                //37N CD 2670 3990

                console.log('Hapa ni zoom level 10');

                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 9);
                var baseLat = southEast.substring(13, 16);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 13 || vm.map.getZoom() <= 16) {

                var baseAddress = southEast.substring(0, 6);
                //var baseLon = southEast.substring(6, 10);
                //var baseLat = southEast.substring(13, 17);
                var baseLon = southEast.substring(6, 9);
                var baseLat = southEast.substring(13, 16);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });
                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 17 || vm.map.getZoom() == 18) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 10);
                var baseLat = southEast.substring(13, 17);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 19 || vm.map.getZoom() == 20) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 11);
                var baseLat = southEast.substring(13, 18);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 21) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 11);
                var baseLat = southEast.substring(13, 18);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }
            if (vm.map.getZoom() == 9) {

                var baseAddress = southEast.substring(0, 6);

                var leftBottomLL = usngConv.toLonLat(baseAddress + '0000' + '0000', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + '9999' + '9999', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }


            if (vm.map.getZoom() == 6 || vm.map.getZoom() <= 8) {

                var baseAddress = southEast.substring(0, 6);

                var leftBottomLL = usngConv.toLonLat(baseAddress + '0000' + '0000', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + '9999' + '9999', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }


            if (vm.map.getZoom() <= 5) {
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



                var zoneNo = southEast.substring(0, 2);
                var latZone = southEast.substring(2, 3);

                var easternBoundary = parseInt(zoneNo);
                easternBoundary = (easternBoundary * 6) - 180;
                var westernBoundary = easternBoundary - 6;

                var southernBoundary;

                switch (latZone) {
                    case "F":
                        southernBoundary = -56;
                        break;
                    case "G":
                        southernBoundary = -48;
                        break;
                    case "H":
                        southernBoundary = -40;
                        break;
                    case "J":
                        southernBoundary = -32;
                        break;
                    case "K":
                        southernBoundary = -24;
                        break;
                    case "L":
                        southernBoundary = -16;
                        break;
                    case "M":
                        southernBoundary = -8;
                        break;
                    case "N":
                        southernBoundary = 0;
                        break;
                    case "P":
                        southernBoundary = 8;
                        break;
                    case "Q":
                        southernBoundary = 16;
                        break;
                    case "R":
                        southernBoundary = 24;
                        break;
                    case "S":
                        southernBoundary = 32;
                        break;
                    case "T":
                        southernBoundary = 40;
                        break;
                    case "U":
                        southernBoundary = 48;
                        break;
                    case "V":
                        southernBoundary = 56;
                        break;
                    case "W":
                        southernBoundary = 64;
                        break;
                }


                var northernBoundary = parseInt(southernBoundary);
                northernBoundary += 8;

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(southernBoundary, westernBoundary),
                    new google.maps.LatLng(northernBoundary, easternBoundary))
                });

                rectangles.push(rectangle);
                // var panLocation = new google.maps.LatLng(southernBoundary, easternBoundary)
                //vm.map.setCenter(panLocation);

            }
        }
    };

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

    //Geocode the address, pan/zoom the map, and create a marker via the markers.js script
    function codeAddress(addrTxt) {
        var address = addrTxt;
        locationGeocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.fitBounds(results[0].geometry.viewport);
                createMarker(results[0].geometry.location, results[0].formatted_address);
            } else {
                alert("Geocode was not found for the following reason: " + status);
            }
        });
    }

    vm.placeChanged = function () {
        vm.types = "['address']";
        vm.place = this.getPlace();
        var address = vm.address;
        console.log('The location before', address.substring(0, 4));
        if (isNumeric(address.substring(0, 4)) && $scope.isAddress) {
            console.log('The location after', address.substring(0, 4));
            var loc = address.split(",");
            var lat = parseFloat(loc[0]);
            var lng = parseFloat(loc[1]);
            var newlatlng = new google.maps.LatLng(lat, lng);
            vm.map.setCenter(newlatlng);
            vm.map.setZoom(8);
        } else {
            if (isNumeric(address.substring(0, 2)) && !$scope.isAddress) {
                console.log('location using USNG');
                convUSNG(address);
            }
            else {
                console.log('location', JSON.stringify(vm.place.geometry.location));
                vm.map.setCenter(vm.place.geometry.location);
                vm.map.setZoom(8);
            }
        }
    }

    //Convert a USNG string to a lat long for a marker and zooming
    function convUSNG(location) {
        var usngZlev = null; //set up a zoom level for use later
        try {
            var foundLLobj = usngConv.toLonLat(location, null);
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

        //vm.map.setZoom(usngZlev);
        console.log("New zoom level is: " + usngZlev);
        var foundLatLng = new google.maps.LatLng(foundLLobj.lat, foundLLobj.lon);
        vm.map.setCenter(foundLatLng);
        vm.map.setZoom(8);
        //map.setCenter(foundLatLng);
        //createMarker(foundLatLng, null);
    }

    function isNumeric(n) {
        if (typeof (n) === 'string') {
            n = n.replace(/,/, ".");
        }
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
});

//loginController
app.controller('loginController', function ($scope, $q, userService, $timeout, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, NgMap) {
    $scope.OperType = 1;//1 Means New Entry
    $scope.loginMode = true;
    $scope.edit = edit;
    $scope.delete = deleteRow;
    $scope.message = "";

    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return userService.getUsers();
    }).withPaginationType('full_numbers').withOption('createdRow', createdRow);

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('UserID').withTitle('Seed ID').notVisible(),
        DTColumnBuilder.newColumn('UserType').withTitle('User Type').renderWith(function (data) {
            switch (data) {
                case 0:
                    return 'Field Employee'
                case 1:
                    return 'Head Office Employee'
                case 2:
                    return 'Farmer'
                case 3:
                    return 'Buyer'
                default:
                    return 'Unknown'
            };
        }),
        DTColumnBuilder.newColumn('UserName').withTitle('User Name'),
        DTColumnBuilder.newColumn('UserStatus').withTitle('User Status').renderWith(function (data) {
            switch (data) {
                case 0:
                    return 'Active'
                case 1:
                    return 'Not Active'
                default:
                    return 'Unknown'
            };
        }),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml).withClass("text-center")
    ];

    DTInstances.getLast().then(function (dtInstance) {
        $scope.dtInstance = dtInstance;
    });

    function edit(id) {
        // Edit some data and call server to make changes...
        $scope.addMode = !$scope.addMode;
        $scope.get(id);
    }

    function deleteRow(id) {
        //alert("inDelete");
        $scope.message = 'You are trying to remove the row with ID: ' + id; --
        // Delete some data and call server to make changes...
        // Then reload the data so that DT is refreshed
        $scope.dtInstance.reloadData();
    }

    function createdRow(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }

    function actionsHtml(data, type, full, meta) {
        return '<div class="gradeX">' +
        '<button class="btn btn-primary btn-sm" data-ng-click="edit(' + data.UserID + ')">' +
            '   <i class="fa fa-edit"></i>' +
            '</button>&nbsp;' +
            '<button class="btn btn-white btn-sm" data-ng-click="delete(' + data.UserID + ')">' +
            '   <i class="fa fa-trash-o"></i>' +
            '</button>' +
            '</div>';
    }

    $scope.toggleEdit = function () {
        this.friend.editMode = !this.friend.editMode;
    };
    $scope.toggleAdd = function () {
        $scope.addMode = !$scope.addMode;
        ClearModels();
    };

    $scope.Login = function () {
        var response;
        userService.getByUsername($scope.UserName)
        .then(function (user) {
            if (user !== null && user.password === $scope.UserPassword) {
                response = { success: true };
                $location.path("/Home");
            } else {
                response = { success: false, message: 'Username or password is incorrect' };
                $location.path("/");
            }
        });
    }

    /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/

    /* Use this for real authentication
             ----------------------------------------------*/
    //$http.post('/api/authenticate', { username: username, password: password })
    //    .success(function (response) {
    //        callback(response);
    //    });


    //To Clear all input controls.
    function ClearModels() {
        $scope.UserID = "";
        $scope.UserType = "";
        $scope.UserName = "";
        $scope.UserPassword = "";
        $scope.UserStatus = "";
    }

    //To Create new record and Edit an existing Record.
    $scope.save = function () {
        var User = {
            UserType: $scope.UserType,
            UserName: $scope.UserName,
            UserStatus: $scope.UserStatus,
            UserPassword: $scope.UserPassword
        };
        if ($scope.OperType === 1) {
            var promisePost = userService.post(User);
            promisePost.then(function (pl) {
                $scope.dtInstance.reloadData();
                ClearModels();
            }, function (err) {
                console.log("Err" + err);
            });
        } else {
            //Edit the record             
            User.UserID = $scope.UserID;
            var promisePut = userService.put($scope.UserID, User);
            promisePut.then(function (pl) {
                $scope.Message = "User Updated Successfuly";
                $scope.dtInstance.reloadData();
                ClearModels();
            }, function (err) {
                console.log("Err" + err);
            });
        }

        $scope.addMode = !$scope.addMode;
    };


    //To Delete Record
    $scope.delete = function (User) {
        var promiseDelete = seedService.delete(User.UserID);
        promiseDelete.then(function (pl) {
            $scope.Message = "User Deleted Successfuly";
            ClearModels();
        }, function (err) {
            console.log("Err" + err);
        });
    }

    //To Get User Detail on the Base of User ID
    $scope.get = function (id) {
        var promiseGetSingle = userService.get(id);

        promiseGetSingle.then(function (pl) {
            var res = pl.data;
            $scope.UserID = res.UserID;
            $scope.UserType = res.UserType;
            $scope.UserName = res.UserName;
            $scope.UserStatus = res.UserStatus;
            $scope.UserPassword = res.UserPassword;
            $scope.OperType = 0;
        },
        function (errorPl) {
            console.log('Some Error in Getting Details', errorPl);
        });
    }

    $scope.UserTypes = [
       { id: 0, name: 'Field Employee' },
       { id: 1, name: 'Head Office Employee' },
       { id: 2, name: 'Farmer' },
       { id: 3, name: 'Buyer' }
    ];

    $scope.UserStatusTypes = [
     { id: 0, name: 'Active' },
     { id: 1, name: 'Not Active' }
    ];


    //To Clear all Inputs controls value.
    $scope.clear = function () {
        $scope.OperType = 1;
        $scope.UserID = "";
        $scope.UserType = "";
        $scope.UserName = "";
        $scope.UserStatus = "";
        $scope.UserPassword = "";
    }

    // Base64 encoding service used by AuthenticationService
    var Base64 = {

        keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                this.keyStr.charAt(enc1) +
                this.keyStr.charAt(enc2) +
                this.keyStr.charAt(enc3) +
                this.keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = this.keyStr.indexOf(input.charAt(i++));
                enc2 = this.keyStr.indexOf(input.charAt(i++));
                enc3 = this.keyStr.indexOf(input.charAt(i++));
                enc4 = this.keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
});

//userController
app.controller('userController', function ($scope, $q, userService, $timeout, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, NgMap) {
    $scope.OperType = 1;//1 Means New Entry
    $scope.addMode = false;
    $scope.setFocus = true;
    $scope.edit = edit;
    $scope.delete = deleteRow;
    $scope.message = "";

    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return userService.getUsers();
    }).withPaginationType('full_numbers').withOption('createdRow', createdRow);

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('UserID').withTitle('User ID').notVisible(),
        DTColumnBuilder.newColumn('UserName').withTitle('User Name'),
        DTColumnBuilder.newColumn('UserFullNames').withTitle('Full Names'),
        DTColumnBuilder.newColumn('UserEmailAddress').withTitle('Email Address'),
        DTColumnBuilder.newColumn('UserTypeId').withTitle('User Type').renderWith(function (data) {
            switch (data) {
                case 0:
                    return 'Administrator'
                case 1:
                    return 'Other'
                default:
                    return 'Unknown'
            };
        }),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml).withClass("text-center")
    ];

    DTInstances.getLast().then(function (dtInstance) {
        $scope.dtInstance = dtInstance;
    });

    function edit(id) {
        // Edit some data and call server to make changes...
        $scope.addMode = !$scope.addMode;
        $scope.get(id);
    }

    function deleteRow(id) {
        //alert("inDelete");
        $scope.message = 'You are trying to remove the row with ID: ' + id; --
        // Delete some data and call server to make changes...
        // Then reload the data so that DT is refreshed
        $scope.dtInstance.reloadData();
    }

    function createdRow(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }

    function actionsHtml(data, type, full, meta) {
        return '<div class="gradeX">' +
        '<button class="btn btn-primary btn-sm" data-ng-click="edit(' + data.UserID + ')">' +
            '   <i class="fa fa-edit"></i>' +
            '</button>&nbsp;' +
            '<button class="btn btn-white btn-sm" data-ng-click="delete(' + data.UserID + ')">' +
            '   <i class="fa fa-trash-o"></i>' +
            '</button>' +
            '</div>';
    }

    $scope.toggleEdit = function () {
        this.friend.editMode = !this.friend.editMode;
    };
    $scope.toggleAdd = function () {
        $scope.addMode = !$scope.addMode;
        ClearModels();
    };


    //To Create new record and Edit an existing Record.
    $scope.register = function () {
        var User = {
            UserFullNames: $scope.UserFullNames,
            UserEmailAddress: $scope.UserEmailAddress,
            UserPassword: $scope.UserPassword,
            UserName: $scope.UserName,
            UserTypeId:1//default user type is "Other"
        };
        if ($scope.OperType === 1) {
            var promisePost = userService.post(User);
            promisePost.then(function (pl) {
                ClearModels();
                window.location.href = "/Login/Index/";//redirect the user to the login page
            }, function (err) {
                console.log("Err" + err);
            });
        } else {
            //Edit the record             
            User.UserID = $scope.UserID;
            var promisePut = userService.put($scope.UserID, User);
            promisePut.then(function (pl) {
                $scope.Message = "User Updated Successfuly";
                ClearModels();
            }, function (err) {
                console.log("Err" + err);
            });
        }

        $scope.addMode = !$scope.addMode;
    };

    $scope.UserTypes = [
            { UserTypeId: 0, Name: "Administrator" },
            { UserTypeId: 1, Name: "Other" }
    ];

    //To Clear all input controls.
    function ClearModels() {
        $scope.UserID = "";
        $scope.UserFullNames = "";
        $scope.UserName = "";
        $scope.UserPassword = "";
        $scope.UserEmailAddress = "";
        $scope.UserTypeId = "";
    }

    //To Create new record and Edit an existing Record.
    $scope.save = function () {
        var User = {
            UserFullNames: $scope.UserFullNames,
            UserEmailAddress: $scope.UserEmailAddress,
            UserPassword: $scope.UserPassword,
            UserName: $scope.UserName,
            UserTypeId: $scope.UserTypeId
        };
        if ($scope.OperType === 1) {
            var promisePost = userService.post(User);
            promisePost.then(function (pl) {
                $scope.dtInstance.reloadData();
                ClearModels();
            }, function (err) {
                console.log("Err" + err);
            });
        } else {
            //Edit the record             
            User.UserID = $scope.UserID;
            var promisePut = userService.put($scope.UserID, User);
            promisePut.then(function (pl) {
                $scope.Message = "User Updated Successfuly";
                $scope.dtInstance.reloadData();
                ClearModels();
            }, function (err) {
                console.log("Err" + err);
            });
        }

        $scope.addMode = !$scope.addMode;
    };


    //To Get User Detail on the Base of User ID
    $scope.get = function (id) {
        var promiseGetSingle = userService.get(id);

        promiseGetSingle.then(function (pl) {
            var res = pl.data;
            $scope.UserID = res.UserID;
            $scope.UserEmailAddress = res.UserEmailAddress;
            $scope.UserName = res.UserName;
            $scope.UserFullNames = res.UserFullNames;
            $scope.UserPassword = res.UserPassword;
            $scope.UserTypeId= res.UserTypeId
            $scope.OperType = 0;
        },
        function (errorPl) {
            console.log('Some Error in Getting Details', errorPl);
        });
    }


    //To Clear all Inputs controls value.
    $scope.clear = function () {
        $scope.OperType = 1;
        $scope.UserID = "";
        $scope.UserFullNames = "";
        $scope.UserName = "";
        $scope.UserEmailAddress = "";
        $scope.UserPassword = "";
        $scope.UserTypeId="";
    }
});

//speciesController
app.controller('speciesController', function ($scope, $q, speciesService, $timeout, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, NgMap) {
    $scope.OperType = 1;//1 Means New Entry
    $scope.addMode = false;
    $scope.edit = edit;
    $scope.delete = deleteRow;
    $scope.message = "";

    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return speciesService.getSpecies();
    }).withPaginationType('full_numbers').withOption('createdRow', createdRow);

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('SpeciesID').withTitle('User ID').notVisible(),
        DTColumnBuilder.newColumn('SpeciesName').withTitle('Species Name'),
        DTColumnBuilder.newColumn('SpeciesDescription').withTitle('Species Description'),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml).withClass("text-center")
    ];

    DTInstances.getLast().then(function (dtInstance) {
        $scope.dtInstance = dtInstance;
    });

    function edit(id) {
        // Edit some data and call server to make changes...
        $scope.addMode = !$scope.addMode;
        $scope.get(id);
    }

    function deleteRow(id) {
        //alert("inDelete");
        $scope.message = 'You are trying to remove the row with ID: ' + id; --
        // Delete some data and call server to make changes...
        // Then reload the data so that DT is refreshed
        $scope.dtInstance.reloadData();
    }

    function createdRow(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }

    function actionsHtml(data, type, full, meta) {
        return '<div class="gradeX">' +
        '<button class="btn btn-primary btn-sm" data-ng-click="edit(' + data.SpeciesID + ')">' +
            '   <i class="fa fa-edit"></i>' +
            '</button>&nbsp;' +
            '<button class="btn btn-white btn-sm" data-ng-click="delete(' + data.SpeciesID + ')">' +
            '   <i class="fa fa-trash-o"></i>' +
            '</button>' +
            '</div>';
    }

    $scope.toggleEdit = function () {
        this.friend.editMode = !this.friend.editMode;
    };
    $scope.toggleAdd = function () {
        $scope.addMode = !$scope.addMode;
        ClearModels();
    };


    //To Clear all input controls.
    function ClearModels() {
        $scope.SpeciesID = "";
        $scope.SpeciesName = "";
        $scope.SpeciesDescription = "";
    }

    //To Create new record and Edit an existing Record.
    $scope.save = function () {
        var Species = {
            SpeciesName: $scope.SpeciesName,
            SpeciesDescription: $scope.SpeciesDescription
        };
        if ($scope.OperType === 1) {
            var promisePost = speciesService.post(Species);
            promisePost.then(function (pl) {
                $scope.dtInstance.reloadData();
                ClearModels();
            }, function (err) {
                console.log("Err" + err);
            });
        } else {
            //Edit the record             
            Species.SpeciesID = $scope.SpeciesID;
            var promisePut = speciesService.put($scope.SpeciesID, Species);
            promisePut.then(function (pl) {
                $scope.Message = "Species Updated Successfuly";
                $scope.dtInstance.reloadData();
                ClearModels();
            }, function (err) {
                console.log("Err" + err);
            });
        }

        $scope.addMode = !$scope.addMode;
    };


    //To Get User Detail on the Base of User ID
    $scope.get = function (id) {
        var promiseGetSingle = speciesService.get(id);

        promiseGetSingle.then(function (pl) {
            var res = pl.data;
            $scope.SpeciesID = res.SpeciesID;
            $scope.SpeciesName = res.SpeciesName;
            $scope.SpeciesDescription = res.SpeciesDescription;
            $scope.OperType = 0;
        },
        function (errorPl) {
            console.log('Some Error in Getting Details', errorPl);
        });
    }

});

//dashboardController
app.controller('dashboardController', function ($scope, $q, userService, wildlifesightingService, $timeout, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, NgMap) {
    $scope.OperType = 1;//1 Means New Entry
    $scope.addMode = false;


    // Instatiation of the USNG mapping function
    var usngConv = new USNG2();
    var utmMap = new usngConv.UTM();

    //Graticules are another word for 'overlays', just implemented as a whole instead of individually
    var graticuleDisplay = null;

    var rectangle;
    var markers = [];
    var rectangles = [];
    var southEast, northWest;

    var vm = this;
    NgMap.getMap().then(function (map) {
        vm.map = map;
        //Instatiated the graticuleDisplay
        graticuleDisplay = new USNGGraticule(vm.map, gridstyle);
        //get all the species 
        getWildlifeSightingsByUserId();
        getUserStats();
    });
    

    //To Get User Detail on the Base of User ID
    function getUserStats() {
        var promiseGetSingle = wildlifesightingService.GetWildlifesightingsStatsByUserId(2);

        promiseGetSingle.then(function (pl) {
            var res = pl.data;
            $scope.SpeciesCount = res.SpeciesCount;
            $scope.AnimalsCount = res.AnimalsCount;
            $scope.MonthlyCount = res.MonthlyCount;
            $scope.YearlyCount = res.YearlyCount;
        },
        function (errorPl) {
            console.log('Some Error in Getting Details', errorPl);
        });
    }


    function getWildlifeSightingsByUserId() {
        wildlifesightingService.getWildlifesighitingsbyUserId(2)
            .success(function (wildlifesightings) {
                vm.Wildlifesightings = wildlifesightings;
                var length = vm.Wildlifesightings.length;

                /* now inside your initialise function */
                infowindow = new google.maps.InfoWindow({
                    content: "holding..."
                });

                for (var i = 0; i < length; i++) {
                    // Do something with yourArray[i].
                    var loc = vm.Wildlifesightings[i].Location.split(",");
                    var lat = parseFloat(loc[0]);
                    var lng = parseFloat(loc[1]);
                    var newlatlng = new google.maps.LatLng(lat, lng);

                    var marker = new google.maps.Marker({
                        position: newlatlng,
                        map: vm.map,
                        content: '<div>' +
                                    '<img height="80" width="80" src="data:' + vm.Wildlifesightings[i].Photo + '" hspace="10" align="left" /> Address : ' + newlatlng + ' <br>' +
                        ' USNG : ' + vm.Wildlifesightings[i].USNG + ' <br> Notes : ' + vm.Wildlifesightings[i].Notes + ' <br> Sighted by: ' + vm.Wildlifesightings[i].User.UserFullNames + '',
                        clickable: true,
                        animation: google.maps.Animation.DROP
                    });

                    google.maps.event.addListener(marker, 'click', function () {
                        console.log(this.content);
                        infowindow.setContent(this.content);
                        infowindow.open(vm.map, this);
                    });

                    switch (vm.Wildlifesightings[i].SpeciesID) {
                        case 1:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                            break;
                        case 4:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/orange-dot.png');
                            break;
                        case 6:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                            break;
                        case 7:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
                            break;
                        case 10:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                            break;
                        default:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                            break;
                    }

                    markers.push(marker);
                }

                for (var i = 0; i < markers.length; i++) {
                    drawUTMZone(markers[i].position);
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load wildlife sighitngs data: ' + error.message;
            });
    };


    function drawUTMZone(location) {
        console.log("Current zoom level is: " + vm.map.getZoom());



        var mouseLL = location;
        var mouseUSNG = usngConv.fromLonLat({ lon: mouseLL.lng(), lat: mouseLL.lat() }, 5);

        var locati = mouseUSNG.substring(0, 6);
        var leftBottomUSNG = mouseUSNG.substring(6, 12);
        var rightTopUSNG = mouseUSNG.substring(12, 18);


        //37N DC 7996 0840
        //37N DC 7999 0849
        //37N EB 99990 99990

        var leftBottomLL = usngConv.toLonLat(locati + leftBottomUSNG + '0' + rightTopUSNG + '0', null);
        southEast = locati + leftBottomUSNG + '0' + rightTopUSNG + '0';
        northWest = locati + leftBottomUSNG + '99' + rightTopUSNG + '99';


        if (vm.map.getZoom() == 12) {

            var baseAddress = southEast.substring(0, 6);
            var baseLon = southEast.substring(6, 9);
            var baseLat = southEast.substring(13, 16);


            var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
            var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);


            rectangle = new google.maps.Rectangle({
                strokeColor: '#00cc66',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#00cc66',
                fillOpacity: 0.35,
                map: vm.map,
                bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
            });

            rectangles.push(rectangle);
            //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
            //vm.map.panTo(panLocation);

        } else {
            if (vm.map.getZoom() == 11) {

                //37M CS 6580 7940
                //37M DS 0490 4070
                //36N VG 0740 3600
                //37M ET 0260 7660

                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 9);
                var baseLat = southEast.substring(13, 16);

                var newBaseLon = parseInt(baseLon);
                var newBaseLat = parseInt(baseLat);
                newBaseLat += 1;
                var newTopRightLon = parseInt(baseLon);
                newTopRightLon += 1;
                var newTopRightLat = parseInt(baseLat);
                newTopRightLat += 1;

                console.log('Base Lon : ' + baseLon + ' Base Lat: ' + baseLat + ' New Base Lon : ' + newBaseLon + ' : ' + newBaseLat);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon);
                //vm.map.panTo(panLocation);

            }

            if (vm.map.getZoom() == 10) {

                //37M CS 6580 7940
                //37M DS 0490 4070
                //37N CD 2670 3990

                console.log('Hapa ni zoom level 10');

                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 9);
                var baseLat = southEast.substring(13, 16);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 13 || vm.map.getZoom() <= 16) {

                var baseAddress = southEast.substring(0, 6);
                //var baseLon = southEast.substring(6, 10);
                //var baseLat = southEast.substring(13, 17);
                var baseLon = southEast.substring(6, 9);
                var baseLat = southEast.substring(13, 16);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });
                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 17 || vm.map.getZoom() == 18) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 10);
                var baseLat = southEast.substring(13, 17);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 19 || vm.map.getZoom() == 20) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 11);
                var baseLat = southEast.substring(13, 18);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 21) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 11);
                var baseLat = southEast.substring(13, 18);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }
            if (vm.map.getZoom() == 9) {

                var baseAddress = southEast.substring(0, 6);

                var leftBottomLL = usngConv.toLonLat(baseAddress + '0000' + '0000', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + '9999' + '9999', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }


            if (vm.map.getZoom() == 6 || vm.map.getZoom() <= 8) {

                var baseAddress = southEast.substring(0, 6);

                var leftBottomLL = usngConv.toLonLat(baseAddress + '0000' + '0000', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + '9999' + '9999', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }


            if (vm.map.getZoom() <= 5) {
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



                var zoneNo = southEast.substring(0, 2);
                var latZone = southEast.substring(2, 3);

                var easternBoundary = parseInt(zoneNo);
                easternBoundary = (easternBoundary * 6) - 180;
                var westernBoundary = easternBoundary - 6;

                var southernBoundary;

                switch (latZone) {
                    case "F":
                        southernBoundary = -56;
                        break;
                    case "G":
                        southernBoundary = -48;
                        break;
                    case "H":
                        southernBoundary = -40;
                        break;
                    case "J":
                        southernBoundary = -32;
                        break;
                    case "K":
                        southernBoundary = -24;
                        break;
                    case "L":
                        southernBoundary = -16;
                        break;
                    case "M":
                        southernBoundary = -8;
                        break;
                    case "N":
                        southernBoundary = 0;
                        break;
                    case "P":
                        southernBoundary = 8;
                        break;
                    case "Q":
                        southernBoundary = 16;
                        break;
                    case "R":
                        southernBoundary = 24;
                        break;
                    case "S":
                        southernBoundary = 32;
                        break;
                    case "T":
                        southernBoundary = 40;
                        break;
                    case "U":
                        southernBoundary = 48;
                        break;
                    case "V":
                        southernBoundary = 56;
                        break;
                    case "W":
                        southernBoundary = 64;
                        break;
                }


                var northernBoundary = parseInt(southernBoundary);
                northernBoundary += 8;

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(southernBoundary, westernBoundary),
                    new google.maps.LatLng(northernBoundary, easternBoundary))
                });

                rectangles.push(rectangle);
                // var panLocation = new google.maps.LatLng(southernBoundary, easternBoundary)
                //vm.map.setCenter(panLocation);

            }
        }
    };

    function getAllWildlifeSightings() {
        wildlifesightingService.getAllWildlifesightings()
            .success(function (wildlifesightings) {
                vm.Wildlifesightings = wildlifesightings;
                var length = vm.Wildlifesightings.length;
                for (var i = 0; i < length; i++) {
                    // Do something with yourArray[i].
                    var loc = vm.Wildlifesightings[i].Location.split(",");
                    var lat = parseFloat(loc[0]);
                    var lng = parseFloat(loc[1]);
                    var newlatlng = new google.maps.LatLng(lat, lng);

                    var marker = new google.maps.Marker({
                        position: newlatlng,
                        map: vm.map,
                        draggable: true,
                        animation: google.maps.Animation.DROP
                    });
                    console.log('Wildlife sightings JSON: ' + JSON.stringify(newlatlng));
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load wildlife sighitngs data: ' + error.message;
            });
    };
});


//wildlifesightingController
app.controller('wildlifesightingController', function ($scope, $q, wildlifesightingService, speciesService, $timeout, $compile, $filter, DTOptionsBuilder, DTColumnBuilder, DTInstances, NgMap) {
    $scope.OperType = 1;//1 Means New Entry
    $scope.addMode = false;
    $scope.edit = edit;
    $scope.message = "";
    $scope.Location = "";
    $scope.SightingDate = $filter('date')(Date.now(), 'MM/dd/yyyy');

    // Instatiation of the USNG mapping function
    var usngConv = new USNG2();
    var utmMap = new usngConv.UTM();

    //Graticules are another word for 'overlays', just implemented as a whole instead of individually
    var graticuleDisplay = null;

    var rectangle, marker, southEast, northWest, lat, lng;

    var vm = this;

    NgMap.getMap().then(function (map) {
        vm.map = map;
        //Instatiated the graticuleDisplay
        graticuleDisplay = new USNGGraticule(vm.map, gridstyle);
    });

    vm.placeMarker = function (event) {
        if (marker) {
            marker.setMap(null);
            marker = new google.maps.Marker({
                position: event.latLng,
                map: vm.map,
                draggable: true,
                animation: google.maps.Animation.DROP
            })
        } else {
            console.log('Marker exists');
            marker = new google.maps.Marker({
                position: event.latLng,
                map: vm.map,
                draggable: true,
                animation: google.maps.Animation.DROP
            });
        }

        lat = event.latLng.lat();
        lng = event.latLng.lng();

        $scope.Location = lat + ',' + lng;
        $scope.USNG = usngConv.fromLonLat({ lon: lng, lat: lat }, 5);
        shadeUTMZone(event.latLng);

        marker.addListener('dragend', function (event) {
            lat = event.latLng.lat();
            lng = event.latLng.lng();
            $scope.USNG = usngConv.fromLonLat({ lon: lng, lat: lat }, 5);
            shadeUTMZone(event.latLng);
            console.log('Scope Location :' + $scope.USNG);
        });

        console.log('Scope Location USNG:' + $scope.USNG);
    }


    function shadeUTMZone(location) {

        var mouseLL = location;
        var mouseUSNG = usngConv.fromLonLat({ lon: mouseLL.lng(), lat: mouseLL.lat() }, 5);

        var locati = mouseUSNG.substring(0, 6);
        var leftBottomUSNG = mouseUSNG.substring(6, 12);
        var rightTopUSNG = mouseUSNG.substring(12, 18);


        //37N DC 7996 0840
        //37N DC 7999 0849
        //37N EB 99990 99990

        var leftBottomLL = usngConv.toLonLat(locati + leftBottomUSNG + '0' + rightTopUSNG + '0', null);
        southEast = locati + leftBottomUSNG + '0' + rightTopUSNG + '0';
        northWest = locati + leftBottomUSNG + '99' + rightTopUSNG + '99';


        var rightTopLL = usngConv.toLonLat(locati + leftBottomUSNG + '99' + rightTopUSNG + '99', null);


        console.log('Location Left Botoom :' + JSON.stringify(leftBottomLL));
        console.log('Location Right Top :' + JSON.stringify(rightTopLL));


        if (rectangle) {
            console.log('drawing new rectangle :');
            rectangle.setOptions({
                map: vm.map,
                bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
            });
        } else {
            console.log('drawing existing rectangle :');
            rectangle = new google.maps.Rectangle({
                strokeColor: '#00cc66',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#00cc66',
                fillOpacity: 0.35,
                map: vm.map,
                bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
            });
        }

        vm.map.setZoom(9);
        vm.map.panTo(location);

    }

    vm.drawUTMZone = function () {
        console.log("Current zoom level is: " + vm.map.getZoom());

        console.log("South East " + southEast);//South East 37N DB 537240 748440

        console.log("North West " + northWest);//North West 37N DB 5372499 7484499


        if (vm.map.getZoom() == 12) {

            var baseAddress = southEast.substring(0, 6);
            var baseLon = southEast.substring(6, 9);
            var baseLat = southEast.substring(13, 16);


            var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
            var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);


            rectangle.setOptions({
                map: vm.map,
                bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
            });

            var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
            vm.map.panTo(panLocation);

        } else {
            if (vm.map.getZoom() == 11) {

                //37M CS 6580 7940
                //37M DS 0490 4070
                //36N VG 0740 3600
                //37M ET 0260 7660

                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 9);
                var baseLat = southEast.substring(13, 16);

                var newBaseLon = parseInt(baseLon);
                var newBaseLat = parseInt(baseLat);
                newBaseLat += 1;
                var newTopRightLon = parseInt(baseLon);
                newTopRightLon += 1;
                var newTopRightLat = parseInt(baseLat);
                newTopRightLat += 1;

                console.log('Base Lon : ' + baseLon + ' Base Lat: ' + baseLat + ' New Base Lon : ' + newBaseLon + ' : ' + newBaseLat);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));

                rectangle.setOptions({
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                        new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                        new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                var panLocation = new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon);
                vm.map.panTo(panLocation);

            }

            if (vm.map.getZoom() == 10) {

                //37M CS 6580 7940
                //37M DS 0490 4070
                //37N CD 2670 3990

                console.log('Hapa ni zoom level 10');

                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 9);
                var baseLat = southEast.substring(13, 16);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                rectangle.setOptions({
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 13) {

                //37M CS 6580 7940
                //37M DS 0490 4070
                //37N CD 2670 3990

                console.log('Hapa ni zoom level 10');

                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 10);
                var baseLat = southEast.substring(13, 17);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                rectangle.setOptions({
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 18) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 10);
                var baseLat = southEast.substring(13, 17);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                rectangle.setOptions({
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() >= 19) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 11);
                var baseLat = southEast.substring(13, 18);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                rectangle.setOptions({
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 21) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 12);
                var baseLat = southEast.substring(13, 19);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '000' + baseLat + '000', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '999' + baseLat + '999', null);

                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                rectangle.setOptions({
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                vm.map.panTo(panLocation);
            }
            if (vm.map.getZoom() == 9) {

                var baseAddress = southEast.substring(0, 6);

                var leftBottomLL = usngConv.toLonLat(baseAddress + '0000' + '0000', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + '9999' + '9999', null);

                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                rectangle.setOptions({
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                vm.map.panTo(panLocation);
            }


            if (vm.map.getZoom() == 6) {

                var baseAddress = southEast.substring(0, 6);

                var leftBottomLL = usngConv.toLonLat(baseAddress + '0000' + '0000', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + '9999' + '9999', null);

                console.log('Location 11 LeftBottom :' + JSON.stringify(leftBottomLL));
                console.log('Location 11 TopLeft :' + JSON.stringify(rightTopLL));
                rectangle.setOptions({
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                vm.map.panTo(panLocation);
            }


            if (vm.map.getZoom() <= 5) {
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



                var zoneNo = southEast.substring(0, 2);
                var latZone = southEast.substring(2, 3);

                var easternBoundary = parseInt(zoneNo);
                easternBoundary = (easternBoundary * 6) - 180;
                var westernBoundary = easternBoundary - 6;

                var southernBoundary;

                switch (latZone) {
                    case "F":
                        southernBoundary = -56;
                        break;
                    case "G":
                        southernBoundary = -48;
                        break;
                    case "H":
                        southernBoundary = -40;
                        break;
                    case "J":
                        southernBoundary = -32;
                        break;
                    case "K":
                        southernBoundary = -24;
                        break;
                    case "L":
                        southernBoundary = -16;
                        break;
                    case "M":
                        southernBoundary = -8;
                        break;
                    case "N":
                        southernBoundary = 0;
                        break;
                    case "P":
                        southernBoundary = 8;
                        break;
                    case "Q":
                        southernBoundary = 16;
                        break;
                    case "R":
                        southernBoundary = 24;
                        break;
                    case "S":
                        southernBoundary = 32;
                        break;
                    case "T":
                        southernBoundary = 40;
                        break;
                    case "U":
                        southernBoundary = 48;
                        break;
                    case "V":
                        southernBoundary = 56;
                        break;
                    case "W":
                        southernBoundary = 64;
                        break;
                }


                var northernBoundary = parseInt(southernBoundary);
                northernBoundary += 8;



                console.log('Location 11 North :' + northernBoundary + ' Southern' + southernBoundary);
                console.log('Location 11 Eastern :' + easternBoundary + ' Western' + westernBoundary);
                rectangle.setOptions({
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(southernBoundary, westernBoundary),
                    new google.maps.LatLng(northernBoundary, easternBoundary))
                });

                var panLocation = new google.maps.LatLng(southernBoundary, easternBoundary)
                vm.map.setCenter(panLocation);

            }
        }
    };


    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return wildlifesightingService.getWildlifeObservationsByUserId(1);
    }).withPaginationType('full_numbers').withOption('createdRow', createdRow);

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('WildlifeSightingID').withTitle('WildlifeSightingID ID').notVisible(),
        DTColumnBuilder.newColumn('Species.SpeciesName').withTitle('Species Name'),
        DTColumnBuilder.newColumn('Location').withTitle('Location'),
        DTColumnBuilder.newColumn('NumberSighted').withTitle('Number Sighted'),
        DTColumnBuilder.newColumn('SightingDate').withTitle('Date Sighted').renderWith(function (data, type) {
            return $filter('date')(data, 'dd MMM yyyy', '+0000');    //could use currency/date or any angular filter
        }),
        DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml).withClass("text-center")
    ];

    DTInstances.getLast().then(function (dtInstance) {
        $scope.dtInstance = dtInstance;
    });

    function edit(id) {
        // Edit some data and call server to make changes...
        $scope.addMode = !$scope.addMode;
        $scope.get(id);
    }

    function createdRow(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }

    function actionsHtml(data, type, full, meta) {
        return '<div class="gradeX">' +
        '<button class="btn btn-primary btn-sm" data-ng-click="edit(' + data.WildlifeSightingID + ')">' +
            '   <i class="fa fa-edit"></i>' +
            '</button>&nbsp;' +
            '<button class="btn btn-white btn-sm" data-ng-click="delete(' + data.WildlifeSightingID + ')">' +
            '   <i class="fa fa-trash-o"></i>' +
            '</button>' +
            '</div>';
    }

    $scope.toggleEdit = function () {
        this.friend.editMode = !this.friend.editMode;
    };

    $scope.toggleAdd = function () {
        $scope.addMode = !$scope.addMode;
        ClearModels();
    };


    //To Clear all input controls.
    function ClearModels() {
        $scope.SpeciesID = "";
        $scope.Location = "";
        $scope.Notes = "";
        $scope.OperType = 1;
        $scope.NumberSighted=0;
        $scope.Image = "";
        if (marker)
            marker.setMap(null);
        if (rectangle)
            rectangle.setMap(null);
        vm.map.setZoom(4);
    }

    //To Create new record and Edit an existing Record.
    $scope.save = function () {
        var WildlifeSighting = {
            SpeciesID: $scope.SpeciesID,
            Location: $scope.Location,
            Notes: $scope.Notes,
            SightingDate: $scope.SightingDate,
            USNG: $scope.USNG,
            Photo: $scope.Image,
            NumberSighted: $scope.NumberSighted,
            UserID: 2//hard coded here till we figure out how to retrieve session variable 
        };

        console.log('Scope Location At Saving :' + $scope.Location + ' Operation' + $scope.OperType + ' Object ' + JSON.stringify(WildlifeSighting));

        if ($scope.OperType === 1) {
            var promisePost = wildlifesightingService.post(WildlifeSighting);
            promisePost.then(function (pl) {
                $scope.dtInstance.reloadData();
                ClearModels();
            }, function (err) {
                console.log("Err" + err);
            });
        } else {
            //Edit the record             
            WildlifeSighting.WildlifeSightingID = $scope.WildlifeSightingID;
            var promisePut = wildlifesightingService.put($scope.WildlifeSightingID, WildlifeSighting);
            promisePut.then(function (pl) {
                $scope.Message = "Wildlife Sighting Updated Successfuly";
                $scope.dtInstance.reloadData();
                ClearModels();
            }, function (err) {
                console.log("Err" + err);
            });
        }

        $scope.addMode = !$scope.addMode;
    };


    //To Get User Detail on the Base of User ID
    $scope.get = function (id) {
        var promiseGetSingle = wildlifesightingService.get(id);

        promiseGetSingle.then(function (pl) {
            var res = pl.data;
            $scope.SpeciesID = res.SpeciesID;
            $scope.Location = res.Location;
            $scope.Notes = res.Notes;
            $scope.SightingDate = res.SightingDate;
            $scope.USNG = res.USNG,
            $scope.Image = res.Photo,
            $scope.NumberSighted = res.NumberSighted,
            $scope.WildlifeSightingID = res.WildlifeSightingID,
            $scope.OperType = 0;

            var loc = $scope.Location.split(",")
            var lat = parseFloat(loc[0])
            var lng = parseFloat(loc[1])
            var newlatlng = new google.maps.LatLng(lat, lng);

            marker = new google.maps.Marker({
                position: newlatlng,
                map: vm.map,
                draggable: true,
                animation: google.maps.Animation.DROP
            });

            shadeUTMZone(newlatlng);
        },
        function (errorPl) {
            console.log('Some Error in Getting Details', errorPl);
        });
    }

    //get all the species 
    getAllSpecies();
    function getAllSpecies() {
        speciesService.getAllSpecies()
            .success(function (species) {
                $scope.Species = species;
            })
            .error(function (error) {
                $scope.status = 'Unable to load species data: ' + error.message;

            });
    };
});


//speciesReportController
app.controller('speciesReportController', function ($scope, $q, speciesService, $timeout, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, NgMap) {

    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return speciesService.getSpecies();
    }).withPaginationType('full_numbers').withDOM('Bfrtip').withOption('createdRow', createdRow).withButtons([
        {
            extend: 'copy',
            exportOptions: {
                columns: ':visible'
            }
        },
            {
                extend: 'csv',
                exportOptions: {
                    columns: ':visible'
                }
            },
            {
                extend: 'print',
                exportOptions: {
                    columns: ':visible'
                }
            }
    ]);


    $scope.dtColumns = [
        DTColumnBuilder.newColumn('SpeciesID').withTitle('Species ID').notVisible(),
        DTColumnBuilder.newColumn('SpeciesName').withTitle('Species Name'),
        DTColumnBuilder.newColumn('SpeciesDescription').withTitle('Species Description')
    ];

    DTInstances.getLast().then(function (dtInstance) {
        $scope.dtInstance = dtInstance;
    });

    function createdRow(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }
});


//sightingsReportController
app.controller('sightingsReportController', function ($scope, $q, wildlifesightingService,speciesService, $timeout, $compile, $filter, DTOptionsBuilder, DTColumnBuilder, DTInstances, NgMap) {
    $scope.OperType = 1;//1 Means New Entry
    $scope.searchMode = true;
    $scope.isAddress = true;
    $scope.date_rdv = $filter('date')(Date.now(), 'MM/dd/yyyy');
   

    // Instatiation of the USNG mapping function
    var usngConv = new USNG2();
    var utmMap = new usngConv.UTM();

    //Graticules are another word for 'overlays', just implemented as a whole instead of individually
    var graticuleDisplay = null;

    var rectangle, southEast, northWest;
    var markers = [];
    var rectangles = [];
    var infowindow = null;

    var vm = this;
    NgMap.getMap().then(function (map) {
        vm.map = map;

        //Instatiated the graticuleDisplay
        graticuleDisplay = new USNGGraticule(vm.map, gridstyle);
        getAllWildlifeSightings();
    });

    //changeAddressType
    $scope.changeAddressType = function () {
        if (!$scope.isAddress)
            $scope.isAddress = true;
        else
            $scope.isAddress = false;
        console.log('The value of IsAddress is ' + $scope.isAddress);
    }

    vm.shadeMarkerUTMZones = function () {
        clearRectangles();
        for (var i = 0; i < markers.length; i++) {
            drawUTMZone(markers[i].position);
        }
    }

    //get the number of species sighted
    getSpeciesCount = function (SpeciesID) {
        var speciesCount=0;
        
        for (var i = 0; i < vm.Wildlifesightings.length; i++) {
            if (vm.Wildlifesightings[i].Species.SpeciesID == SpeciesID) {
                speciesCount++;
            }
        }

        return speciesCount;
    }

    //get all the species 
    getAllSpecies();
    function getAllSpecies() {
        speciesService.getAllSpecies()
            .success(function (species) {
                $scope.Species = species;
            })
            .error(function (error) {
                $scope.status = 'Unable to load species data: ' + error.message;
            });
    };

    function getAllWildlifeSightings() {
        wildlifesightingService.getAllWildlifesightings()
            .success(function (wildlifesightings) {
                vm.Wildlifesightings = wildlifesightings;
                var length = vm.Wildlifesightings.length;

                /* now inside your initialise function */
                infowindow = new google.maps.InfoWindow({
                    content: "holding..."
                });

                for (var i = 0; i < length; i++) {
                    // Do something with yourArray[i].
                    var loc = vm.Wildlifesightings[i].Location.split(",");
                    var lat = parseFloat(loc[0]);
                    var lng = parseFloat(loc[1]);
                    var newlatlng = new google.maps.LatLng(lat, lng);

                    var marker = new google.maps.Marker({
                        position: newlatlng,
                        map: vm.map,
                        content: '<div>' +
                                    '<img height="90" width="90" src="data:' + vm.Wildlifesightings[i].Photo + '" hspace="5" align="left" /> Address (USNG) : ' + vm.Wildlifesightings[i].USNG + '  <br> Species Name : ' + vm.Wildlifesightings[i].Species.SpeciesName + ' <br>' +
                        ' Number Sighted : ' + vm.Wildlifesightings[i].NumberSighted + ' <br> Sighted by : ' + vm.Wildlifesightings[i].User.UserFullNames + ' <br> Notes: ' + vm.Wildlifesightings[i].Notes + '',
                        clickable: true,
                        animation: google.maps.Animation.DROP
                    });

                    google.maps.event.addListener(marker, 'click', function () {
                        console.log(this.content);
                        infowindow.setContent(this.content);
                        infowindow.open(vm.map, this);
                    });

                    switch (vm.Wildlifesightings[i].SpeciesID) {
                        case 1:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                            break;
                        case 4:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/orange-dot.png');
                            break;
                        case 6:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                            break;
                        case 7:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
                            break;
                        case 10:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                            break;
                        default:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                            break;
                    }

                    markers.push(marker);
                    clearRectangles();
                    for (var i = 0; i < markers.length; i++) {
                        drawUTMZone(markers[i].position);
                    }
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load wildlife sighitngs data: ' + error.message;
            });
    };

    $scope.getWildlifeSightingsBySpeciesId = function () {
        console.log($scope.SpeciesID);
        if ($scope.SpeciesID == null) {
            getAllWildlifeSightings();
        } else {
            wildlifesightingService.getWildlifesighitingsbySpeciesId($scope.SpeciesID)
            .success(function (wildlifesightings) {
                clearMarkers();//clear all previous markers
                clearRectangles();
                vm.Wildlifesightings = wildlifesightings;
                var length = vm.Wildlifesightings.length;


                /* now inside your initialise function */
                infowindow = new google.maps.InfoWindow({
                    content: "holding..."
                });

                for (var i = 0; i < length; i++) {
                    // Do something with yourArray[i].
                    var loc = vm.Wildlifesightings[i].Location.split(",");
                    var lat = parseFloat(loc[0]);
                    var lng = parseFloat(loc[1]);
                    var newlatlng = new google.maps.LatLng(lat, lng);

                    var marker = new google.maps.Marker({
                        position: newlatlng,
                        map: vm.map,
                        content: '<div>' +
                                    '<img height="90" width="90" src="data:' + vm.Wildlifesightings[i].Photo + '" hspace="5" align="left" /> Address (USNG) : ' + vm.Wildlifesightings[i].USNG + '  <br> Species Name : ' + vm.Wildlifesightings[i].Species.SpeciesName + ' <br>' +
                        ' Number Sighted : ' + vm.Wildlifesightings[i].NumberSighted + ' <br> Sighted by : ' + vm.Wildlifesightings[i].User.UserFullNames + ' <br> Notes: ' + vm.Wildlifesightings[i].Notes + '',
                        clickable: true,
                        animation: google.maps.Animation.DROP
                    });


                    google.maps.event.addListener(marker, 'click', function () {
                        console.log(this.content);
                        infowindow.setContent(this.content);
                        infowindow.open(vm.map, this);
                    });

                    switch (vm.Wildlifesightings[i].SpeciesID) {
                        case 1:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                            break;
                        case 4:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/orange-dot.png');
                            break;
                        case 6:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                            break;
                        case 7:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
                            break;
                        case 10:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                            break;
                        default:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                            break;
                    }

                    markers.push(marker);
                }

                for (var i = 0; i < markers.length; i++) {
                    drawUTMZone(markers[i].position);
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load wildlife sighitngs data: ' + error.message;
            });
        }
    };

    $scope.getWildlifeSightingsByUserId= function () {
        console.log($scope.UserID);
        if ($scope.UserID == null) {
            getAllWildlifeSightings();
        } else {
            wildlifesightingService.getWildlifesightingbyUserId($scope.UserID)
            .success(function (wildlifesightings) {
                clearMarkers();//clear all previous markers
                clearRectangles();
                vm.Wildlifesightings = wildlifesightings;
                var length = vm.Wildlifesightings.length;

                /* now inside your initialise function */
                infowindow = new google.maps.InfoWindow({
                    content: "holding..."
                });

                for (var i = 0; i < length; i++) {
                    // Do something with yourArray[i].
                    var loc = vm.Wildlifesightings[i].Location.split(",");
                    var lat = parseFloat(loc[0]);
                    var lng = parseFloat(loc[1]);
                    var newlatlng = new google.maps.LatLng(lat, lng);

                    var marker = new google.maps.Marker({
                        position: newlatlng,
                        map: vm.map,
                        content: '<div>' +
                                    '<img height="90" width="90" src="data:' + vm.Wildlifesightings[i].Photo + '" hspace="5" align="left" /> Address (USNG) : ' + vm.Wildlifesightings[i].USNG + '  <br> Species Name : ' + vm.Wildlifesightings[i].Species.SpeciesName + ' <br>' +
                        ' Number Sighted : ' + vm.Wildlifesightings[i].NumberSighted + ' <br> Sighted by : ' + vm.Wildlifesightings[i].User.UserFullNames + ' <br> Notes: ' + vm.Wildlifesightings[i].Notes + '',
                        clickable: true,
                        animation: google.maps.Animation.DROP
                    });

                    google.maps.event.addListener(marker, 'click', function () {
                        console.log(this.content);
                        infowindow.setContent(this.content);
                        infowindow.open(vm.map, this);
                    });

                    switch (vm.Wildlifesightings[i].SpeciesID) {
                        case 1:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                            break;
                        case 4:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/orange-dot.png');
                            break;
                        case 6:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
                            break;
                        case 7:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/purple-dot.png');
                            break;
                        case 10:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                            break;
                        default:
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                            break;
                    }

                    markers.push(marker);
                }

                for (var i = 0; i < markers.length; i++) {
                    drawUTMZone(markers[i].position);
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load wildlife sighitngs data: ' + error.message;
            });
        }
    };

    // Removes the markers from the map, but keeps them in the array.
    function clearMarkers() {
        setMapOnAll(null);
        markers = [];
    }

    // Sets the map on all markers in the array.
    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

    // Removes the markers from the map, but keeps them in the array.
    function clearRectangles() {
        for (var i = 0; i < rectangles.length; i++) {
            rectangles[i].setMap(null);
        }
        rectangles = [];
    }

    vm.shadeMarkerUTMZones = function () {
        clearRectangles();
        for (var i = 0; i < markers.length; i++) {
            drawUTMZone(markers[i].position);
        }
    }

    function shadeUTMZone(location) {

        var mouseLL = location;
        var mouseUSNG = usngConv.fromLonLat({ lon: mouseLL.lng(), lat: mouseLL.lat() }, 5);

        var locati = mouseUSNG.substring(0, 6);
        var leftBottomUSNG = mouseUSNG.substring(6, 12);
        var rightTopUSNG = mouseUSNG.substring(12, 18);


        //37N DC 7996 0840
        //37N DC 7999 0849
        //37N EB 99990 99990

        var leftBottomLL = usngConv.toLonLat(locati + leftBottomUSNG + '0' + rightTopUSNG + '0', null);
        southEast = locati + leftBottomUSNG + '0' + rightTopUSNG + '0';
        northWest = locati + leftBottomUSNG + '99' + rightTopUSNG + '99';


        var rightTopLL = usngConv.toLonLat(locati + leftBottomUSNG + '99' + rightTopUSNG + '99', null);


        console.log('Location Left Botoom :' + JSON.stringify(leftBottomLL));
        console.log('Location Right Top :' + JSON.stringify(rightTopLL));

        rectangle = new google.maps.Rectangle({
            strokeColor: '#00cc66',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#00cc66',
            fillOpacity: 0.35,
            map: vm.map,
            bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
            new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
        });
        rectangles.push(rectangle);
        //vm.map.setZoom(9);
        //vm.map.panTo(location);

    }

    function drawUTMZone(location) {
        console.log("Current zoom level is: " + vm.map.getZoom());



        var mouseLL = location;
        var mouseUSNG = usngConv.fromLonLat({ lon: mouseLL.lng(), lat: mouseLL.lat() }, 5);

        var locati = mouseUSNG.substring(0, 6);
        var leftBottomUSNG = mouseUSNG.substring(6, 12);
        var rightTopUSNG = mouseUSNG.substring(12, 18);


        //37N DC 7996 0840
        //37N DC 7999 0849
        //37N EB 99990 99990

        var leftBottomLL = usngConv.toLonLat(locati + leftBottomUSNG + '0' + rightTopUSNG + '0', null);
        southEast = locati + leftBottomUSNG + '0' + rightTopUSNG + '0';
        northWest = locati + leftBottomUSNG + '99' + rightTopUSNG + '99';


        if (vm.map.getZoom() == 12) {

            var baseAddress = southEast.substring(0, 6);
            var baseLon = southEast.substring(6, 9);
            var baseLat = southEast.substring(13, 16);


            var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
            var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);


            rectangle = new google.maps.Rectangle({
                strokeColor: '#00cc66',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#00cc66',
                fillOpacity: 0.35,
                map: vm.map,
                bounds: new google.maps.LatLngBounds(
                new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
            });

            rectangles.push(rectangle);
            //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
            //vm.map.panTo(panLocation);

        } else {
            if (vm.map.getZoom() == 11) {

                //37M CS 6580 7940
                //37M DS 0490 4070
                //36N VG 0740 3600
                //37M ET 0260 7660

                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 9);
                var baseLat = southEast.substring(13, 16);

                var newBaseLon = parseInt(baseLon);
                var newBaseLat = parseInt(baseLat);
                newBaseLat += 1;
                var newTopRightLon = parseInt(baseLon);
                newTopRightLon += 1;
                var newTopRightLat = parseInt(baseLat);
                newTopRightLat += 1;

                console.log('Base Lon : ' + baseLon + ' Base Lat: ' + baseLat + ' New Base Lon : ' + newBaseLon + ' : ' + newBaseLat);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon);
                //vm.map.panTo(panLocation);

            }

            if (vm.map.getZoom() == 10) {

                //37M CS 6580 7940
                //37M DS 0490 4070
                //37N CD 2670 3990

                console.log('Hapa ni zoom level 10');

                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 9);
                var baseLat = southEast.substring(13, 16);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 13 || vm.map.getZoom() <= 16) {

                var baseAddress = southEast.substring(0, 6);
                //var baseLon = southEast.substring(6, 10);
                //var baseLat = southEast.substring(13, 17);
                var baseLon = southEast.substring(6, 9);
                var baseLat = southEast.substring(13, 16);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });
                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 17 || vm.map.getZoom() == 18) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 10);
                var baseLat = southEast.substring(13, 17);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 19 || vm.map.getZoom() == 20) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 11);
                var baseLat = southEast.substring(13, 18);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }

            if (vm.map.getZoom() == 21) {


                var baseAddress = southEast.substring(0, 6);
                var baseLon = southEast.substring(6, 11);
                var baseLat = southEast.substring(13, 18);

                var leftBottomLL = usngConv.toLonLat(baseAddress + baseLon + '00' + baseLat + '00', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + baseLon + '99' + baseLat + '99', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }
            if (vm.map.getZoom() == 9) {

                var baseAddress = southEast.substring(0, 6);

                var leftBottomLL = usngConv.toLonLat(baseAddress + '0000' + '0000', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + '9999' + '9999', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }


            if (vm.map.getZoom() == 6 || vm.map.getZoom() <= 8) {

                var baseAddress = southEast.substring(0, 6);

                var leftBottomLL = usngConv.toLonLat(baseAddress + '0000' + '0000', null);
                var rightTopLL = usngConv.toLonLat(baseAddress + '9999' + '9999', null);

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(leftBottomLL.lat, leftBottomLL.lon),
                    new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon))
                });

                rectangles.push(rectangle);
                //var panLocation = new google.maps.LatLng(rightTopLL.lat, rightTopLL.lon);
                //vm.map.panTo(panLocation);
            }


            if (vm.map.getZoom() <= 5) {
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



                var zoneNo = southEast.substring(0, 2);
                var latZone = southEast.substring(2, 3);

                var easternBoundary = parseInt(zoneNo);
                easternBoundary = (easternBoundary * 6) - 180;
                var westernBoundary = easternBoundary - 6;

                var southernBoundary;

                switch (latZone) {
                    case "F":
                        southernBoundary = -56;
                        break;
                    case "G":
                        southernBoundary = -48;
                        break;
                    case "H":
                        southernBoundary = -40;
                        break;
                    case "J":
                        southernBoundary = -32;
                        break;
                    case "K":
                        southernBoundary = -24;
                        break;
                    case "L":
                        southernBoundary = -16;
                        break;
                    case "M":
                        southernBoundary = -8;
                        break;
                    case "N":
                        southernBoundary = 0;
                        break;
                    case "P":
                        southernBoundary = 8;
                        break;
                    case "Q":
                        southernBoundary = 16;
                        break;
                    case "R":
                        southernBoundary = 24;
                        break;
                    case "S":
                        southernBoundary = 32;
                        break;
                    case "T":
                        southernBoundary = 40;
                        break;
                    case "U":
                        southernBoundary = 48;
                        break;
                    case "V":
                        southernBoundary = 56;
                        break;
                    case "W":
                        southernBoundary = 64;
                        break;
                }


                var northernBoundary = parseInt(southernBoundary);
                northernBoundary += 8;

                rectangle = new google.maps.Rectangle({
                    strokeColor: '#00cc66',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#00cc66',
                    fillOpacity: 0.35,
                    map: vm.map,
                    bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(southernBoundary, westernBoundary),
                    new google.maps.LatLng(northernBoundary, easternBoundary))
                });

                rectangles.push(rectangle);
                // var panLocation = new google.maps.LatLng(southernBoundary, easternBoundary)
                //vm.map.setCenter(panLocation);

            }
        }
    };

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

    //Geocode the address, pan/zoom the map, and create a marker via the markers.js script
    function codeAddress(addrTxt) {
        var address = addrTxt;
        locationGeocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                map.fitBounds(results[0].geometry.viewport);
                createMarker(results[0].geometry.location, results[0].formatted_address);
            } else {
                alert("Geocode was not found for the following reason: " + status);
            }
        });
    }

    vm.placeChanged = function () {
        vm.types = "['address']";
        vm.place = this.getPlace();
        var address = vm.address;
        console.log('The location before', address.substring(0, 4));
        if (isNumeric(address.substring(0, 4)) && $scope.isAddress) {
            console.log('The location after', address.substring(0, 4));
            var loc = address.split(",");
            var lat = parseFloat(loc[0]);
            var lng = parseFloat(loc[1]);
            var newlatlng = new google.maps.LatLng(lat, lng);
            vm.map.setCenter(newlatlng);
            vm.map.setZoom(8);
        } else {
            if (isNumeric(address.substring(0, 2)) && !$scope.isAddress) {
                console.log('location using USNG');
                convUSNG(address);
            }
            else {
                console.log('location', JSON.stringify(vm.place.geometry.location));
                vm.map.setCenter(vm.place.geometry.location);
                vm.map.setZoom(8);
            }
        }
    }

    //Convert a USNG string to a lat long for a marker and zooming
    function convUSNG(location) {
        var usngZlev = null; //set up a zoom level for use later
        try {
            var foundLLobj = usngConv.toLonLat(location, null);
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

        //vm.map.setZoom(usngZlev);
        console.log("New zoom level is: " + usngZlev);
        var foundLatLng = new google.maps.LatLng(foundLLobj.lat, foundLLobj.lon);
        vm.map.setCenter(foundLatLng);
        vm.map.setZoom(8);
        //map.setCenter(foundLatLng);
        //createMarker(foundLatLng, null);
    }

    function isNumeric(n) {
        if (typeof (n) === 'string') {
            n = n.replace(/,/, ".");
        }
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    //Datatable setup 
    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return wildlifesightingService.getWildlifesightings();
    }).withPaginationType('full_numbers').withDOM('frtip').withOption('createdRow', createdRow).withButtons([
        {
            extend: 'copy',
            exportOptions: {
                columns: ':visible'
            }
        },
            {
                extend: 'csv',
                exportOptions: {
                    columns: ':visible'
                }
            },
            {
                extend: 'print',
                exportOptions: {
                    columns: ':visible'
                }
            }
    ]);


    $scope.dtColumns = [
        DTColumnBuilder.newColumn('WildlifeSightingID').withTitle('ID').notVisible(),
        DTColumnBuilder.newColumn('Species.SpeciesName').withTitle('Species Name'),
        DTColumnBuilder.newColumn('Notes').withTitle('Notes'),
        DTColumnBuilder.newColumn('User.UserFullNames').withTitle('Sighted By'),
       DTColumnBuilder.newColumn('SightingDate').withTitle('Date Sighted').renderWith(function (data, type) {
           return $filter('date')(data, 'dd MMM yyyy', '+0000');    //could use currency/date or any angular filter
       }),
        DTColumnBuilder.newColumn('USNG').withTitle('Location')
    ];

    DTInstances.getLast().then(function (dtInstance) {
        $scope.dtInstance = dtInstance;
    });

    function createdRow(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }
});
