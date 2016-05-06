using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
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
            return db.Wildlifesightings;
        }

        // GET: api/Wildlifesightings/5
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