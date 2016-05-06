using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WildlifeTracking.Models
{
    public class Species
    {
        public int SpeciesID { get; set; }
        public string SpeciesName { get; set; }
        public string SpeciesDescription { get; set; }
    }
}