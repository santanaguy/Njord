import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ScenarioFacade } from '../abstraction/ScenarioFacade';
import { ReplayState } from '../core/Enums';

@Component({
  selector: 'replay-widget',
  templateUrl: './replay-widget.component.html',
  styleUrls: ['./replay-widget.component.scss']
})
export class ReplayWidgetComponent implements OnInit, OnDestroy {
  //I need these variables here for now because having a datetime in angular is still a mess. Maybe I should
  //turn this into a component or a service? ridiculous
  positionStartDatePart: Date;
  positionStartTimePart: string;
  positionStartDateTime: Date;

  positionEndDatePart: Date;
  positionEndTimePart: string;
  positionEndDateTime: Date;

  currentTime: number = 0;
  playing: boolean = false;
  stopped: boolean = true;
  replayMinUnix: number;
  replayMaxUnix: number;
  @Output() onCapturingMouseEvents = new EventEmitter<boolean>();
  showLabel = true;
  constructor(public replayFacade: ScenarioFacade) {

    //Here we subscribe to the events from the state layers. As the state mutates
    //we receive notifications about the way it mutated. This means 
    this.replayFacade.getReplayStateChanged$().subscribe(x => this.rangeChanged(x));
    this.replayFacade.getReplayTick$().subscribe(x => this.tick(x));
    this.replayFacade.getReplayRangeChanged$().subscribe(x => this.onRangeChanged(x));
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  /**
   * Invoked when the dates from the replay changed. The widget needs to adapt the min and max
   * of the slider when this happens.
  * @param x 
   */
  private onRangeChanged(x: { start: Date; end: Date; }): void {
    this.currentTime = x.start.getTime();
    this.replayMinUnix = x.start.getTime();
    this.replayMaxUnix = x.end.getTime();
  }

  /**
   * Invoked when the replay ticks and emits new positions. We use this to set current time that the player
   * is on
   * @param millisecondsUnix 
   */
  private tick(info: { date: Date; }): void {
    this.currentTime = info.date.getTime();
  }

  onPlayClicked() {
    this.replayFacade.replayPlayPause();
  }

  onStopClicked() {
    this.replayFacade.replayStop();
  }

  onSetTime(millisecondsEpoch: number) {
    this.replayFacade.replaySetTime(millisecondsEpoch);
  }

  displayTime(millisecondsUnix: number) {
    let tmpDate = new Date(millisecondsUnix);
    tmpDate = new Date(tmpDate.getTime() + tmpDate.getTimezoneOffset() * 60 * 1000);
    return `${tmpDate.getHours().toString().padStart(2, '0')}:${tmpDate.getMinutes().toString().padStart(2, '0')}:${tmpDate.getSeconds().toString().padStart(2, '0')}`;
  }

  /**
   * Invoked when the mode of the replay changed. This will update the buttons
   * @param x 
   */
  private rangeChanged(x: ReplayState): void {
    this.playing = x == ReplayState.Playing;
    this.stopped = x == ReplayState.Stopped || x == ReplayState.Paused;
  }

  /**
   * When dragging the target widget send an event to the 
   * map to disable/enable dragging so it doesn't drag along.
   * @param enable boolean indicating if map should enable of disable dragging
   */
  signalCapturingMouseEvents(isCapturing: boolean) {
    this.onCapturingMouseEvents.next(isCapturing);
  }

}
