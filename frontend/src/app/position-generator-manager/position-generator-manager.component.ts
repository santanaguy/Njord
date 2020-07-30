import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { PositionGeneratorType, ScenarioInteractionMode } from '../core/Enums';
import { Point } from "../core/Point";
import { PositionGenerator } from "../core/PositionGenerator";
import { Target } from "../core/Target";
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';
import { filter } from 'rxjs/operators'
import { PositionGeneratorComponent } from '../position-generator/position-generator.component';
import { ScenarioFacade } from '../abstraction/ScenarioFacade';

@Component({
  selector: 'app-position-generator-manager',
  templateUrl: './position-generator-manager.component.html',
  styleUrls: ['./position-generator-manager.component.scss'],
  providers: [PositionGeneratorComponent],
})
export class PositionGeneratorManagerComponent implements OnInit {
  targetInfoSelected: TargetInfo;
  targetInfoList: TargetInfo[] = [];
  modes = ScenarioInteractionMode;
  private targets: Target[];
  currentMode: ScenarioInteractionMode;

  constructor(public dialog: MatDialog, public scenarioFacade: ScenarioFacade) {

    scenarioFacade.getTargets$().subscribe(x => this.targets = x);
    scenarioFacade.getCurrentTarget$().subscribe(x => this.updateOrCreateTargetInfo(x));
    scenarioFacade.getTargetAdded$().subscribe(x => this.updateOrCreateTargetInfo(x.id));
    scenarioFacade.getGeneratorAdded$().subscribe(x => this.onGeneratorAdded(x));
    scenarioFacade.getTargetDeleted$().subscribe(x => this.onDeletedTarget(x.id));
    scenarioFacade.getGeneratorDeleted$().subscribe(x => this.onDeletedGenerator(x.idGenerator));
    scenarioFacade.getModeChanged$().subscribe(x=> this.onModeChanged(x));
    this.targetInfoList = [];

    //Load the data already in the scenario.
    for (const target of this.targets) {
      this.updateOrCreateTargetInfo(target.id);
      for (const generator of target.positionGenerators) {
        this.onGeneratorAdded({idTarget: target.id, generator: generator})
      }
    }
  }

  ngOnInit(): void {

  }

  onModeChanged(x: { mode: ScenarioInteractionMode; idGenerator: string; }): void {
    this.currentMode = x.mode;
  }

  onDeletingGenerator(info: PositionGeneratorInfo) {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '250px',
      data: info.generator.description
    });

    dialogRef.afterClosed()
      .pipe(filter(result => result == true))
      .subscribe(_ => this.scenarioFacade.deleteGenerator(info.generator.id));
  }

  onDeletingTarget() {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '250px',
      data: this.targetDescription(this.targetInfoSelected)
    });

    dialogRef.afterClosed()
      .pipe(filter(x => x == true))
      .subscribe(_ => this.scenarioFacade.deleteTarget(this.targetInfoSelected.id));
  }

  onAdding() {
    this.scenarioFacade.addGenerator(this.targetInfoSelected.id);
  }

  onGeneratorAdded(info: { idTarget: string; generator: PositionGenerator }) {
    var targetInfo = this.targetInfoList.find(x => x.id == info.idTarget);
    targetInfo.generatorsInfo.push(new PositionGeneratorInfo(info.generator, false));
  }

  selectedTargetChanged() {
    this.scenarioFacade.setCurrentTarget(this.targetInfoSelected.id);
  }

  targetDescription(target: TargetInfo) {
    return target?.GetTargetDescription() ?? null;
  };

  onDuplicating(generatorInfo: PositionGeneratorInfo) {
    this.scenarioFacade.duplicateGenerator(generatorInfo.generator.id);
  }

  private onDeletedTarget(id: string) {
    var idx = this.targetInfoList.findIndex((value) => value.id == id);
    this.targetInfoList.splice(idx, 1);
  }

  private onDeletedGenerator(id: string) {
    var idx = this.targetInfoSelected.generatorsInfo.findIndex((value) => value.generator.id == id);
    this.targetInfoSelected.generatorsInfo.splice(idx, 1);
  }

  private updateOrCreateTargetInfo(idTarget: string) {
    if (idTarget == null || idTarget.length == 0) {
      this.targetInfoSelected = null;
      return;
    }

    let target = this.targetInfoList.find(x => x.id == idTarget);
    //Target does not exist yet
    if (target == null) {
      let tmp = this.targets.find(x => x.id == idTarget);
      target = new TargetInfo(idTarget, []);
      this.targetInfoList.push(target);
    }
    this.targetInfoSelected = target;
  }
}

class PositionGeneratorInfo {
  constructor(public generator: PositionGenerator, public collapsed: boolean) { }
}

class TargetInfo {
  constructor(public id: string, public generatorsInfo: PositionGeneratorInfo[]) { }

  public GetTargetDescription(): string {
    let firstGenerator = this.generatorsInfo[0];
    return `${this.id} - ${firstGenerator?.generator.mmsi ?? "[No MMSI]"} - ${firstGenerator?.generator.name ?? "[No Name]"}`;
  }
}
