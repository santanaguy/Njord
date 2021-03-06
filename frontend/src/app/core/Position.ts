import { NavigationStatus, ShipType, NavaidType, TargetType, TrackType, PositionGeneratorType } from './Enums';
import { Point } from "./Point";
export class Position {
  idTarget: string;
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
  simulated: Boolean;
  date: Date;
}