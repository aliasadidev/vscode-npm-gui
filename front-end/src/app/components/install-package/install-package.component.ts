import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingScreenService } from 'src/app/services/loading-screen/loading-screen.service';
import { Project } from '../../../../../src/models/project.model';
import { SearchPackageResult } from '../../../../../src/models/nuget.model';
declare var command: any;
@Component({
  selector: 'app-install-package',
  templateUrl: './install-package.component.html',
  styleUrls: ['./install-package.component.scss']
})
export class InstallPackageComponent implements OnInit, AfterViewInit {
  projects: Project[] = [];
  constructor(private loading: LoadingScreenService, private cd: ChangeDetectorRef) { }

  // Pagination parameters.
  pageNumber: number = 1;
  totalHits: number = 0;
  itemsPerPage: number = 10;

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    this.getData();
  }

  getData() {
    this.loading.startLoading();
    command('nugetpackagemanagergui.getdata', (res: any) => {
      this.projects = res.result;
      this.loading.stopLoading();
      this.cd.detectChanges();
    });
  }
  searchValue: string = "";
  packages: SearchPackageResult = { data: [], totalHits: 0 };
  searchPackage() {
    this.loading.startLoading();
    const skip = (this.pageNumber - 1) * this.itemsPerPage;
    const take = this.itemsPerPage;

    command('nugetpackagemanagergui.searchPackage', {
      Query: this.searchValue,
      Skip: skip,
      Take: take
    }, (response: any) => {
      this.loading.stopLoading();
      this.packages = response.result;
      this.totalHits = this.packages.totalHits!;
      if (this.searchValue.trim() == "") {
        this.totalHits = this.packages.totalHits = 20000;
      }
      this.itemsPerPage = this.packages.data.length == 0 ? 10 : this.packages.data.length;
      console.log(this.packages, take, skip, this.totalHits);
      this.cd.detectChanges();
    });
  }

  onSearch() {
    this.pageNumber = 1;
    this.totalHits = 0;
    this.itemsPerPage = 10;
    this.searchPackage();
  }

  pageChanged(pageNumber: number) {
    this.pageNumber = pageNumber;
    this.searchPackage();
  }

}
