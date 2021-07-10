import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingScreenService } from 'src/app/services/loading-screen/loading-screen.service';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss']
})
export class LoadingScreenComponent implements OnInit {
  counter: number = 0;
  loadingSubscription: Subscription;

  constructor(private loadingScreenService: LoadingScreenService) {
    this.loadingSubscription = this.loadingScreenService.loadingStatus.subscribe((value) => {
      this.counter = value;
    });
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.loadingSubscription.unsubscribe();
  }


}
