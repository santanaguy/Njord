import * as L from 'leaflet';
import 'node_modules/leaflet-rotatedmarker/leaflet.rotatedMarker.js';
import 'node_modules/@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.min.js';
import { Component, OnInit, Output, EventEmitter, NgZone, Injector, Input } from '@angular/core';
import { tileLayer, latLng, LeafletMouseEvent, featureGroup, DrawEvents, GeomanIO } from 'leaflet';
import { NgElement, WithProperties, createCustomElement } from '@angular/elements';
import { TargetContextMenuComponent } from '../target-context-menu/target-context-menu.component';
import { ScenarioInteractionMode, PositionGeneratorType } from '../core/Enums';
import { Point } from "../core/Point";
import { Target } from "../core/Target";
import { ScenarioState } from "../core/ScenarioState";
import { ScenarioFacade } from '../abstraction/ScenarioFacade';
import { posix } from 'path';
import { filter, take } from 'rxjs/operators';
import { isDataSource } from '@angular/cdk/collections';
import { PositionGenerator } from '../core/PositionGenerator';
import { Route } from '@angular/compiler/src/core';
import { ReplayTickArgs } from '../core/ReplayTickArgs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styles: [],
})
export class MapComponent implements OnInit {

  state = new MapState();
  @Input() model: ScenarioState;
  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
      this.state.targetsLayer,
      this.state.routeMarkersLayer,
      this.state.hintsLayer
    ],
    zoom: 12,
    center: latLng(37.92036, -8.98269)
  };

  map: L.Map;
  targetIcon = new L.Icon({ iconUrl: "assets/target.svg", iconAnchor: [12, 29] });
  circleIcon = new L.Icon({ iconUrl: "assets/circle2.svg", iconAnchor: [10, 11] });
  selectedIcon = new L.Icon({ iconUrl: "assets/targetSelected.svg", iconAnchor: [12, 29] });
  dotIcon = new L.Icon({ iconUrl: "assets/edit-tools-small.svg", iconAnchor: [4, 4] });
  colors = ["#E52B50", "#000000", "#0000FF", "#FF4500", "#8A2BE2", "#00A86B", "#FF00FF", "#000080", "#483C32", "#FFFFFF", "#FF0000"]
  constructor(private zone: NgZone, injector: Injector, private scenarioFacade: ScenarioFacade) {
    /**Create custom HTML elements to inject into a leaflet popup */
    const PopupElement = createCustomElement(TargetContextMenuComponent, { injector });
    customElements.define('target-context-menu', PopupElement);

    scenarioFacade.getModeChanged$().subscribe(x => this.onModeChanged(x));
    scenarioFacade.getTargetAdded$().subscribe(x => this.onTargetAdded(x.id, x.point));
    scenarioFacade.getCurrentTarget$().subscribe(id => this.onCurrentTargetChanged(id));
    scenarioFacade.getTargetDeleted$().subscribe(x => this.onTargetDeleted(x.id));
    scenarioFacade.getGeneratorDeleted$().subscribe(x => this.onGeneratorDeleted(x));
    scenarioFacade.getGeneratorAdded$().subscribe(x => this.onGeneratorAdded(x));
    scenarioFacade.getGeneratorTypeChanged$().subscribe(x => this.onGeneratorTypeChanged(x));
    scenarioFacade.getTargetCogChanged$().subscribe(x => this.onTargetCogChanged(x));
    scenarioFacade.getGeneratorPositionChanged$()
      .subscribe(x => this.onGeneratorPositionUpdated(x));
    scenarioFacade.getTargetPositionChanged$().subscribe(x => this.onTargetPositionChanged(x));
    scenarioFacade.getGeneratorRouteChanged$().subscribe(x => this.onGeneratorRouteChanged(x));
    scenarioFacade.getReplayTick$().pipe(filter(x=> x.positions.length > 0)).subscribe(x => this.updateReplayTargets(x));
  }

  ngOnInit(): void {
  }

  guiMapReady(map: L.Map) {
    this.map = map;
    this.map.doubleClickZoom.disable();

    map.on('pm:create', (e: GeomanIO.DrawEnd) => {
      this.zone.run(() => {
        this.guiPolylineDrawFinished(e, true);
        map.removeLayer(e.layer);
      });
    });
  }

  guiDoubleClick(evt: LeafletMouseEvent) {
    this.zone.run(() => {
      if (this.state.mode == ScenarioInteractionMode.Default)
        this.scenarioFacade.addTarget(evt.latlng.lat, evt.latlng.lng);
    });
  }

  guiClick(evt: LeafletMouseEvent) {
    if (this.state.mode == ScenarioInteractionMode.AddPoint) {
      this.scenarioFacade.setGeneratorPosition(this.state.idGenerator, new Point(evt.latlng.lat, evt.latlng.lng));
      this.scenarioFacade.enterDefaultMode();
    }
  }

  guiPolylineDrawFinished(e: GeomanIO.DrawEnd, shouldEnterDefaultMode: boolean) {
    let coords = (e.layer as L.Polyline).getLatLngs() as L.LatLng[];
    this.scenarioFacade.setGeneratorRoute(this.state.idGenerator, coords.map(x => new Point(x.lat, x.lng)), shouldEnterDefaultMode);
  }

  guiEditRouteOkClicked() {
    this.scenarioFacade.enterDefaultMode();
  }

  /**
  * Toggles the map dragging feature given a boolean. 
  * (Needed because interactions (drags) with the target widget propagate to the map)
  * Used in the template file.
  * @param enable boolean indicating whether the map dragging should be enabled or not
  */
  guiToggleMapDragging(enable: boolean) {
    if (enable) {
      this.map.dragging.enable();
      this.map.doubleClickZoom.enable();
    } else {
      this.map.dragging.disable();
      this.map.doubleClickZoom.disable();
    }
  }

  guiReplayWidgetVisible() {
    return this.state.mode == ScenarioInteractionMode.Replay;
  }


  private onGeneratorAdded(info: { idTarget: string; generator: PositionGenerator; }): void {
    const target = this.state.targets.find(x => x.id == info.idTarget);
    const marker: L.Layer = this.getMarker(info.generator, target.color);
    this.state.routeMarkersLayer.addLayer(marker);

    let routeMarkerInfo = <RouteMarkerInfo>{
      idGenerator: info.generator.id,
      idTarget: info.idTarget,
      markersLayer: marker,
      polylineLayer: null,
      route: info.generator.route,
      color: target.color,
      type: info.generator.type
    }

    if (info.generator.type == PositionGeneratorType.LineString) {
      this.createPolylineLayer(routeMarkerInfo, info.generator.route, target.color);
      routeMarkerInfo.route = info.generator.route;
    }
    this.state.routeMarkers.push(routeMarkerInfo);

    //update the hints
    this.updateHints(info.idTarget);
  }

  private onGeneratorTypeChanged(info: { idTarget: string; oldType: PositionGeneratorType; generator: PositionGenerator; }): void {
    //need to remove the old marker and add a new one
    let target = this.state.targets.find(x => x.id == info.idTarget);
    let routeMarkerInfo = this.state.routeMarkers.find(x => x.idGenerator == info.generator.id);
    let newMarker = this.getMarker(info.generator, target.color);
    this.state.routeMarkersLayer.removeLayer(routeMarkerInfo.markersLayer);
    this.state.routeMarkersLayer.addLayer(newMarker);
    routeMarkerInfo.markersLayer = newMarker;
    if (info.oldType == PositionGeneratorType.LineString && routeMarkerInfo.polylineLayer != null) {
      this.map.removeLayer(routeMarkerInfo.polylineLayer);
    }
    if (info.generator.type == PositionGeneratorType.LineString) {
      this.createPolylineLayer(routeMarkerInfo, info.generator.route, target.color);
    }
    routeMarkerInfo.type = info.generator.type;
    this.updateHints(info.idTarget);
  }

  private onModeChanged(x: { mode: ScenarioInteractionMode; idGenerator: string; }): void {
    if (this.state.mode == ScenarioInteractionMode.EditRoute)
      this.leaveEditRouteMode();
    else if (this.state.mode == ScenarioInteractionMode.Replay)
      this.leaveReplayMode();
      
    if (x.mode == ScenarioInteractionMode.AddPoint)
      this.enterAddPointMode(x.idGenerator);
    else if (x.mode == ScenarioInteractionMode.Default)
      this.enterDefaultMode();
    else if (x.mode == ScenarioInteractionMode.AddRoute)
      this.enterAddRouteMode(x.idGenerator);
    else if (x.mode == ScenarioInteractionMode.EditRoute)
      this.enterEditRouteMode(x.idGenerator);
    else if (x.mode == ScenarioInteractionMode.Replay)
      this.enterReplayMode();
  }
  
  private enterReplayMode() {
    this.state.mode = ScenarioInteractionMode.Replay;
  }

  private onCurrentTargetChanged(id: string): void {
    //cancel the edit or create of the route if exists?
    (this.map as any)?.pm.disableDraw('Line');
    // this.hideMarkersFromTarget(this.state.currentTarget?.id);
    this.selectClickedMarker(this.state.targets.find(x => x.id == id));
    // this.showMarkersFromTarget(id);
  }

  private onTargetCogChanged(x: { idTarget: string; cog: number; }): void {
    return this.rotateMarker(x);
  }

  private onTargetPositionChanged(change: { idTarget: string; position: Point; }): void {
    if (change.position == null) //The position is not defined
      return;
    let target = this.state.targets.find(x => x.id == change.idTarget);

    target.marker.setLatLng(L.latLng(change.position.lat, change.position.lon));
  }

  private onGeneratorRouteChanged(info: { idGenerator: string; idTarget: string; route: Point[]; }) {
    let target = this.state.targets.find(x => x.id == info.idTarget);
    let routeMarker = this.state.routeMarkers.find(x => x.idGenerator == info.idGenerator);
    //This will be null if we duplicated. In that case the polyline is constructed when the generator is added.
    //When drawing a new one, the tmpRouteLayer is kept from the gui event to be added here.
    //I think there is a simpler way to do this, just not now.
    if (routeMarker.polylineLayer != null) {
      (routeMarker.polylineLayer as L.Polyline).setLatLngs(info.route.map(x => L.latLng(x.lat, x.lon)));
    }
    else {
      this.createPolylineLayer(routeMarker, info.route, target.color);
    }

    routeMarker.route = info.route;
    if (this.state.currentTarget.id == info.idTarget) {
      this.addPointsToRouteLayer(routeMarker, info.route);
    }

    this.updateHints(info.idTarget);
  }

  private onGeneratorDeleted(info: { idGenerator: string; idTarget: string; }): void {
    let markerInfo = this.state.routeMarkers.find(x => x.idGenerator == info.idGenerator);
    let index = this.state.routeMarkers.indexOf(markerInfo);
    if (markerInfo != null) {
      this.state.routeMarkersLayer.removeLayer(markerInfo.markersLayer);
      if (markerInfo.polylineLayer != null)
        this.state.routeMarkersLayer.removeLayer(markerInfo.polylineLayer);
      this.state.routeMarkers.splice(index, 1);
    }
    this.updateHints(info.idTarget);
  }

  private onTargetAdded(id: string, point: Point) {
    let m = new L.Marker(L.latLng(point.lat, point.lon)).addTo(this.state.targetsLayer);
    let color = this.colors[this.state.targets.length % (this.colors.length - 1)];
    let info = { id: id, marker: m, color: color };

    m.on("click", () => this.zone.run(() => { this.scenarioFacade.setCurrentTarget(info.id); }));
    m.setRotationOrigin("center center");
    this.state.targets.push(info);
  }

  private onTargetDeleted(id: string) {
    let index = this.state.targets.findIndex(x => x.id == id);
    this.state.targetsLayer.removeLayer(this.state.targets[index].marker);
    this.state.targets.splice(index, 1);

    for (let routeMarkerInfo of this.state.routeMarkers.filter(x => x.idTarget == id)) {
      let idxRouteMarker = this.state.routeMarkers.findIndex(x => x.idGenerator == routeMarkerInfo.idGenerator);
      this.state.routeMarkersLayer.removeLayer(routeMarkerInfo.markersLayer);

      if (routeMarkerInfo.polylineLayer != null)
        this.map.removeLayer(routeMarkerInfo.polylineLayer);

      this.state.routeMarkers.splice(idxRouteMarker, 1);
    }

    this.updateHints(id);
  }

  private onGeneratorPositionUpdated(info: { idTarget: string; idGenerator: string; position: Point, isFirst: boolean }): void {
    let existent = this.state.routeMarkers.find(x => x.idGenerator == info.idGenerator);
    (existent.markersLayer as L.CircleMarker).setLatLng(L.latLng(info.position.lat, info.position.lon));
    this.updateHints(info.idTarget);
  }

  private createPolylineLayer(routeMarker: RouteMarkerInfo, route: Point[], color: string) {
    routeMarker.polylineLayer = L.polyline(route.map(x => L.latLng(x.lat, x.lon)), { color: color, weight: 1 });
    routeMarker.polylineLayer.on('pm:disable', _ => {
      this.guiPolylineDrawFinished({ layer: routeMarker.polylineLayer }, false);
    });
    this.state.routeMarkersLayer.addLayer(routeMarker.polylineLayer);
    routeMarker.route = route;
  }

  private updateHints(idTarget: string) {
    //remove all, add all
    let hintsFromTarget = this.state.hintsInfo.filter(x => x.idTarget == idTarget);
    for (let hint of hintsFromTarget) {
      let idx = this.state.hintsInfo.indexOf(hint, 0);
      this.state.hintsLayer.removeLayer(hint.layer);
      this.state.hintsInfo.splice(idx, 1);
    }

    let target = this.state.targets.find(x => x.id == idTarget);
    //The target might not exist anymore.
    if (target == null)
      return;

    const color = target.color;
    let routeMarkers = this.state.routeMarkers.filter(x => x.idTarget == idTarget);

    for (let i = 1; i < routeMarkers.length; i++) {
      const destinationMarker = routeMarkers[i];
      const originMarker = routeMarkers[i - 1];
      let originalPosition: L.LatLng = null;
      let destinationPosition: L.LatLng = null;
      if (originMarker.type == PositionGeneratorType.Fixed || originMarker.type == PositionGeneratorType.SpeedBearing)
        originalPosition = (originMarker.markersLayer as L.CircleMarker).getLatLng();
      else if (originMarker.type == PositionGeneratorType.LineString && originMarker.route?.length > 1) {
        originalPosition = new L.LatLng(originMarker.route[originMarker.route.length - 1].lat, originMarker.route[originMarker.route.length - 1].lon);
      }

      if (destinationMarker.type == PositionGeneratorType.Fixed || destinationMarker.type == PositionGeneratorType.SpeedBearing)
        destinationPosition = (destinationMarker.markersLayer as L.CircleMarker).getLatLng();
      else if (destinationMarker.type == PositionGeneratorType.LineString && destinationMarker.route?.length > 1)
        destinationPosition = new L.LatLng(destinationMarker.route[0].lat, destinationMarker.route[0].lon);

      if (destinationPosition == null || originalPosition == null)
        continue;
      const layer = new L.Polyline([originalPosition, destinationPosition], { color: color, interactive: false, weight: .5, dashArray: "4" });
      layer.addTo(this.state.hintsLayer);
      this.state.hintsInfo.push(new HintInfo(idTarget, originMarker, destinationMarker, layer))
    }
  }

  private addPointsToRouteLayer(existent: RouteMarkerInfo, route: Point[]) {
    let target = this.state.targets.find(x => x.id == existent.idTarget);
    this.state.routeMarkersLayer.removeLayer(existent.markersLayer);
    let points = this.getRoutePointsLayer(route, target.color);
    existent.markersLayer = points;
    this.state.routeMarkersLayer.addLayer(points);
  }

  private updateReplayTargets(x: ReplayTickArgs): void {
    console.log(x);
    for (const position of x.positions) {
      let target = this.state.targets.find(x => x.id == position.idTarget);
      target.marker.setLatLng(L.latLng(position.position.lat, position.position.lon));
      this.rotateMarker({ idTarget: target.id, cog: position.courseOverGroundDegrees })
    }
  }

  private leaveReplayMode() {
    this.scenarioFacade.getTargets$()
    .pipe(take(1))
    .subscribe(x=> {
      for (const position of x) {
        let target = this.state.targets.find(x => x.id == position.id);
        target.marker.setLatLng(L.latLng(position.position.lat, position.position.lon));
        this.rotateMarker({ idTarget: target.id, cog: position.cog })
      }
    })
  }

  private leaveEditRouteMode() {
    let routeMarkerInfo = this.state.routeMarkers.find(x => x.idGenerator == this.state.idGenerator);
    (routeMarkerInfo.polylineLayer as any).pm.disable();
    if (this.state.currentTarget.id == routeMarkerInfo.idTarget)
      this.addPointsToRouteLayer(routeMarkerInfo, routeMarkerInfo.route);
  }

  private getMarker(generator: PositionGenerator, color: string) {
    let marker: L.Layer;
    if (generator.type == PositionGeneratorType.Fixed || generator.type == PositionGeneratorType.SpeedBearing) {
      marker = new L.CircleMarker(L.latLng(generator.position.lat, generator.position.lon), { color: color, weight: 1 })
        .addTo(this.state.routeMarkersLayer);
    }
    else if (generator.type == PositionGeneratorType.LineString) {
      marker = this.getRoutePointsLayer(generator.route, color);
    }
    return marker;
  }

  private getRoutePointsLayer(route: Point[], color: string) {
    let featureGroup = L.featureGroup();
    if (route.length == 0)
      return featureGroup;
    for (let p of route) {
      featureGroup.addLayer(new L.CircleMarker(L.latLng(p.lat, p.lon, null), { color: color, weight: 1, interactive: false, radius: 5 }));
    }
    return featureGroup;
  }

  private enterEditRouteMode(idGenerator: string) {
    let routeMarkersInfo = this.state.routeMarkers.find(x => x.idGenerator == idGenerator);
    this.state.idGenerator = idGenerator;
    this.state.mode = ScenarioInteractionMode.EditRoute;
    (routeMarkersInfo.polylineLayer as any).pm.enable({ preventMarkerRemoval: true });
  }

  private enterAddRouteMode(idGenerator: string) {
    this.state.idGenerator = idGenerator;
    this.state.hintText = "You can draw or edit your route."
    this.state.mode = ScenarioInteractionMode.AddRoute;
    // enable polygon drawing mode
    (this.map as any).pm.enableDraw('Line', {
      snappable: true,
      snapDistance: 20,
    });
  }

  private enterDefaultMode() {

    this.state.mode = ScenarioInteractionMode.Default;
    this.state.idGenerator = null;
    this.state.hintText = "";
    this.state.showHint = false;

  }

  private enterAddPointMode(idGenerator: string): void {
    this.state.mode = ScenarioInteractionMode.AddPoint;
    this.state.idGenerator = idGenerator;
    this.state.hintText = "Click on the map to set the position";
    this.state.showHint = true;
  }

  private rotateMarker(change: { idTarget: string; cog: number }) {
    let info = this.state.targets.find(x => x.id == change.idTarget);

    if (info == null)
      return;

    info.marker.setRotationAngle(change.cog);
  }

  /**When clicking a marker it becomes the selected marker*/
  private selectClickedMarker(info: MapTargetInfo) {
    if (info?.id == this.state.currentTarget?.id)
      return;
    this.setCurrentMarker(info);
  }

  private setCurrentMarker(info: MapTargetInfo) {
    //Change the old selected marker icon before replacing
    this.state.currentTarget?.marker.setIcon(this.targetIcon);
    if (info == null)
      return;
    this.state.currentTarget = info;
    info.marker.setIcon(this.selectedIcon);
  }
}

interface RouteMarkerInfo {
  route: Point[];
  markersLayer: L.Layer;
  polylineLayer: L.Polyline;
  idTarget: string;
  idGenerator: string;
  type: PositionGeneratorType
}

class HintInfo {
  constructor(public idTarget: string,
    public origin: RouteMarkerInfo,
    public destination: RouteMarkerInfo,
    public layer: L.Layer) {

  }
}

class MapState {
  targets: MapTargetInfo[] = [];
  routeMarkers: RouteMarkerInfo[] = [];
  targetsLayer = featureGroup();
  routeMarkersLayer = featureGroup();
  hintsLayer = featureGroup();
  currentTarget: MapTargetInfo;
  hintsInfo: HintInfo[] = [];
  mode: ScenarioInteractionMode = ScenarioInteractionMode.Default;
  modes = ScenarioInteractionMode;
  idGenerator: string;
  showHint = false;
  hintText = "";
}

interface MapTargetInfo {
  id: string;
  marker: L.Marker<any>;
  color: string
}
