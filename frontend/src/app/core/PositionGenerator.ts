import { NavigationStatus, ShipType, NavaidType, TargetType, TrackType, PositionGeneratorType } from './Enums';
import { Point } from "./Point";
export class PositionGenerator {
  id: string;
  description: string;
  mmsi: number;
  trackNumber: string;
  sourceName: String;
  sourceId: number;
  navStatus: NavigationStatus;
  rateOfTurnDegreesPerSecond: number;
  speedOverGroundKnots: number;
  courseOverGroundDegrees: number;
  trueHeadingDegrees: number;
  destination: String;
  draughtMeters: number;
  eta: Date;
  dimensionToStarboardMeters: number;
  dimensionToSternMeters: number;
  dimensionToBowMeters: number;
  dimensionToPortMeters: number;
  shipType: ShipType;
  offPosition: Boolean;
  name: string;
  callsign: string;
  imo: number;
  aidType: NavaidType;
  targetType: TargetType;
  trackType: TrackType;
  position: Point = new Point(null, null);
  repeat: Boolean;
  route: Point[] = [];
  intervalMillisseconds: number;
  intervalMultiplier: number = 1000;
  durationMillisseconds: number;
  durationMultiplier: number = 1000;
  type: PositionGeneratorType;
  simulated: Boolean;

  public clone(id: string) {
    let tmp = new PositionGenerator();
    tmp.id = id;
    tmp.aidType = this.aidType;
    tmp.description = this.description;
    tmp.callsign = this.callsign;
    tmp.courseOverGroundDegrees = this.courseOverGroundDegrees;
    tmp.destination = this.destination;
    tmp.dimensionToBowMeters = this.dimensionToBowMeters;
    tmp.dimensionToPortMeters = this.dimensionToPortMeters;
    tmp.dimensionToStarboardMeters = this.dimensionToStarboardMeters;
    tmp.dimensionToSternMeters = this.dimensionToSternMeters;
    tmp.draughtMeters = this.draughtMeters;
    tmp.durationMillisseconds = this.durationMillisseconds;
    tmp.durationMultiplier = this.durationMultiplier;
    tmp.eta = this.eta;
    tmp.imo = this.imo;
    tmp.intervalMillisseconds = this.intervalMillisseconds;
    tmp.intervalMultiplier = this.intervalMultiplier;
    tmp.route = this.route.map(x => new Point(x.lat, x.lon));
    tmp.mmsi = this.mmsi;
    tmp.name = this.name;
    tmp.navStatus = this.navStatus;
    tmp.offPosition = this.offPosition;
    tmp.rateOfTurnDegreesPerSecond = this.rateOfTurnDegreesPerSecond;
    tmp.repeat = this.repeat;
    tmp.shipType = this.shipType;
    tmp.simulated = this.simulated;
    tmp.sourceId = this.sourceId;
    tmp.sourceName = this.sourceName;
    tmp.speedOverGroundKnots = this.speedOverGroundKnots;
    tmp.targetType = this.targetType;
    tmp.trackNumber = this.trackNumber;
    tmp.trackType = this.trackType;
    tmp.trueHeadingDegrees = this.trueHeadingDegrees;
    tmp.position = this.position;
    tmp.type = this.type;
    return tmp;
  }

  public routeAsLineString() {
    if (this.route.length == 0)
      return null;
    let coords = this.route.map(x => x.lat.toString() + " " + x.lon.toString()).join(",");

    return `LINESTRING(${coords})`;
  }

  /**Returns the first point that the generator represents,
   * according to the type. This will be useful to represent
   * certain things on the map. The first point differs according to the type of the generator
   */
  public getFirstPoint(){
    if (this.type == PositionGeneratorType.Fixed || this.type == PositionGeneratorType.SpeedBearing)
      return this.position;
    else if (this.type == PositionGeneratorType.LineString)
      return this.route[0];
  }

  public hasRoute(){
    return this.type == PositionGeneratorType.LineString && this.route.length > 0;
  }
}