using System;

namespace Njord.ViewModels
{
    public class PositionGeneratorVM
    {
        private string trackType;

        public uint? MMSI { get; set; }
        public uint? TrackNumber { get; set; }
        public string SourceName { get; set; }
        public byte? SourceId { get; set; }
        public string NavStatus { get; set; }
        public float? RateOfTurnDegreesPerSecond { get; set; }
        public float? SpeedOverGroundKnots { get; set; }
        public double? CourseOverGroundDegrees { get; set; }
        public double? TrueHeadingDegrees { get; set; }
        public string Destination { get; set; }
        public float? DraughtMeters { get; set; }
        public DateTime? ETA { get; set; }
        public uint? DimensionToStarboardMeters { get; set; }
        public uint? DimensionToSternMeters { get; set; }
        public uint? DimensionToBowMeters { get; set; }
        public uint? DimensionToPortMeters { get; set; }
        public string ShipType { get; set; }
        public bool? OffPosition { get; set; }
        public string Name { get; set; }
        public string Callsign { get; set; }
        public ulong? Imo { get; set; }
        public string AidType { get; set; }
        public string TargetType { get; set; }
        public string TrackType { get => trackType ?? "AIS"; set => trackType = value; }
        public string Position { get; set; } //expect wkt POINT
        public bool Repeat { get; set; }
        public string LineString { get; set; } //expect wkt LINESTRING
        public long IntervalMilliseconds { get; set; }
        public long DurationMilliseconds { get; set; }
        public PositionGeneratorType Type { get; set; }
        public bool? Simulated { get; set; }
    }
}