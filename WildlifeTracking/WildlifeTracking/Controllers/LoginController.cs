using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WildlifeTracking.Infrastructure;

namespace WildlifeTracking.Controllers
{
    public class LoginController : Controller
    {
        // GET: Login
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(string username, string userpassword)
        {
            using(WildlifeTrackingDb db=new WildlifeTrackingDb())
            {
                var user = db.Users.Where(u => u.UserName==(username) && u.UserPassword==userpassword).FirstOrDefault();
                if(user != null)
                {
                    Session["LogedUserID"] = user.UserID.ToString();
                    Session["LogedUserFullname"] = user.UserFullNames.ToString();
                    return RedirectToAction("Index", "Home");
                }
            }
            return View("Index");
        }
    }
}