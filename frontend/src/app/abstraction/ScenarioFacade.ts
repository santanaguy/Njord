import { Injectable } from "@angular/core";
import { Target } from "../core/Target";
import { ScenarioState } from "../core/ScenarioState";
import { Point } from "../core/Point";
import { PositionGeneratorType } from '../core/Enums';
import { ScenarioAPI } from '../core/ScenarioAPI';
import { ReplayController } from '../core/ReplayController';

@Injectable()
export class ScenarioFacade {
    private _targets : Target[] = [];
    constructor(private scenarioState: ScenarioState, private scenarioApi: ScenarioAPI) {
        this.scenarioState.getTargets$().subscribe(x=> this._targets = x);
    }

    public saveScenario(){
        return this.scenarioApi.saveScenario(this._targets);
    }

    public getTargetAdded$() {
        return this.scenarioState.getTargetAdded$();
    }

    public getGeneratorAdded$() {
        return this.scenarioState.getGeneratorAdded$();
    }

    public getTargets$() {
        return this.scenarioState.getTargets$();
    }

    public getTargetDeleted$() {
        return this.scenarioState.getTargetDeleted$();
    }

    public addTarget(lat: number, lon: number): void {
        this.scenarioState.addTarget(lat, lon);
    }

    public setCurrentTarget(id: string) {
        this.scenarioState.setCurrentTarget(id);
    }

    public getCurrentTarget$() {
        return this.scenarioState.getCurrentTarget$();
    }

    public deleteTarget(id: string) {
        this.scenarioState.deleteTarget(id);
    }

    public deleteGenerator(id: string) {
        this.scenarioState.deleteGenerator(id);
    }

    public getGeneratorDeleted$() {
        return this.scenarioState.getGeneratorDeleted$();
    }

    public getTarget(id: string) {
        return this.scenarioState.getTarget(id);
    }

    public addGenerator(idTarget: string) {
        this.scenarioState.addPositionGenerator(idTarget);
    }

    public duplicateGenerator(idGenerator: string) {
        this.scenarioState.duplicateGenerator(idGenerator);
    }

    public setGeneratorCog(idGenerator: string, cog: number) {
        return this.scenarioState.setGeneratorCog(idGenerator, cog);
    }

    public enterDefaultMode() {
        this.scenarioState.enterDefaultMode();
    }

    public canEnterReplayMode(){
        return this.scenarioState.canEnterReplayMode();
    }

    public enterReplayMode(){
        this.scenarioState.enterReplayMode();
    }

    public setGeneratorPosition(idGenerator: string, position: Point) {
        this.scenarioState.setGeneratorPosition(idGenerator, position);
    }

    public setGeneratorType(idGenerator: string, type: PositionGeneratorType) {
        this.scenarioState.setGeneratorType(idGenerator, type);
    }

    public setGeneratorRoute(idGenerator: string, coords: Point[], enterDefaultMode: boolean = true) {
        this.scenarioState.setGeneratorRoute(idGenerator, coords, enterDefaultMode);
    }

    public getGeneratorTypeChanged$() {
        return this.scenarioState.getgeneratorTypeChanged$();
    }

    public getGeneratorRouteChanged$() {
        return this.scenarioState.getGeneratorRouteChanged$();
    }

    public getTargetPositionChanged$() {
        return this.scenarioState.getTargetPositionChanged$();
    }

    public getTargetCogChanged$() {
        return this.scenarioState.getTargetCogChanged$();
    }

    public enterAddPointMode(idGenerator: string) {
        this.scenarioState.enterAddPointMode(idGenerator);
    }

    public enterAddRouteMode(idGenerator: string) {
        this.scenarioState.enterAddRouteMode(idGenerator);
    }

    public enterEditRouteMode(idGenerator: string) {
        this.scenarioState.enterEditRouteMode(idGenerator);
    }

    public getModeChanged$() {
        return this.scenarioState.getModeChanged$();
    }

    public getGeneratorPositionChanged$() {
        return this.scenarioState.getGeneratorPositionChanged$();
    }

    get canSetGeneratorType() {
        return this.scenarioState.canSetGeneratorType;
    }
    get canChangeCurrentTarget() {
        return this.scenarioState.canChangeCurrentTarget;
    }
    get canSetGeneratorRoute() {
        return this.scenarioState.canSetGeneratorRoute;
    }
    get canDeleteTarget() {
        return this.scenarioState.canDeleteTarget;
    }
    get canAddTarget() {
        return this.scenarioState.canAddTarget;
    }
    get canDeleteGenerator() {
        return this.scenarioState.canDeleteGenerator;
    }
    get canDuplicateGenerator() {
        return this.scenarioState.canDuplicateGenerator;
    }
    get canAddPositionGenerator() {
        return this.scenarioState.canAddPositionGenerator;
    }
    get canSetGeneratorPosition() {
        return this.scenarioState.canSetGeneratorPosition;
    }

    /**
     * toggles between playing or pausing
     */
    public replayPlayPause() {
        this.scenarioState.playPause();
    }

    /**
     * stop the replaying. 
     */
    public replayStop() {
        this.scenarioState.stop();
    }
    
    public getReplayTick$() {
        return this.scenarioState.getTick$();
    }

    /**
     * Sets the replay at a given time.
     * For example, this will be called when the user drags the replay slider
     * @param millisecondsUnix 
     */
    public replaySetTime(millisecondsUnix: number) {
        this.scenarioState.stop();
        return this.scenarioState.setTime(millisecondsUnix);
    }
    
    public getReplayStateChanged$() {
        return this.scenarioState.getReplayStateChanged$();
    }

    public getReplayRangeChanged$(){
        return this.scenarioState.getReplayRangeChanged$();
    }

}