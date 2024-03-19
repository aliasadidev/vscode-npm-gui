import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  toastrClicked: Subject<any> = new Subject();
  constructor(private toasterService: ToastrService) {}

  private setTimeout(timeout?: number) {
    this.toasterService.toastrConfig.timeOut = timeout
      ? timeout
      : this.toasterService.toastrConfig.timeOut;
    return this.toasterService.toastrConfig;
  }

  public info(message?: string, title?: string, timeout?: number): void {
    this.toasterService.toastrConfig.disableTimeOut = false;
    this.setTimeout(timeout);
    this.toasterService.info(message, title);
  }

  public success(message?: string, title?: string, timeout?: number): void {
    this.toasterService.toastrConfig.disableTimeOut = false;
    this.setTimeout(timeout);
    this.toasterService.success(message, title);
  }

  public error(message?: string, title?: string, url?: any): void {
    this.toasterService.toastrConfig.disableTimeOut = true;
    this.toasterService
      .error(message, title, {
        disableTimeOut: true,
        closeButton: true,
        tapToDismiss: true,
      })
      .onShown.subscribe(s => {
        //TODO: resolve the toaster bug!!!
        document.body.click();
      });
  }

  public warning(
    message?: string,
    title?: string,
    timeout?: number,
    disableTimeOut: boolean = false
  ): void {
    this.toasterService.toastrConfig.disableTimeOut = disableTimeOut;
    this.setTimeout(timeout);
    this.toasterService.warning(message, title);
  }

  public clear() {
    this.toasterService.clear();
  }
}
