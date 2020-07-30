
import { Component, OnInit, Input, EventEmitter, Output, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NavigationStatus, ShipType, NavaidType, TargetType, TrackType, PositionGeneratorType, ScenarioInteractionMode } from 'src/app/core/Enums';
import { Point } from "src/app/core/Point";
import { PositionGenerator } from "src/app/core/PositionGenerator";
import { Target } from "src/app/core/Target";
import { Subject } from 'rxjs';
import { ScenarioFacade } from '../abstraction/ScenarioFacade';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-position-generator',
  templateUrl: './position-generator.component.html',
  styleUrls: ['./position-generator.component.scss'],
})
export class PositionGeneratorComponent implements OnInit, OnDestroy {
  private _generator = <PositionGenerator>{};
  @Input() set generator(val: PositionGenerator) {
    this._generator = val;
    if (val.eta != null) {
      const tmp = new Date(val.eta.getTime() + val.eta.getTimezoneOffset() * 60 * 1000);
      this.etaTime = tmp.getHours().toString().padStart(2, "0") + ":" + tmp.getMinutes().toString().padStart(2, "0");
      this.etaDate = tmp;
    }
    this.duration = val.durationMillisseconds / val.durationMultiplier;
    this.interval = val.intervalMillisseconds / val.intervalMultiplier;
  }

  get generator(): PositionGenerator {
    return this._generator;
  }

  @Input() target: Target;
  //When the position generator is the starting point we want to show the target position and rotation according to it,
  //so this flag says if this item is the first one. This is probably a little bit the responsibility of the map, but i'll leave it 
  //like this for now.
  @Output() deleting = new EventEmitter<PositionGenerator>();
  @Output() duplicating = new EventEmitter<PositionGenerator>();
  navigationStatuses = NavigationStatus;
  shipTypes = ShipType;
  aidTypes = NavaidType;
  targetTypes = TargetType;
  trackTypes = TrackType;
  positionGeneratorTypes = PositionGeneratorType;
  etaDate: Date;
  etaTime: String;
  routeLineString: String;
  hasRoute = false;
  editingRoute = false;
  public interval: number;
  public duration: number;
  @Input() collapsed: boolean = true;
  //True when the position generator is expecting the user to provide a position (eg: click the map)
  allowDrawPosition: boolean = false;
  private _destroy$ = new Subject<number>();
  constructor(public scenarioFacade: ScenarioFacade) {
  }

  ngOnInit(): void {
    this.scenarioFacade.getGeneratorRouteChanged$()
      .pipe(takeUntil(this._destroy$))
      .subscribe(x => this.onGeneratorRouteChanged(x.route));
    this.scenarioFacade.getModeChanged$()
      .pipe(takeUntil(this._destroy$))
      .subscribe((x) => this.onModeChanged(x));
  }

  guiIntervalChanged(value:number) {
    this.generator.intervalMultiplier = Number(value); //It seems to be a string nevertheless
    this.generator.intervalMillisseconds = (this.interval * this.generator.intervalMultiplier);
  }

  guiDurationChanged(value: number) {
    this.generator.durationMultiplier = Number(value); //It seems to be a string nevertheless
    this.generator.durationMillisseconds = (this.duration * this.generator.durationMultiplier);
  }

  guiToggleCollapsed() {
    this.collapsed = !this.collapsed;
  }

  guiETADateChanged(form: any) {
    this.generator.eta = new Date(form.value);
    this.addETATime();
  }

  guiETATimeChanged() {
    if (this.generator.eta == null)
      return;
    this.generator.eta = new Date(Date.UTC(this.etaDate.getFullYear(), this.etaDate.getMonth(), this.etaDate.getDate()));
    this.addETATime();
  }

  guiPrintClicked() {
    console.log(this.generator);
  }

  guiButtonDrawPointClicked() {
    this.scenarioFacade.enterAddPointMode(this.generator.id);
  }

  guiButtonDrawRouteClicked() {
    this.scenarioFacade.enterAddRouteMode(this.generator.id);
  }

  guiButtonEditRouteClicked() {
    this.scenarioFacade.enterEditRouteMode(this.generator.id);
  }

  guiButtonConfirmRouteClicked(){
    this.scenarioFacade.enterDefaultMode();
  }

  guiDuplicate() {
    this.duplicating.next(this.generator);
  }

  guiCogChanged() {
    this.scenarioFacade.setGeneratorCog(this.generator.id, this.generator.courseOverGroundDegrees);
  }

  guiLongitudeChanged(lon: number) {
    this.scenarioFacade.setGeneratorPosition(this.generator.id, new Point(this.generator.position.lat, lon));
  }

  guiLatitudeChanged(lat: number) {
    this.scenarioFacade.setGeneratorPosition(this.generator.id, new Point(lat, this.generator.position.lon));
  }

  guiDelete() {
    this.deleting.next(this.generator);
  }

  guiConvertToLineString() {
    this.scenarioFacade.setGeneratorType(this.generator.id, PositionGeneratorType.LineString);
  }

  guiConvertToSpeedBearing() {
    this.scenarioFacade.setGeneratorType(this.generator.id, PositionGeneratorType.SpeedBearing);
  }

  guiConvertToFixed() {
    this.scenarioFacade.setGeneratorType(this.generator.id, PositionGeneratorType.Fixed);
  }

  private onGeneratorRouteChanged(route: Point[]): void {
    this.routeLineString = this.routeAsLineString();
    this.hasRoute = this.routeLineString != null;
  }

  private onModeChanged(x: { mode: ScenarioInteractionMode; idGenerator: string; }): void {
    this.allowDrawPosition = x.mode == ScenarioInteractionMode.Default;
    this.editingRoute = x.idGenerator == this.generator.id && x.mode == ScenarioInteractionMode.EditRoute;
  }

  private addETATime() {
    let hour = parseInt(this.etaTime == null || this.etaTime.length == 0 ? '0' : this.etaTime.slice(0, 2));
    let minutes = parseInt(this.etaTime == null || this.etaTime.length == 0 ? '0' : this.etaTime.slice(3, 5));
    this.generator.eta.setTime(this.generator.eta.getTime() + (hour * 60 * 60 * 1000) + (minutes * 60 * 1000));
  }

  private routeAsLineString() {
    if (this.generator?.type == PositionGeneratorType.LineString)
      return this.generator.routeAsLineString();
    else
      return null;
  }

  ngOnDestroy() {
    this._destroy$.next(0);
    this._destroy$.complete();
  }
}


