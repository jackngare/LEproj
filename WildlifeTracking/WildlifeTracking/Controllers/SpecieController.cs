﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WildlifeTracking.Controllers
{
    public class SpecieController : Controller
    {
        // GET: Specie
        public ActionResult Index()
        {
            return View();
        }
    }
}