using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WildlifeTracking.Controllers
{
    public class LandingController : Controller
    {
        // GET: Landing
        public ActionResult Index()
        {
            Session["LogedUserID"] =null;
            Session["LogedUserFullname"] = null;
            return View();
        }
    }
}