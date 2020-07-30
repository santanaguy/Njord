using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Njord.Helpers;
using Njord.Models;
using Njord.ViewModels;

namespace Njord.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ScenarioController : ControllerBase
    {
        private IWebHostEnvironment hostingEnvironment;
        private readonly IMapper mapper;
        public ScenarioController(IWebHostEnvironment env, IMapper mapper)
        {
            hostingEnvironment = env;
            this.mapper = mapper;
        }


        ///<summary>
        /*This method will create a .json file and return its name if the targets are correctly configured.
        The intended flow is then for the frontend to call the GetBlobDownload method, which will allow the 
        client to download the file.
        */
        ///</summary>
        [HttpPost]
        public async Task<List<Result>> Post(List<TargetVM> targets)
        {
            var fileName = Guid.NewGuid();
            var pathToFile = Path.Combine(hostingEnvironment.WebRootPath, fileName + ".json");

            //Check interval and duration for all generators
            if (targets.SelectMany(x => x.PositionGenerators).Any(x => x.IntervalMilliseconds <= 0 || x.DurationMilliseconds <= 0))
                return new List<Result> { Results.IntervalDuration };

            //Check that the applicable generators all have a position set
            if (targets.SelectMany(x => x.PositionGenerators)
                .Where(x =>
                    x.Type == PositionGeneratorType.Fixed ||
                    x.Type == PositionGeneratorType.SpeedBearing)
                .Any(x => x.Position == null))
                return new List<Result> { Results.PositionMissing };

            //Check that the route generators have a route set
            if (targets.SelectMany(x => x.PositionGenerators)
                            .Where(x => x.Type == PositionGeneratorType.LineString)
                            .Any(x => x.Position == null))
                return new List<Result> { Results.RouteMissing };

            //Check that the AIS targets have an MMSI
            if (targets.SelectMany(x => x.PositionGenerators)
                            .Where(x => x.TrackType == "AIS")
                            .Any(x => x.MMSI == null))
                return new List<Result> { Results.MMSIMissing };

            //Check that the AIS targets have an MMSI
            if (targets.SelectMany(x => x.PositionGenerators)
                        .Where(x => x.TrackType != null && x.TrackType != "AIS")
                        .Any(x => x.TrackNumber == null))
                return new List<Result> { Results.TrackNumberMissing };

            using (StreamWriter s = System.IO.File.CreateText(pathToFile))
            {
                var toSerialize = new
                {
                    targets = targets.Select(x =>
                        new Target(mapper.Map<List<PositionGenerator>>(x.PositionGenerators)))
                };

                await s.WriteAsync(JsonSerializer.Serialize(toSerialize, new JsonSerializerOptions() { IgnoreNullValues = true }));
            }
            return new List<Result> { Results.OK.withData(fileName.ToString()) };
        }

        [HttpGet("download")]
        public IActionResult GetBlobDownload([FromQuery] string file)
        {
            var filePath = Path.Combine(hostingEnvironment.WebRootPath, file + ".json");
            if (System.IO.File.Exists(filePath) == false)
                return NotFound();
            var content = new System.IO.FileStream(filePath, FileMode.Open);
            var contentType = "APPLICATION/octet-stream";
            var fileName = "scenario.json";
            return File(content, contentType, fileName);
        }
    }
}

