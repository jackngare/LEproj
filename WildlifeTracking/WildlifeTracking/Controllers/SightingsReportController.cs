using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WildlifeTracking.Controllers
{
    public class SightingsReportController : Controller
    {
        // GET: SightingsReport
        public ActionResult Index()
        {
            return View();
        }
    }
}