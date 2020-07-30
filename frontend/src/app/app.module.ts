import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapComponent } from './map/map.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MapLayoutComponent } from './map-layout/map-layout.component';
import { PositionGeneratorComponent } from './position-generator/position-generator.component';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule, MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PositionGeneratorManagerComponent } from './position-generator-manager/position-generator-manager.component';
import { MatTabsModule } from '@angular/material/tabs';
import {MatDialogModule} from '@angular/material/dialog'; 
import { DialogDeleteComponent } from './dialog-delete/dialog-delete.component';
import {MatMenuModule} from '@angular/material/menu';
import { TargetContextMenuComponent } from './target-context-menu/target-context-menu.component';
import { createCustomElement } from '@angular/elements';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { HttpClientModule } from '@angular/common/http';
import { ActionsPanelComponent } from './actions-panel/actions-panel.component';
import {MatSnackBarModule} from '@angular/material/snack-bar'
import { FeedbackComponent } from './feedback/feedback.component';
import {MatListModule} from '@angular/material/list';
import { ReplayWidgetComponent } from './replay-widget/replay-widget.component';
import {MatSliderModule} from '@angular/material/slider';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MapLayoutComponent,
    PositionGeneratorComponent,
    ReplayWidgetComponent,
    PositionGeneratorManagerComponent,DialogDeleteComponent,
    TargetContextMenuComponent,
    ActionsPanelComponent,
    FeedbackComponent
  ],
  entryComponents:[DialogDeleteComponent, TargetContextMenuComponent, FeedbackComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LeafletModule.forRoot(),
    MatSidenavModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatIconModule,
    MatSliderModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    MatCardModule,
    AppRoutingModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    LeafletDrawModule, 
    HttpClientModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(private injector: Injector) {
    
  }


}
