
import { Component, OnInit } from '@angular/core';
import { tileLayer, latLng } from 'leaflet';
import { ScenarioState } from "../core/ScenarioState";
import { ScenarioFacade } from '../abstraction/ScenarioFacade';
import { ScenarioAPI } from '../core/ScenarioAPI';
import { ReplayController } from '../core/ReplayController';
import { ScenarioInteractionMode } from '../core/Enums';

@Component({
  selector: 'app-map-layout',
  templateUrl:'./map-layout.component.html',
  styleUrls:['./map-layout.component.css'],
  providers: [ScenarioFacade, ScenarioState, ScenarioAPI, ReplayController]
})
export class MapLayoutComponent implements OnInit {
  showPositionGenerators: boolean;
  constructor(public model: ScenarioState) { }
  ngOnInit(): void {
    this.model.getModeChanged$().subscribe(x=> this.showPositionGenerators = x.mode != ScenarioInteractionMode.Replay)
  }  
}

