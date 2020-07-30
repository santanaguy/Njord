using System;
using System.Collections.Generic;

namespace Njord.ViewModels
{
    public class TargetVM
    {
        public uint? MMSI { get; set; }

        public List<PositionGeneratorVM> PositionGenerators { get; set; } = new List<PositionGeneratorVM>();
    }
}