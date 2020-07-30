/**
 * This is the state object that represents the replay. It contains the state itself (suprise!) 
 * such as the current time, the mode (is it playing, stopped, paused?), the positions that are 
 * sent on each tick, etc. Here is where the real logic of the replay happens.
 * 
 * This class receives requests, performs actions to mutate the state and emits events notifying that
 * those actions were performed. A typical case:
 * 
 * User clicks play button -> UI calls ReplayFacade layer -> ReplayFacade layer calls this state ->
 * the ReplayState emits an event saying the replay is now playing -> UI reacts to that event.
 * 
 * Notice there is a clear "U" direction pattern in the flow of things here. It comes from the UI and flows back to it
 * The whole idea is very well explained here:
 * https://angular-academy.com/angular-architecture-best-practices/#high-level-abstraction-layers
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { ReplayState as ReplayState } from './Enums';
import { Target } from './Target';
import { Position } from './Position';
import { ReplayTickArgs } from './ReplayTickArgs';
import { Point } from "./Point";

@Injectable()
export class ReplayController {
  private resolution = 100;
  private tick$: BehaviorSubject<ReplayTickArgs> = new BehaviorSubject<ReplayTickArgs>({ date: new Date(0), positions: [] });
  private replayStateChanged$: BehaviorSubject<ReplayState> = new BehaviorSubject<ReplayState>(ReplayState.Stopped);
  private timer$: Observable<number> = interval(this.resolution);
  private timeSubscription: Subscription = new Subscription();
  private rangeChanged$ = new BehaviorSubject({ start: new Date(0), end: new Date(0) });
  private _positions = new Map<string, Position[]>();
  public getRangeChanged$() {
    return this.rangeChanged$.asObservable();
  }

  public setTime(millisecondsUnix: number) {
    //filter the current positions and emit the ones matching the most recent of the targets.
    this.tick$.next({ date: new Date(millisecondsUnix), positions: this.getPositionsFromDate(new Date(millisecondsUnix), true) });
  }

  public getReplayStateChanged$() {
    return this.replayStateChanged$.asObservable();
  }

  public getTick$() {
    return this.tick$.asObservable();
  }

  public setPositions(positions: Position[]) {
    //filter according to the current time
    //first we will build a map for the positions indexed by tracknumber
    this._positions = new Map<string, Position[]>();
    positions.sort(this.positionDateComparer());
    for (let pos of positions) {
      if (this._positions.has(pos.idTarget))
        this._positions.get(pos.idTarget).push(pos);
      else
        this._positions.set(pos.idTarget, [pos]);
    }

    let minDate = new Date(positions[0]?.date ?? new Date(0));
    let maxDate = new Date(positions[positions.length - 1]?.date ?? new Date(0));
    this.tick$.next({ date: minDate, positions: this.getPositionsFromDate(minDate, true) });
    this.rangeChanged$.next({ start: minDate, end: maxDate });
  }

  private positionDateComparer(): (a: Position, b: Position) => number {
    return (a, b) => {
      if (a.date == b.date)
        return 0;
      else if (a.date < b.date)
        return -1;
      else
        return 1;
    };
  }

  public playPause() {
    if (this.replayStateChanged$.value == ReplayState.Playing) {
      this.pause();
    }
    else if (this.replayStateChanged$.value == ReplayState.Stopped || this.replayStateChanged$.value == ReplayState.Paused) {
      this.play();
    }
  }

  private play() {
    this.replayStateChanged$.next(ReplayState.Playing);
    this.timeSubscription.add(this.timer$.subscribe(x => {
      //get the next ones
      let prev = this.tick$.value.date.getTime();
      prev += this.resolution;
      let date = new Date(prev);
      this.tick$.next({ date: date, positions: this.getPositionsFromDate(date, false) });
    }));

  }

  public stop() {
    this.replayStateChanged$.next(ReplayState.Stopped);
    this.timeSubscription.unsubscribe();
    this.timeSubscription = new Subscription();
    this.tick$.next({ date: this.rangeChanged$.value.start, positions: this.getPositionsFromDate(this.rangeChanged$.value.start, true) });
  }

  public pause() {
    this.replayStateChanged$.next(ReplayState.Paused);
    this.timeSubscription.unsubscribe();
    this.timeSubscription = new Subscription();
  }

  /**Given a date, returns the most recent positions at that date.
   * There are two modes of operation to this method controlled by the alwaysEmitClosest parameter.
   * When true, the closest position before the date will always be returned. 
   * If false, the position is only returned if it is sufficiently close to be relevant (according to the resolution).
   * The first mode is used for when we are jumping in time to a set date. The second mode is used when emitting
   * continuously at regular intervals and we dont want to emit the same position at every interval tick. If a user
   * wants a position every second we need to not emit during the ticks in that whole second or we would be emitting 
   * spam.
   */
  private getPositionsFromDate(date: Date, alwaysEmitClosest: boolean) {
    let result: Position[] = [];
    //find the most recent position from each target that is smaller than the current date and was not yet emitted
    for (let [_, targetInfos] of this._positions) {
      let tmp: Position;
      for (let target of targetInfos) {
        if (date > new Date(target.date))
          tmp = target;
        else
          break;
      }

      //We wont be emitting repeated positions that were emitted more than resolution
      if (tmp != null && (alwaysEmitClosest || (date.getTime() - tmp.date.getTime()) <= this.resolution))
        result.push(tmp);
    }

    return result;
  }
}


