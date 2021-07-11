import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LoadingScreenService } from './services/loading-screen/loading-screen.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'nuget-ui';

  constructor(public loadingScreen: LoadingScreenService) {

  }
  ngOnInit(): void {
    // this.loadingScreen.startLoading();
  }

}
