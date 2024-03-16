import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: '[onCreate]',
})
export class OnCreateDirective {
  @Output() onCreate: EventEmitter<any> = new EventEmitter<any>();
  constructor(public _el: ElementRef) {}

  ngOnInit() {
    this.onCreate.emit();
  }
}
