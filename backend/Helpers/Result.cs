namespace Njord.Helpers
{
    public static class Results
    {
        public static Result OK = new Result("OK", "Success", true);
        public static Result IntervalDuration = new Result("E1", "All position generators need periodicity and duration", false);
        public static Result PositionMissing = new Result("E2", "All Fixed or SOG/COG position generators need a valid position", false);
        public static Result RouteMissing = new Result("E3", "All Route position generators need a valid route", false);

        public static Result MMSIMissing = new Result("E4", "There are AIS position generators without MMSI", false);

        public static Result TrackNumberMissing = new Result("E5", "There are RADAR position generators without TrackNumber", false);
    }

    public struct Result
    {
        public Result(string code, string message, bool success, object data = null)
        {
            Code = code;
            Message = message;
            Success = success;
            Data = data;
        }

        public string Code { get; set; }
        public string Message { get; set; }
        public bool Success { get; set; }
        public object Data {get;set;}

        public Result withData(object data = null){
            return new Result(Code, Message, Success, data);
        }
    }
}