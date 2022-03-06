import { Component, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormGroupDirective } from '@angular/forms';
import { DropDownKeyValue } from 'src/app/models/drop-down-key-value';

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropDownComponent),
      multi: true
    }
  ]
})
export class DropDownComponent implements ControlValueAccessor {

  private _dataSource: DropDownKeyValue[] = [];
  @Input() set dataSource(value: DropDownKeyValue[]) { this._dataSource = value; }
  get dataSource(): DropDownKeyValue[] { return this._dataSource; }




  @Input() label: string | undefined = "Select a item";
  private readonly formControlName: string = "";

  constructor(private eRef: ElementRef, private parent: FormGroupDirective) {
    this.formControlName = eRef.nativeElement.getAttribute("formControlName");
  }



  writeValue(obj: any): void {
    this.selectedIndex = obj;
    if (this.selectedIndex) {
      const title = this._dataSource.find(x => x.Key == this.selectedIndex)?.Value;
      this.label = title;
    }
  }


  onChange: any = () => { }
  onTouch: any = () => { }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  ngOnInit(): void { }

  isStyledSelect: boolean = false;
  selectedIndex?: any = null;
  isShowList: boolean = false;

  onStyledSelect() {
    this.isStyledSelect = !this.isStyledSelect;
  }

  onListItem(key: string) {
    this.isStyledSelect = false;
    this.label = this.dataSource.find(e => e.Key == key)?.Value;
    this.isShowList = false;
    if (this.parent.control.controls[this.formControlName])
      this.parent.control.controls[this.formControlName].setValue(key);
  }

  @HostListener('document:click', ['$event'])
  clickOut(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isShowList = this.isStyledSelect = false;
    }
  }


}
