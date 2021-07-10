import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';

import { LoadingScreenComponent } from './shared/loading-screen/loading-screen.component';
import { LoadingScreenService } from './services/loading-screen/loading-screen.service';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { InstallPackageComponent } from './components/install-package/install-package.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    LoadingScreenComponent,
    ProjectListComponent,
    InstallPackageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule
    // MatFormFieldModule,
    // MatInputModule,
    // MatTableModule
  ],
  providers: [LoadingScreenService],
  bootstrap: [AppComponent]
})
export class AppModule { }
