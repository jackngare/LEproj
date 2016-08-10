using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using WildlifeTracking.Infrastructure;
using WildlifeTracking.Models;

namespace WildlifeTracking.Controllers
{
    public class WildlifesightingsController : ApiController
    {
        private WildlifeTrackingDb db = new WildlifeTrackingDb();

        // GET: api/Wildlifesightings
        public IQueryable<Wildlifesighting> GetWildlifesightings()
        {
            return db.Wildlifesightings.Include(s => s.Species)
                                       .Include(u => u.User);
        }


        // GET: api/Wildlifesightings
        [HttpGet]
        [ActionName("GetWildlifesightingsBySpeciesId")]
        public IQueryable<Wildlifesighting> GetWildlifesightingsBySpeciesId(int id)
        {
            return db.Wildlifesightings.Where(s => s.SpeciesID == id)
                                       .Include(s => s.Species)
                                       .Include(u => u.User)
                                      ;
        }

        // GET: api/Wildlifesightings
        [HttpGet]
        [ActionName("getWildlifesightingsCountBySpeciesId")]
        public Int32 getWildlifesightingsCountBySpeciesId(int id)
        {
            return db.Wildlifesightings.Where(s => s.SpeciesID == id).Count();                      
        }

        // GET: api/Wildlifesightings
        [HttpGet]
        [ActionName("GetWildlifesightingsByUserId")]
        public IQueryable<Wildlifesighting> GetWildlifesightingsByUserId(int id)
        {

            var session = HttpContext.Current.Session;
            if (session != null)
            {
                if (session["LogedUserID"] == null)
                    id = 2;
                else
                    id = Int32.Parse(session["LogedUserID"].ToString());

            }

            return db.Wildlifesightings.Where(s => s.UserID == id)
                                       .Include(s => s.Species)
                                       .Include(u => u.User);
        }


        // GET: api/Wildlifesightings
        [HttpGet]
        [ActionName("GetWildlifeSightingByUserId")]
        public IQueryable<Wildlifesighting> GetWildlifeSightingByUserId(int id)
        {
            return db.Wildlifesightings.Where(s => s.UserID == id)
                                       .Include(s => s.Species)
                                       .Include(u => u.User);
        }
        // GET: api/Wildlifesightings
        [HttpGet]
        [ActionName("GetWildlifesightingsStatsByUserId")]
        public SightingStats GetWildlifesightingsStatsByUserId(int id)
        {

            var session = HttpContext.Current.Session;
            if (session != null)
            {
                if (session["LogedUserID"] == null)
                    id = 2;
                else
                    id = Int32.Parse(session["LogedUserID"].ToString());

            }

           var query= db.Wildlifesightings.Where(s => s.UserID == id)
                                       .Include(s => s.Species)
                                       .Include(u => u.User);

            return new SightingStats { SpeciesCount = query.Select(p=>p.SpeciesID).Distinct().Count(),AnimalsCount=query.Count(),MonthlyCount=query.Where(p=> p.SightingDate.Month==DateTime.Now.Month).Count(),YearlyCount=query.Count() };
        }

        // GET: api/Wildlifesightings/5
        [ActionName("GetWildlifesighting")]
        [HttpGet]
        [ResponseType(typeof(Wildlifesighting))]
        public IHttpActionResult GetWildlifesighting(int id)
        {
            Wildlifesighting wildlifesighting = db.Wildlifesightings.Find(id);
            if (wildlifesighting == null)
            {
                return NotFound();
            }

            return Ok(wildlifesighting);
        }

        // PUT: api/Wildlifesightings/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutWildlifesighting(int id, Wildlifesighting wildlifesighting)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != wildlifesighting.WildlifeSightingID)
            {
                return BadRequest();
            }

            db.Entry(wildlifesighting).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WildlifesightingExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Wildlifesightings
        [ResponseType(typeof(Wildlifesighting))]
        public IHttpActionResult PostWildlifesighting(Wildlifesighting wildlifesighting)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var session = HttpContext.Current.Session;
            if (session != null)
            {
                if (session["LogedUserID"] == null)
                    wildlifesighting.UserID = 2;
                else
                    wildlifesighting.UserID = Int32.Parse(session["LogedUserID"].ToString());

            }
            
            db.Wildlifesightings.Add(wildlifesighting);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = wildlifesighting.WildlifeSightingID }, wildlifesighting);
        }

        // DELETE: api/Wildlifesightings/5
        [ResponseType(typeof(Wildlifesighting))]
        public IHttpActionResult DeleteWildlifesighting(int id)
        {
            Wildlifesighting wildlifesighting = db.Wildlifesightings.Find(id);
            if (wildlifesighting == null)
            {
                return NotFound();
            }

            db.Wildlifesightings.Remove(wildlifesighting);
            db.SaveChanges();

            return Ok(wildlifesighting);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool WildlifesightingExists(int id)
        {
            return db.Wildlifesightings.Count(e => e.WildlifeSightingID == id) > 0;
        }
    }
}