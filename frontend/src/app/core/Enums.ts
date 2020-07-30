export enum ScenarioInteractionMode {
  Default = 0,
  AddPoint = 1,
  AddRoute = 2,
  EditRoute = 3,
  Replay = 4
}

export enum PositionGeneratorType {
  Fixed = 0,
  LineString = 1,
  SpeedBearing = 2
}

export enum TrackType {
  AIS = 0,
  Radar = 1,
  Fusion = 2
}

export enum TargetType {
  ClassA = 0,
  ClassB = 1,
  Aton = 2,
  BaseStation = 3,
  SAR = 4,
  Uncategorized = 5,
}

export enum NavigationStatus {
  UnderwayUsingEngine = 0,
  AtAnchor = 1,
  NotUnderCommand = 2,
  RestrictedManeuver = 3,
  ConstrainedByDraught = 4,
  Moored = 5,
  Aground = 6,
  EngagedInFishing = 7,
  UnderwaySailing = 8,
  ReservedForFutureAmmendmentHSC = 9,
  ReservedForFutureAmmendmentWIG = 10,
  Reserved1 = 11,
  Reserved2 = 12,
  Reserved3 = 13,
  AISSART = 14,
  NotDefined = 15
}

export enum ShipType {
  NotAvailable = 0,
  WIGAllShips = 20,
  WIGHazardousCatA = 21,
  WIGHazardousCatB = 22,
  WIGHazardousCatC = 23,
  WIGHazardousCatD = 24,
  Fishing = 30,
  Towing = 31,
  TowingBig = 32,
  Dredging = 33,
  Diving = 34,
  Military = 35,
  Sailing = 36,
  PleasureCraft = 37,
  Reserved1 = 38,
  Reserved2 = 39,
  HighSpeedAllShips = 40,
  HighSpeedHazardousCatA = 41,
  HighSpeedHazardousCatB = 42,
  HighSpeedHazardousCatC = 43,
  HighSpeedHazardousCatD = 44,
  HighSpeedNoInfo = 49,
  PilotVessel = 50,
  SearchAndRescue = 51,
  Tug = 52,
  PortTender = 53,
  AntiPollution = 54,
  LawEnforcement = 55,
  SpareLocalVessel1 = 56,
  SpareLocalVessel2 = 57,
  MedicalTransport = 58,
  NoncombatantShip = 59,
  PassengerAllShips = 60,
  PassengerHazardousCatA = 61,
  PassengerHazardousCatB = 62,
  PassengerHazardousCatC = 63,
  PassengerHazardousCatD = 64,
  PassengerNoInfo = 69,
  CargoAllShips = 70,
  CargoHazardousCategoryA = 71,
  CargoHazardousCategoryB = 72,
  CargoHazardousCategoryC = 73,
  CargoHazardousCategoryD = 74,
  CargoNoInfo = 79,
  TankerAllShips = 80,
  TankerHazardousCatA = 81,
  TankerHazardousCatB = 82,
  TankerHazardousCatC = 83,
  TankerHazardousCatD = 84,
  TankerNoInfo = 89,
  OtherAllShipsType = 90,
  OtherHazardousCatA = 91,
  OtherHazardousCatB = 92,
  OtherHazardousCatC = 93,
  OtherHazardousCatD = 94,
  OtherNoInfo = 99
}

export enum NavaidType {
  Default = 0,
  ReferencePoint = 1,
  RACON = 2,
  FixedStructureOffShore = 3,
  Spare = 4,
  LightWithoutSectors = 5,
  LightWithSectors = 6,
  LeadingLightFront = 7,
  LeadingLightRear = 8,
  BeaconCardinalN = 9,
  BeaconCardinalE = 10,
  BeaconCardinalS = 11,
  BeaconCardinalW = 12,
  BeaconPortHand = 13,
  BeaconStarboardHand = 14,
  BeaconPreferredChannelPortHand = 15,
  BeaconPreferredChannelStarboardHand = 16,
  BeaconIsolatedDanger = 17,
  BeaconSafeWater = 18,
  BeaconSpecialMark = 19,
  CardinalMarkN = 20,
  CardinalMarkE = 21,
  CardinalMarkS = 22,
  CardinalMarkW = 23,
  PortHandMark = 24,
  StarboardHandMark = 25,
  PreferredChannelPortHand = 26,
  PreferredChannelStarboardHand = 27,
  IsolatedDanger = 28,
  SafeWater = 29,
  SpecialMark = 30,
  LightVesselOrLANBYOrRigs = 31
}

export enum ReplayState { Playing = 0, Stopped = 1, Paused = 2 };
