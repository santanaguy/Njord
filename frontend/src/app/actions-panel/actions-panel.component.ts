
import { Component, OnInit } from '@angular/core';
import { ScenarioFacade } from '../abstraction/ScenarioFacade';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeedbackComponent } from '../feedback/feedback.component';
import { Result } from '../core/Result';
import { environment } from 'src/environments/environment';
import { ScenarioInteractionMode } from '../core/Enums';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-actions-panel',
  templateUrl: './actions-panel.component.html',
  styleUrls: ['./actions-panel.component.css'],
})
export class ActionsPanelComponent implements OnInit {
  inReplay: boolean;

  constructor(private scenarioFacade: ScenarioFacade, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.scenarioFacade.getModeChanged$().subscribe(x => this.inReplay = x.mode == ScenarioInteractionMode.Replay);
  }

  guiSaveClicked() {
    //In this case we will call the save on the backend and the 
    //name of the file will be returned. After that we will open
    //a new tab with the file which starts the download.
    this.scenarioFacade.saveScenario()
      .subscribe((x: Result<string>[]) => {
        if (x.length > 0) {
          this.openSnackBar(x);
          if (x[0].success == true)
            window.open(environment.backendUrl + "/scenario/download?file=" + x[0].data, "_blank");
        }
      }, (error: HttpErrorResponse) => {
        //If something went wrong we will just show the errors
          var result = new Result<string>();
          result.code = error.status.toString();
          result.message = error.statusText;
          result.success = false;
          this.openSnackBar([result]);  
      });
  }

  guiReplayModeClicked() {
    this.scenarioFacade.enterReplayMode();
  }

  guiExitReplayModeClicked() {
    this.scenarioFacade.enterDefaultMode();
  }

  guiReplayButtonVisible() {
    return this.scenarioFacade.canEnterReplayMode();
  }

  openSnackBar(results: Result<string>[]) {
    this._snackBar.openFromComponent(FeedbackComponent, {
      data: results,
      duration: 5000
    });
  }
}

