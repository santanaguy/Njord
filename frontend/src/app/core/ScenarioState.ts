import { Subject, BehaviorSubject } from 'rxjs';
import { PositionGeneratorType, ScenarioInteractionMode } from './Enums';
import { Point } from "./Point";
import { PositionGenerator } from "./PositionGenerator";
import { Target } from "./Target";
import { filter, tap } from 'rxjs/operators';
import { ReplayController } from './ReplayController';
import { Position } from './Position';
import { Injectable } from '@angular/core';

/*
This class is where all the logic from the application is decided regarding what should happen.
Here is where we have the events dispatched too. It is the core of the website.
The actions follow a logic of 'canX' and 'X'. The 'canX' method is always checked before doing anything
This also lends itself well to binding on Angular because the buttons will be disabled 
automatically when the 'canX' method returns false, for example. 

This state also interacts with the ReplayController and serves as a relay for the functionality, exposing it. 
*/
@Injectable()
export class ScenarioState {
    private targetAdded$: Subject<{ id: string; point: Point; }>;
    private currentTarget$: BehaviorSubject<string>;
    private targetPosition$: BehaviorSubject<{ idTarget: string, position: Point }>;
    private targetCog$: BehaviorSubject<{ idTarget: string, cog: number; }>;
    private targets$: BehaviorSubject<Target[]>;
    private targetDeleted$: Subject<{ id: string }>;
    private generatorDeleted$: Subject<{ idGenerator: string, idTarget: string }>;
    private generatorAdded$: Subject<{ idTarget: string, generator: PositionGenerator }>;
    private modeChanged$: BehaviorSubject<{ mode: ScenarioInteractionMode, idGenerator: string }>;
    private generatorPositionChanged$: Subject<{ idTarget: string, idGenerator: string, position: Point, isFirst: boolean }>;
    private generatorRouteChanged$: Subject<{ idGenerator: string, idTarget: string, route: Point[] }>;
    private generatorTypeChanged$: Subject<{ idTarget: string, oldType: PositionGeneratorType, generator: PositionGenerator }> = new Subject<{ idTarget: string, oldType: PositionGeneratorType, generator: PositionGenerator }>();
    private _targets: Target[] = [];
    private _lastTargetId: number = 0;

    constructor(private replayController: ReplayController) {
        this.targetAdded$ = new Subject<{ id: string; point: Point; }>();
        this.currentTarget$ = new BehaviorSubject(null);
        this.targets$ = new BehaviorSubject([]);
        this.targetDeleted$ = new Subject<{ id: string }>();
        this.generatorDeleted$ = new Subject<{ idGenerator: string, idTarget: string }>();
        this.generatorAdded$ = new Subject<{ idTarget: string, generator: PositionGenerator }>();
        this.targetPosition$ = new BehaviorSubject<{ idTarget: string, position: Point }>(null);
        this.targetCog$ = new BehaviorSubject<{ idTarget: string, cog: number }>(null);
        this.modeChanged$ = new BehaviorSubject<{ mode: ScenarioInteractionMode, idGenerator: string }>({ mode: ScenarioInteractionMode.Default, idGenerator: null });
        this.generatorPositionChanged$ = new Subject<{ idTarget: string, idGenerator: string, position: Point, isFirst: boolean }>();
        this.generatorRouteChanged$ = new Subject<{ idGenerator: string, idTarget: string, route: Point[] }>();

    }

    get canSetGeneratorType() {
        return this.modeChanged$.value.mode == ScenarioInteractionMode.Default;
    }

    /**Changes the generator type to a new type. Will emit events accordingly */
    public setGeneratorType(idGenerator: string, newType: PositionGeneratorType) {
        if (!this.canSetGeneratorType)
            return;
        let { target, generator } = this.findGenerator(idGenerator);

        if (generator.type == newType)
            return;
        const oldType = generator.type;
        generator.type = newType;
        this.generatorTypeChanged$.next({ idTarget: target.id, oldType, generator });

        //If it is the first then the target will change too
        if (generator == target.positionGenerators[0]) {
            let targetPosition = generator.position ?? target.position;
            if (newType == PositionGeneratorType.LineString && generator.route.length > 0)
                targetPosition = generator.route[0];
            this.setTargetPosition(target, targetPosition);
        }
    }

    get canChangeCurrentTarget() {
        return this.modeChanged$.value.mode == ScenarioInteractionMode.Default;
    }

    /**
     * Define the current target that the user is editing.
     * @param id of the current target
     */
    public setCurrentTarget(id: string) {
        if (!this.canChangeCurrentTarget)
            return;
        let target = this._targets.find(x => x.id == id);
        this.currentTarget$.next(target?.id);
        this.enterDefaultMode();
    }

    get canSetGeneratorPosition() {
        return this.modeChanged$.value.mode == ScenarioInteractionMode.AddPoint
            || this.modeChanged$.value.mode == ScenarioInteractionMode.Default;
    }

    /**
     * Sets the position generator position.
     * @param idGenerator is the id of the generator
     * @param position is the new position to be set
     */
    public setGeneratorPosition(idGenerator: string, position: Point) {
        if (!this.canSetGeneratorPosition)
            return;
        let { target, generator } = this.findGenerator(idGenerator);
        generator.position = position;
        const isFirst = target.positionGenerators[0] == generator;
        if (isFirst) {
            this.setTargetPosition(target, position);
        }

        this.generatorPositionChanged$.next({ idTarget: target.id, idGenerator: idGenerator, position: position, isFirst: isFirst });
    }

    get canSetGeneratorRoute() {
        return this.modeChanged$.value.mode != ScenarioInteractionMode.AddPoint
            && this.modeChanged$.value.mode != ScenarioInteractionMode.Replay;
    }

    /**
     * This will update the route of a given generator
     * @param idGenerator the id of the generator
     * @param coords the coordinates array corresponding to the route
     * @param enterDefaultMode defines if, after setting the route the mode should be set to Default. This
     * will be useful when we want to continue editing 
     */
    public setGeneratorRoute(idGenerator: string, coords: Point[], enterDefaultMode: boolean) {
        if (!this.canSetGeneratorRoute)
            return;
        let { target, generator } = this.findGenerator(idGenerator);

        generator.route = coords;
        this.generatorRouteChanged$.next({ idGenerator, idTarget: target.id, route: coords });
        const isFirst = target.positionGenerators[0] == generator;
        if (isFirst) {
            this.setTargetPosition(target, coords[0]);
        }

        if (enterDefaultMode)
            this.enterDefaultMode();
    }

    /**
     * Sets the COG of a generator
     * @param idGenerator the id of the generator
     * @param cog the new COG
     */
    public setGeneratorCog(idGenerator: string, cog: number) {
        let { target, generator } = this.findGenerator(idGenerator);
        generator.courseOverGroundDegrees = cog;
        if (target.positionGenerators[0] == generator) {
            this.setTargetCog(target, cog);
        }
    }

    private setTargetPosition(target: Target, position: Point) {
        target.position = position;
        this.targetPosition$.next({ idTarget: target.id, position: target.position });
    }

    private setTargetCog(target: Target, cog: number) {
        target.cog = cog;
        this.targetCog$.next({ idTarget: target.id, cog: target.cog });
    }

    get canDeleteTarget() {
        return this.modeChanged$.value.mode == ScenarioInteractionMode.Default
            && this.currentTarget$.value != null;
    }

    /**
     * This method will delete a target and emit the corresponding event
     * @param idTarget the target to be deleted
     */
    public deleteTarget(idTarget: string) {
        if (!this.canDeleteTarget)
            return;
        var idxTarget = this._targets.findIndex(x => x.id == idTarget);
        if (idxTarget == -1)
            return;
        this._targets.splice(idxTarget, 1);
        this.targets$.next(this._targets);
        this.targetDeleted$.next({ id: idTarget });
        if (this.currentTarget$.value == idTarget) {
            this.currentTarget$.next(null);
            this.enterDefaultMode();
        }
    }

    get canAddTarget() {
        return this.modeChanged$.value.mode == ScenarioInteractionMode.Default;
    }

    /**
     * Adds a target in the given lat/lon
     * @param lat 
     * @param lon 
     */
    public addTarget(lat: number, lon: number) {
        if (!this.canAddTarget)
            return;
        var target = new Target((this._lastTargetId++).toString(), new Point(lat, lon));
        this._targets.push(target);
        this.targets$.next(this._targets);
        this.targetAdded$.next({ id: target.id, point: target.positionGenerators[0].position });
        this.generatorAdded$.next({ idTarget: target.id, generator: target.positionGenerators[0] });
        this.setCurrentTarget(target.id);
    }

    get canDeleteGenerator() {
        return this.modeChanged$.value.mode == ScenarioInteractionMode.Default;
    }

    public deleteGenerator(idGenerator: string) {
        if (!this.canDeleteGenerator)
            return;
        let { target } = this.findGenerator(idGenerator);
        this.enterDefaultMode();
        target.deleteGenerator(idGenerator);
        this.generatorDeleted$.next({ idGenerator: idGenerator, idTarget: target.id });
        let firstGen = target.positionGenerators[0];
        if (firstGen != null) {
            this.setTargetPosition(target, firstGen.getFirstPoint());
            this.setTargetCog(target, firstGen.courseOverGroundDegrees);
        }
    }

    get canDuplicateGenerator() {
        return this.modeChanged$.value.mode == ScenarioInteractionMode.Default;
    }

    public duplicateGenerator(idGenerator: string) {
        if (!this.canDuplicateGenerator)
            return;
        let { target } = this.findGenerator(idGenerator);
        let generatorClone = target.duplicateGenerator(idGenerator);
        this.generatorAdded$.next({ idTarget: target.id, generator: generatorClone });

        if (generatorClone.type == PositionGeneratorType.Fixed || generatorClone.type == PositionGeneratorType.SpeedBearing)
            this.generatorPositionChanged$.next({ idTarget: target.id, idGenerator: generatorClone.id, position: generatorClone.position, isFirst: false });
        else if (generatorClone.type == PositionGeneratorType.LineString)
            this.generatorRouteChanged$.next({ idGenerator: generatorClone.id, idTarget: target.id, route: generatorClone.route });
    }

    get canAddPositionGenerator() {
        return this.modeChanged$.value.mode == ScenarioInteractionMode.Default;
    }

    public addPositionGenerator(idTarget: string) {
        if (!this.canAddPositionGenerator)
            return;
        //If this is not the first generator, copy the static information from the previous one. This means the
        //user needs only to perform the changes instead of configuring it all again
        var target = this._targets.find(x => x.id == idTarget);
        var generator = target.addPositionGenerator();
        if (target.positionGenerators[0] == generator) {
            this.setTargetPosition(target, generator.position);
            this.setTargetCog(target, generator.courseOverGroundDegrees);
        }
        this.generatorAdded$.next({ idTarget: idTarget, generator: generator });
    }

    public enterAddPointMode(idGenerator: string) {
        if (this.modeChanged$.value.mode != ScenarioInteractionMode.AddPoint)
            this.modeChanged$.next({ mode: ScenarioInteractionMode.AddPoint, idGenerator });
    }

    public enterEditRouteMode(idGenerator: string) {
        if (this.modeChanged$.value.mode != ScenarioInteractionMode.EditRoute)
            this.modeChanged$.next({ mode: ScenarioInteractionMode.EditRoute, idGenerator });
    }

    public enterAddRouteMode(idGenerator: string) {
        if (this.modeChanged$.value.mode != ScenarioInteractionMode.AddRoute)
            this.modeChanged$.next({ mode: ScenarioInteractionMode.AddRoute, idGenerator })
    }

    public enterDefaultMode() {
        if (this.modeChanged$.value.mode == ScenarioInteractionMode.Replay) {
            this.replayController.stop();
        }

        if (this.modeChanged$.value.mode != ScenarioInteractionMode.Default)
            this.modeChanged$.next({ mode: ScenarioInteractionMode.Default, idGenerator: null });
    }

    public canEnterReplayMode() {
        return this.modeChanged$.value.mode == ScenarioInteractionMode.Default;
    }

    public enterReplayMode() {
        if (this.modeChanged$.value.mode != ScenarioInteractionMode.Replay) {
            this.modeChanged$.next({ mode: ScenarioInteractionMode.Replay, idGenerator: null });
            let positions: Position[] = [];

            for (const target of this._targets) {
                let offset = new Date(0);
                for (const generator of target.positionGenerators) {
                    const res = this.generatePositions(offset, target.id, generator);
                    offset = res.offset
                    positions = positions.concat(res.positions);
                }
            }

            this.replayController.setPositions(positions);
        }
    }

    /**
     * This method will generate and return the positions that would be created according
     * to the PositionGenerator properties. This is used mainly for the replay feature.
     * @param offset the offset by which the positions will be created.
     * @param idTarget the id of the target to create the positions for
     * @param generator the generator that will create the positions
     */
    private generatePositions(offset: Date, idTarget: string, generator: PositionGenerator) {
        let positions: Position[] = [];
        var offsetMs = 0;
        var offsetGenerator = 0;
        if (offset.getTime() != new Date(0).getTime()) {
            // The first position will be emitted at the first interval
            offsetGenerator += generator.intervalMillisseconds;
        }

        offsetMs = offset.getTime() + offsetGenerator;
        let i = 0;

        while (offsetGenerator <= generator.durationMillisseconds) {
            let position = new Position();
            position.date = new Date(offsetMs);
            position.idTarget = idTarget;
            position.description = generator.description;
            position.mmsi = generator.mmsi;
            position.trackNumber = generator.trackNumber;
            position.sourceName = generator.sourceName;
            position.sourceId = generator.sourceId;
            position.navStatus = generator.navStatus;
            position.rateOfTurnDegreesPerSecond = generator.rateOfTurnDegreesPerSecond;
            position.speedOverGroundKnots = generator.speedOverGroundKnots;
            position.courseOverGroundDegrees = generator.courseOverGroundDegrees;
            position.trueHeadingDegrees = generator.trueHeadingDegrees;
            position.destination = generator.destination;
            position.draughtMeters = generator.draughtMeters;
            position.eta = generator.eta;
            position.dimensionToStarboardMeters = generator.dimensionToStarboardMeters;
            position.dimensionToSternMeters = generator.dimensionToSternMeters;
            position.dimensionToBowMeters = generator.dimensionToBowMeters;
            position.dimensionToPortMeters = generator.dimensionToPortMeters;
            position.shipType = generator.shipType;
            position.offPosition = generator.offPosition;
            position.name = generator.name;
            position.callsign = generator.callsign;
            position.imo = generator.imo;
            position.aidType = generator.aidType;
            position.targetType = generator.targetType;
            position.trackType = generator.trackType;
            position.repeat = generator.repeat;
            position.route = generator.route;
            position.simulated = generator.simulated;
            if (generator.type == PositionGeneratorType.Fixed) {
                position.position = generator.position;
            }
            else if (generator.type == PositionGeneratorType.LineString) {
                if (i >= generator.route.length)
                    break;

                position.position = generator.route[i];
                if (i != generator.route.length - 1) 
                    position.courseOverGroundDegrees = this.getBearing(generator.route[i + 1].lon - generator.route[i].lon, generator.route[i].lat, generator.route[i+1].lat)
            }
            else if (generator.type == PositionGeneratorType.SpeedBearing) {
                //We need to know where will the next position be, given the direction, speed and time passed
                let distanceKm = (((generator.speedOverGroundKnots ?? 0) * 0.514444) * generator.intervalMillisseconds / 1000) / 1000;
                let prevPos = positions[positions.length - 1];
                if (prevPos != null)
                    position.position = this.nextPointOverDistance(prevPos.position, generator.trueHeadingDegrees ?? generator.courseOverGroundDegrees ?? 0, distanceKm);
                else
                    position.position = generator.position;
            }
            offsetGenerator += generator.intervalMillisseconds;
            offsetMs += generator.intervalMillisseconds;
            positions.push(position);

            i++;
        }
        offsetMs -= generator.intervalMillisseconds; //To prevent advancing time too much.


        return { positions, offset: new Date(offsetMs) };
    }


    /**
    It uses the haversine formula to give us the next point over a distance given a bearing. 
    */
    private nextPointOverDistance(latlon: Point, bearingDegrees: number, distanceKm: number): Point {
        var R = 6378.137;
        var bearingRadians = bearingDegrees * (Math.PI / 180);
        var lat1 = latlon.lat * (Math.PI / 180);
        var lon1 = latlon.lon * (Math.PI / 180);

        var lat2 = Math.asin(Math.sin(lat1) * Math.cos(distanceKm / R) +
            Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(bearingRadians));

        var lon2 = lon1 + Math.atan2(Math.sin(bearingRadians) * Math.sin(distanceKm / R) * Math.cos(lat1),
            Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2));

        lat2 = lat2 * (180 / Math.PI);
        lon2 = lon2 * (180 / Math.PI);
        return new Point(Math.round(lat2 * 100000000) / 100000000, Math.round(lon2 * 100000000) / 100000000);
    }

    private getBearing(deltaLon : number, initLat : number, finalLat : number)
    {
        let DEG_TO_RAD = 0.0174532925;
        deltaLon = deltaLon * DEG_TO_RAD;
        initLat = initLat * DEG_TO_RAD;
        finalLat = finalLat * DEG_TO_RAD;
        let bearing = Math.atan2(Math.sin(deltaLon) * Math.cos(finalLat), Math.cos(initLat) * Math.sin(finalLat) - Math.sin(initLat) * Math.cos(finalLat) * Math.cos(deltaLon));
        if (bearing < 0)
        {
            bearing += 2 * Math.PI;
        }
        return bearing / DEG_TO_RAD; //degrees
    }

    private findGenerator(idGenerator: string) {
        for (let t of this._targets) {
            for (let p of t.positionGenerators) {
                if (p.id == idGenerator)
                    return { target: t, generator: p };
            }
        }
        return null;
    }

    public getGeneratorRouteChanged$() {
        return this.generatorRouteChanged$.asObservable();
    }

    public getTargetAdded$() {
        return this.targetAdded$.asObservable();
    }

    public getGeneratorAdded$() {
        return this.generatorAdded$.asObservable();
    }

    public getGeneratorPositionChanged$() {
        return this.generatorPositionChanged$.asObservable();
    }

    public getTargetDeleted$() {
        return this.targetDeleted$.asObservable();
    }

    public getGeneratorDeleted$() {
        return this.generatorDeleted$.asObservable();
    }

    public getTargets$() {
        return this.targets$.asObservable();
    }

    public getCurrentTarget$() {
        return this.currentTarget$.asObservable();
    }

    public getTargetPositionChanged$() {
        return this.targetPosition$.asObservable()
            .pipe(
                filter(x => x?.position?.lat != null && x?.position?.lon != null));
    }

    public getTarget(id: string) {
        let target = this._targets.find(x => x.id == id);
        return target;
    }

    public getTargetCogChanged$() {
        return this.targetCog$.asObservable();
    }

    public getModeChanged$() {
        return this.modeChanged$.asObservable();
    }

    public getgeneratorTypeChanged$() {
        return this.generatorTypeChanged$.asObservable();
    }

    /**
    * toggles between playing or pausing
    */
    public playPause() {
        this.replayController.playPause();
    }

    /**
     * stop the replaying. 
     */
    public stop() {
        this.replayController.stop();
    }

    /**This will refresh the positions in memory.  */
    public filterByDate(start: Date, end: Date) {
        this.stop();

    }

    public getTick$() {
        return this.replayController.getTick$();
    }

    /**
     * Sets the replay at a given time.
     * For example, this will be called when the user drags the replay slider
     * @param millisecondsUnix 
     */
    public setTime(millisecondsUnix: number) {
        this.replayController.stop();
        this.replayController.setTime(millisecondsUnix);
    }

    public getReplayStateChanged$() {
        return this.replayController.getReplayStateChanged$();
    }

    public getReplayRangeChanged$() {
        return this.replayController.getRangeChanged$();
    }
}
