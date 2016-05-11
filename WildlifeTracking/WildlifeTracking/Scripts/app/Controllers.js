
//userController
app.controller('landingController', function ($scope, $q, userService,speciesService, $timeout, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances,NgMap) {
    $scope.OperType = 1;//1 Means New Entry
    $scope.searchMode = true;
    // Instatiation of the USNG mapping function
    var usngConv = new USNG2();
    var utmMap = new usngConv.UTM();
    
    //Graticules are another word for 'overlays', just implemented as a whole instead of individually
    var graticuleDisplay = null;

    var rectangle;
    var southEast, northWest;

    var vm = this;
    NgMap.getMap().then(function(map) {
        vm.map = map;
        //Instatiated the graticuleDisplay
        graticuleDisplay = new USNGGraticule(vm.map, gridstyle);
    });

    

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
     

    //To Clear all input controls.
    function ClearModels() {
        $scope.UserID = "";
        $scope.UserFullNames = "";
        $scope.UserName = "";
        $scope.UserPassword = "";
        $scope.UserEmailAddress = "";
    }

    //To Create new record and Edit an existing Record.
    $scope.save = function () {
        var User = {
            UserFullNames: $scope.UserFullNames,
            UserEmailAddress: $scope.UserEmailAddress,
            UserPassword: $scope.UserPassword,
            UserName: $scope.UserName

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
app.controller('dashboardController', function ($scope, $q, userService, $timeout, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances, NgMap) {
    $scope.OperType = 1;//1 Means New Entry
    $scope.addMode = false;
    $scope.edit = edit;
    $scope.delete = deleteRow;
    $scope.message = "";

    // Instatiation of the USNG mapping function
    var usngConv = new USNG2();
    var utmMap = new usngConv.UTM();

    //Graticules are another word for 'overlays', just implemented as a whole instead of individually
    var graticuleDisplay = null;

    var rectangle;
    var southEast, northWest;

    var vm = this;
    NgMap.getMap().then(function (map) {
        vm.map = map;
        //Instatiated the graticuleDisplay
        graticuleDisplay = new USNGGraticule(vm.map, gridstyle);
    });



    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return userService.getUsers();
    }).withPaginationType('full_numbers').withOption('createdRow', createdRow);

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('UserID').withTitle('User ID').notVisible(),
        DTColumnBuilder.newColumn('UserFullNames').withTitle('Observer'),
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
            $scope.OperType = 0;
        },
        function (errorPl) {
            console.log('Some Error in Getting Details', errorPl);
        });
    }


});


//wildlifesightingController
app.controller('wildlifesightingController', function ($scope, $q, wildlifesightingService,speciesService, $timeout, $compile, DTOptionsBuilder, DTColumnBuilder, DTInstances,NgMap) {
    $scope.OperType = 1;//1 Means New Entry
    $scope.addMode = false;
    $scope.edit = edit;
    $scope.delete = deleteRow;
    $scope.message = "";

    // Instatiation of the USNG mapping function
    var usngConv = new USNG2();
    var utmMap = new usngConv.UTM();

    //Graticules are another word for 'overlays', just implemented as a whole instead of individually
    var graticuleDisplay = null;

    var rectangle;
    var southEast, northWest;

    var vm = this;
    NgMap.getMap().then(function (map) {
        vm.map = map;
        //Instatiated the graticuleDisplay
        graticuleDisplay = new USNGGraticule(vm.map, gridstyle);
    });

    $scope.dtOptions = DTOptionsBuilder.fromFnPromise(function () {
        return wildlifesightingService.getWildlifesightings();
    }).withPaginationType('full_numbers').withOption('createdRow', createdRow);

    $scope.dtColumns = [
        DTColumnBuilder.newColumn('WildlifeSightingID').withTitle('WildlifeSightingID ID').notVisible(),
        DTColumnBuilder.newColumn('SpeciesID').withTitle('Species'),
        DTColumnBuilder.newColumn('Location').withTitle('Location'),
        DTColumnBuilder.newColumn('SightingDate').withTitle('Date'),
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
