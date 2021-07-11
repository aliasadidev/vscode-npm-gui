import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { LoadingScreenService } from 'src/app/services/loading-screen/loading-screen.service';
import { PackageDetail, Project } from '../../../../../src/models/project.model'


declare var command: any;


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})

export class ProjectListComponent implements OnInit, AfterViewInit {
  projects: Project[] = [];
  constructor(private loading: LoadingScreenService, private cd: ChangeDetectorRef) { }
  ngAfterViewInit(): void {

  }

  displayedColumns: string[] = [
    "PackageName",
    "InstalledVersion",
    "Versions",
    "IsUpdated",
    "NewerVersion",
    "Actions"
  ];
  colSpan: number = 0;

  ngOnInit(): void {

    this.loadPackageVersion(true)
    this.colSpan = this.displayedColumns.length;
  }


  loadProjectList() {
    // this.projects.push({
    //   id: 1,
    //   packages: [{
    //     isUpdated: true,
    //     newerVersion: '10.0.0',
    //     packageName: 'Nuget',
    //     packageVersion: '10.0.0',
    //     versionList: ["10.0.0", '9.0.0']
    //   },
    //   {
    //     isUpdated: false,
    //     newerVersion: '2.0.0',
    //     packageName: 'Nuget2',
    //     packageVersion: '1.0.0',
    //     versionList: ["1.0.0", '2.0.0']
    //   }],
    //   projectName: 'App.csproj',
    //   projectPath: '/home/ali/App.csproj'
    // });
  }


  getData() {
    this.loading.startLoading();
    command('nugetpackagemanagergui.getdata', (res: any) => {
      this.projects = res.result;
      console.log(this.projects);
      this.loading.stopLoading();
      this.cd.detectChanges();
    });
  }

  loadPackageVersion(loadVersion: boolean) {
    this.loading.startLoading();
    command('nugetpackagemanagergui.reload', { LoadVersion: loadVersion }, (res: any) => {
      this.projects = res.result;
      console.log(this.projects);
      this.loading.stopLoading();
      this.cd.detectChanges();
    });
  }
  setda(res: any) {
    this.projects = res.result;
  }


  getVersion(pkg: PackageDetail) {
    const knownVersion = pkg.newerVersion !== "Unknown";
    const updateStatus = pkg.isUpdated && knownVersion ? "Yes" : knownVersion ? "No" : "Unknown";

    return updateStatus
  }

  getVersionStyle(pkg: PackageDetail) {
    const knownVersion = pkg.newerVersion !== "Unknown";
    return pkg.isUpdated && knownVersion ?
      "badge badge-success" : knownVersion ?
        "badge badge-danger" : "badge badge-secondary";
  }



  mx: Record<string, string> = {};

  update(projectId: number, packageName: string) {
    const selectedVersion = this.getMx(projectId, packageName);

    command('nugetpackagemanagergui.updatePackage', { ID: projectId, PackageName: packageName, SelectedVersion: selectedVersion }, () => {
      this.getData();
    });
  }
  updateAll(projectId: number, packageName: string) {
    const selectedVersion = this.getMx(projectId, packageName);

    command('nugetpackagemanagergui.updateAllPackage', { ID: projectId, PackageName: packageName, SelectedVersion: selectedVersion }, () => {
      this.getData();
    });
  }
  remove(projectId: number, packageName: string) {
    const selectedVersion = this.getMx(projectId, packageName);

    command('nugetpackagemanagergui.removePackage', { ID: projectId, PackageName: packageName, SelectedVersion: selectedVersion }, () => {
      this.getData();
    });
  }
  removeAll(projectId: number, packageName: string) {

    command('nugetpackagemanagergui.removeAllPackage', { ID: projectId, PackageName: packageName }, () => {
      this.getData();
    });
  }

  change(id: number, packageName: string, value: any) {
    this.mx[(id + '.' + packageName)] = value;
    console.log("XX", this.mx);
  }

  getMx(projectId: number, packageName: string) {
    return this.mx[`${projectId}.${packageName}`];
  }
}
