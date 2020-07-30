using System;
using AutoMapper;
using Njord.Models;
using Njord.ViewModels;

namespace Njord.Helpers{
    public static class Automapper{
        public static MapperConfiguration GetConfiguration(){
            var config = new MapperConfiguration(cfg => {
                cfg.CreateMap<PositionGeneratorVM, PositionGenerator>()
                .ForMember(x=> x.Duration, opt=> opt.MapFrom(x=> TimeSpan.FromMilliseconds(x.DurationMilliseconds)))
                .ForMember(x=> x.Interval, opt=> opt.MapFrom(x=> TimeSpan.FromMilliseconds(x.IntervalMilliseconds)))
                .ForMember(x=> x.Position, opt => opt.MapFrom(x=> x.Type == PositionGeneratorType.LineString ? null : x.Position))
                .ForMember(x=> x.LineString, opt => opt.MapFrom(x=> x.Type == PositionGeneratorType.LineString ? x.LineString : null));
            });

            return config;
        }
    }
}