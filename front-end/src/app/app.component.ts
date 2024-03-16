import { Component } from '@angular/core';
import { LoadingScreenService } from './services/loading-screen/loading-screen.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public loadingScreen: LoadingScreenService) {}
}
