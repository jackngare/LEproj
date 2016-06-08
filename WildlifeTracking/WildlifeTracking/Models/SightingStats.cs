using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WildlifeTracking.Models
{
    public class SightingStats
    {
        public int SpeciesCount { get; set; }
        public int AnimalsCount { get; set; }
        public int MonthlyCount { get; set; }
        public int YearlyCount { get; set; }
    }
}