using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using Njord.Helpers;

namespace Njord.Models
{
    public class Target
    {
        private readonly uint? _mmsi;
        private readonly string _trackType;
        private uint? _trackNumber;

        public Target(List<PositionGenerator> positions)
        {
            Positions = positions;
            _mmsi = positions.FirstOrDefault(x=> x.MMSI != null)?.MMSI;
            _trackType = positions.FirstOrDefault().TrackType;
            _trackNumber = positions.FirstOrDefault(x=> x.TrackNumber != null)?.TrackNumber;
        }

        public uint? MMSI => _mmsi; 
        public string TrackType => _trackType;

        public uint? TrackNumber => _trackNumber;
        
        public List<PositionGenerator> Positions { get; set; }
    }
}