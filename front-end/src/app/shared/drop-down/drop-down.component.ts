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
      multi: true,
      useExisting: forwardRef(() => DropDownComponent),
    }
  ]
})
export class DropDownComponent implements ControlValueAccessor {
  @Input() dataSource: DropDownKeyValue[] = [];
  label: string | undefined = "Select a item";
  private readonly contrllName: string = "";

  constructor(private eRef: ElementRef,
    private parent: FormGroupDirective
  ) {
    this.contrllName = eRef.nativeElement.getAttribute("formControlName")
  }
  writeValue(obj: any): void {
    this.selectedIndex = obj;
  }
  registerOnChange(fn: any): void { }
  registerOnTouched(fn: any): void { }
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
    this.parent.control.controls[this.contrllName].setValue(key);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isShowList = this.isStyledSelect = false;
    }
  }

}
