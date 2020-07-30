import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Target } from './Target';
import { environment } from 'src/environments/environment';
import { Result } from './Result';

@Injectable()
export class ScenarioAPI {
    constructor(private httpClient: HttpClient) {

    }

    public saveScenario(targets: Target[]) {
        const param = targets.map(x => ({
            positionGenerators: x.positionGenerators.map(pg => ({
                MMSI: pg.mmsi,
                TrackNumber: pg.trackNumber,
                SourceName: pg.sourceName,
                SourceId: pg.sourceId,
                NavStatus: pg.navStatus,
                RateOfTurnDegreesPerSecond: pg.rateOfTurnDegreesPerSecond,
                SpeedOverGroundKnots: pg.speedOverGroundKnots,
                CourseOverGroundDegrees: pg.courseOverGroundDegrees,
                TrueHeadingDegrees: pg.trueHeadingDegrees,
                Destination: pg.destination,
                DraughtMeters: pg.draughtMeters,
                ETA: pg.eta?.toISOString(),
                DimensionToStarboardMeters: pg.dimensionToStarboardMeters,
                DimensionToSternMeters: pg.dimensionToSternMeters,
                DimensionToBowMeters: pg.dimensionToBowMeters,
                DimensionToPortMeters: pg.dimensionToPortMeters,
                ShipType: pg.shipType,
                OffPosition: pg.offPosition,
                Name: pg.name,
                Callsign: pg.callsign,
                Imo: pg.imo,
                AidType: pg.aidType,
                TargetType: pg.targetType,
                TrackType: pg.trackType,
                Position: `Point(${pg.position.lat} ${pg.position.lon})`,
                Repeat: pg.repeat,
                LineString: pg.routeAsLineString(),
                IntervalMilliseconds: pg.intervalMillisseconds,
                DurationMilliseconds: pg.durationMillisseconds,
                Type: pg.type,
                Simulated: pg.simulated
            }))
        }));
        return this.httpClient.post<Result<string>[]>(environment.backendUrl + "/scenario", param);
    }
}