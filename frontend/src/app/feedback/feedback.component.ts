import {Component, Input, Inject} from '@angular/core';
import {MatSnackBar, MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import { Result } from '../core/Result';

@Component({
  selector: 'app-feedback-component',
  templateUrl: 'feedback.component.html',
  styleUrls: ['feedback.component.css'],
})
export class FeedbackComponent {
  results: Result<any>[];

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: Result<any>[]) { }

  ngOnInit() {
    this.results = this.data;
  }

}