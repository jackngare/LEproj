using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using WildlifeTracking.App_Start;

namespace WildlifeTracking
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            // Web API routes
            config.MapHttpAttributeRoutes();

            var route=config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
          

            config.Routes.  MapHttpRoute(
                name: "CustomApi",
                routeTemplate: "api/{controller}/{action}/{SpeciesId}",
                defaults: new { SpeciesId = RouteParameter.Optional }
            );
        }
    }
}
