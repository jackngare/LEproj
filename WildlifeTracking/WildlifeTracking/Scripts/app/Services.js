//landingService
app.service('landingService', function ($http, $q) {
    this.post = function (User) {

        //Implement a promise ($q)
        var deferred = $q.defer();

        $http.post("/api/Users", User)
         .then(function (result) {
             //Successful            
             //Tell anyone that binds to the topics that it has been initialised
             deferred.resolve(result.data);     //Data can be returned as parameters
         },
       function () {
           //Error - We dont want the data service to interact with the UI directly
           deferred.reject();
       });

        return deferred.promise;
    };

    function getByUsername(username) {
        var deferred = $q.defer();
        var filtered = $filter('filter')(getAllUser(), { username: username });
        var user = filtered.length ? filtered[0] : null;
        deferred.resolve(user);
        return deferred.promise;
    }

    //Get Single Records
    this.get = function (UserID) {
        return $http.get("/api/Users/" + UserID);
    }

    //Get All User
    this.getAllUser = function () {
        return $http.get("/api/Users");
    }

    //Get the User from the server and add it to the local collection
    this.getUsers = function () {

        //Implement a promise ($q)
        var deferred = $q.defer();

        $http.get("/api/Users")
          .then(function (result) {
              //Successful            
              //Tell anyone that binds to the topics that it has been initialised
              deferred.resolve(result.data);     //Data can be returned as parameters
          },
        function () {
            //Error - We dont want the data service to interact with the UI directly
            deferred.reject();
        });

        return deferred.promise;
    };
    //Update the Record
    this.put = function (UserID, User) {
        var request = $http({
            method: "put",
            url: "/api/Users/" + UserID,
            data: User
        });
        return request;
    }

    //Delete the Record
    this.delete = function (UserID) {
        var request = $http({
            method: "delete",
            url: "/api/Users/" + UserID
        });
        return request;
    }
});

//userService
app.service('userService', function ($http, $q) {
    this.post = function (User) {

        //Implement a promise ($q)
        var deferred = $q.defer();

        $http.post("/api/Users", User)
         .then(function (result) {
             //Successful            
             //Tell anyone that binds to the topics that it has been initialised
             deferred.resolve(result.data);     //Data can be returned as parameters
         },
       function () {
           //Error - We dont want the data service to interact with the UI directly
           deferred.reject();
       });

        return deferred.promise;
    };

    function getByUsername(username) {
        var deferred = $q.defer();
        var filtered = $filter('filter')(getAllUser(), { username: username });
        var user = filtered.length ? filtered[0] : null;
        deferred.resolve(user);
        return deferred.promise;
    }

    //Get Single Records
    this.get = function (UserID) {
        return $http.get("/api/Users/" + UserID);
    }

    //Get All User
    this.getAllUser = function () {
        return $http.get("/api/Users");
    }

    //Get the User from the server and add it to the local collection
    this.getUsers = function () {

        //Implement a promise ($q)
        var deferred = $q.defer();

        $http.get("/api/Users")
          .then(function (result) {
              //Successful            
              //Tell anyone that binds to the topics that it has been initialised
              deferred.resolve(result.data);     //Data can be returned as parameters
          },
        function () {
            //Error - We dont want the data service to interact with the UI directly
            deferred.reject();
        });

        return deferred.promise;
    };
    //Update the Record
    this.put = function (UserID, User) {
        var request = $http({
            method: "put",
            url: "/api/Users/" + UserID,
            data: User
        });
        return request;
    }

    //Delete the Record
    this.delete = function (UserID) {
        var request = $http({
            method: "delete",
            url: "/api/Users/" + UserID
        });
        return request;
    }
});

//speciesService
app.service('speciesService', function ($http, $q) {
    this.post = function (Species) {

        //Implement a promise ($q)
        var deferred = $q.defer();

        $http.post("/api/Species", Species)
         .then(function (result) {
             //Successful            
             //Tell anyone that binds to the topics that it has been initialised
             deferred.resolve(result.data);     //Data can be returned as parameters
         },
       function () {
           //Error - We dont want the data service to interact with the UI directly
           deferred.reject();
       });

        return deferred.promise;
    };

    
    //Get Single Records
    this.get = function (SpeciesID) {
        return $http.get("/api/Species/" + SpeciesID);
    }

    //Get All User
    this.getAllSpecies = function () {
        return $http.get("/api/Species");
    }

    //Get the User from the server and add it to the local collection
    this.getSpecies = function () {

        //Implement a promise ($q)
        var deferred = $q.defer();

        $http.get("/api/Species")
          .then(function (result) {
              //Successful            
              //Tell anyone that binds to the topics that it has been initialised
              deferred.resolve(result.data);     //Data can be returned as parameters
          },
        function () {
            //Error - We dont want the data service to interact with the UI directly
            deferred.reject();
        });

        return deferred.promise;
    };
    //Update the Record
    this.put = function (SpeciesID, Species) {
        var request = $http({
            method: "put",
            url: "/api/Species/" + SpeciesID,
            data: Species
        });
        return request;
    }

    //Delete the Record
    this.delete = function (SpeciesID) {
        var request = $http({
            method: "delete",
            url: "/api/Species/" + SpeciesID
        });
        return request;
    }
});


//wildlifesightingService
app.service('wildlifesightingService', function ($http, $q) {
    this.post = function (Wildlifesighting) {

        //Implement a promise ($q)
        var deferred = $q.defer();

        $http.post("/api/Wildlifesightings", Wildlifesighting)
         .then(function (result) {
             //Successful            
             //Tell anyone that binds to the topics that it has been initialised
             deferred.resolve(result.data);     //Data can be returned as parameters
         },
       function () {
           //Error - We dont want the data service to interact with the UI directly
           deferred.reject();
       });

        return deferred.promise;
    };


    //Get Single Records
    this.get = function (WildlifesightingID) {
        return $http.get("/api/Wildlifesightings/" + WildlifesightingID);
    }

    //Get All Wildlifesighting
    this.getAllWildlifesightings = function () {
        return $http.get("/api/Wildlifesightings");
    }

    //Get the Wildlifesighting from the server and add it to the local collection
    this.getWildlifesightings = function () {

        //Implement a promise ($q)
        var deferred = $q.defer();

        $http.get("/api/Wildlifesightings")
          .then(function (result) {
              //Successful            
              //Tell anyone that binds to the topics that it has been initialised
              deferred.resolve(result.data);     //Data can be returned as parameters
          },
        function () {
            //Error - We dont want the data service to interact with the UI directly
            deferred.reject();
        });

        return deferred.promise;
    };
    //Update the Record
    this.put = function (WildlifesightingID, Wildlifesighting) {
        var request = $http({
            method: "put",
            url: "/api/Wildlifesightings/" + WildlifesightingID,
            data: Wildlifesighting
        });
        return request;
    }

    //Delete the Record
    this.delete = function (WildlifesightingID) {
        var request = $http({
            method: "delete",
            url: "/api/Wildlifesightings/" + WildlifesightingID
        });
        return request;
    }
});

//used to set focus on the first input control on a form
app.directive('focusMe', ['$timeout', function ($timeout) {
    return {
        scope: { trigger: '@focusMe' },
        link: function (scope, element) {
            scope.$watch('trigger', function (value) {
                if (value === "true") {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            });
        }
    };
}]);

//used to ensure that AngularJS doesn't return dtfrmt error when dealing with dates
app.directive('formatDate', function formatDate() {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, modelCtrl) {
            modelCtrl.$formatters.push(function (modelValue) {
                return new Date(modelValue);
            })
        }
    }
});
