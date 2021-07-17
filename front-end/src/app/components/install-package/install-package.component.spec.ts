import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallPackageComponent } from './install-package.component';

describe('InstallPackageComponent', () => {
  let component: InstallPackageComponent;
  let fixture: ComponentFixture<InstallPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallPackageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
