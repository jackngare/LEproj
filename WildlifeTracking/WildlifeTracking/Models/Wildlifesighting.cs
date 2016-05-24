using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WildlifeTracking.Models
{
    public class Wildlifesighting
    {
        public int WildlifeSightingID { get; set; }
        public int UserID { get; set; }
        public int SpeciesID { get; set; }
        public string Location { get; set; }
        public DateTime SightingDate { get; set; }
        public User User { get; set; }
        public Species Species { get; set; }
        public string Notes { get; set; }
        public string USNG { get; set; }
    }
}