import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoadingScreenService {


  private _counter: number = 0;
  loadingStatus: Subject<number> = new Subject();

  get counter(): number {
    return this._counter;
  }

  set counter(value) {
    this._counter = value;
    this.loadingStatus.next(value);
  }

  startLoading() {
    this.counter++;
  }

  stopLoading() {
    if (this.counter > 0)
      this.counter--;
    console.log("Loading stoped!")
  }
}
