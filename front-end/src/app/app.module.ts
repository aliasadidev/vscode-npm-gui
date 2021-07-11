import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { LoadingScreenComponent } from './shared/loading-screen/loading-screen.component';
import { LoadingScreenService } from './services/loading-screen/loading-screen.service';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { InstallPackageComponent } from './components/install-package/install-package.component';
import { FormsModule } from '@angular/forms';
import { OnCreateDirective } from './directives/on-create.directive';

@NgModule({
  declarations: [
    AppComponent,
    LoadingScreenComponent,
    ProjectListComponent,
    InstallPackageComponent,
    OnCreateDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatButtonModule,
    // MatSelectModule,
    FormsModule

  ],
  providers: [LoadingScreenService],
  bootstrap: [AppComponent]
})
export class AppModule { }
