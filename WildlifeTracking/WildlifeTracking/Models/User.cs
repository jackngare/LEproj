using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WildlifeTracking.Models
{
    public class User
    {
        public int UserID { get; set; }
        public string UserName { get; set; }
        public string UserFullNames { get; set; }
        public string UserPassword { get; set; }
        public string UserEmailAddress { get; set; }
    }
}