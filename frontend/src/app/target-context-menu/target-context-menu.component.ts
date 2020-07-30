import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'target-context-menu',
    templateUrl: './target-context-menu.component.html',
    styles: [],
  })
  export class TargetContextMenuComponent implements OnInit{
    @Input() idTarget:string;

    constructor(){
    }

    ngOnInit(): void {
        console.log("hello!");
    }

  }