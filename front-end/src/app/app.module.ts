import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppComponent } from './app.component';
import { LoadingScreenComponent } from './shared/loading-screen/loading-screen.component';
import { LoadingScreenService } from './services/loading-screen/loading-screen.service';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { InstallPackageComponent } from './components/install-package/install-package.component';
import { OnCreateDirective } from './directives/on-create.directive';
import { DropDownComponent } from './shared/drop-down/drop-down.component';

@NgModule({
  declarations: [
    AppComponent,
    LoadingScreenComponent,
    ProjectListComponent,
    InstallPackageComponent,
    OnCreateDirective,
    DropDownComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ],
  providers: [LoadingScreenService],
  bootstrap: [AppComponent]
})
export class AppModule { }
