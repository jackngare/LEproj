using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using WildlifeTracking.Models;

namespace WildlifeTracking.Infrastructure
{
    //Interaction with the database in the cloud
    public class WildlifeTrackingDb:DbContext
    {
        public WildlifeTrackingDb(): base("WildlifeTrackingConnectionString")
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<Species> Species { get; set; }
        public DbSet<Wildlifesighting> Wildlifesightings { get; set; }
    }
}