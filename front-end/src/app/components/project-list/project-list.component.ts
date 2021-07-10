import { Component, ElementRef, OnInit } from '@angular/core';
import { PackageDetail, Project } from '../../../../../src/models/project.model'


declare var command: any;


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})

export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  constructor(private elm: ElementRef) { }
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

    this.colSpan = this.displayedColumns.length;



  }

  loadProjectList() {
    this.projects.push({
      id: 1,
      packages: [{
        isUpdated: true,
        newerVersion: '10.0.0',
        packageName: 'Nuget',
        packageVersion: '10.0.0',
        versionList: ["10.0.0", '9.0.0']
      },
      {
        isUpdated: false,
        newerVersion: '2.0.0',
        packageName: 'Nuget2',
        packageVersion: '1.0.0',
        versionList: ["1.0.0", '2.0.0']
      }],
      projectName: 'App.csproj',
      projectPath: '/home/ali/App.csproj'
    });
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


  // selectLastVersion(versions: string[], newerVersion: string): string {
  //   const newser = versions.find(e => e == newerVersion);
  //   return newser ? newser : versions[versions.length - 1];
  // }
  mx: Record<string, string> = {};
  getSelectedVersion(packageSelectId: string) {
    //var e = this.elm.nativeElement.getAttribute('someattribute');
    //const row =
    //const versionOptions = row.querySelector('[name="versionList"]');
    //const selectedVersion = versionOptions.value;
    //return selectedVersion;
  }
  update(projectId: number, packageName: string) {
    const selectedVersion = this.getMx(projectId, packageName);
    const that = this;
    command('nugetpackagemanagergui.updatePackage', { ID: projectId, PackageName: packageName, SelectedVersion: selectedVersion }, function () {
      that.loadProjectList();
    });
  }
  updateAll(projectId: number, packageName: string) {
    const selectedVersion = this.getMx(projectId, packageName);
    const that = this;
    command('nugetpackagemanagergui.updateAllPackage', { ID: projectId, PackageName: packageName, SelectedVersion: selectedVersion }, function () {
      that.loadProjectList();
    });
  }
  remove(projectId: number, packageName: string) {
    const selectedVersion = this.getMx(projectId, packageName);
    const that = this;
    command('nugetpackagemanagergui.removePackage', { ID: projectId, PackageName: packageName, SelectedVersion: selectedVersion }, function () {
      that.loadProjectList();
    });
  }
  removeAll(projectId: number, packageName: string) {
    const that = this;
    command('nugetpackagemanagergui.removeAllPackage', { ID: projectId, PackageName: packageName }, function () {
      that.loadProjectList();
    });
  }

  change(id: number, packageName: string, value: string) {
    this.mx[(id + '.' + packageName)] = value;
  }
  getMx(projectId: number, packageName: string) {
    return this.mx[`${projectId}.${packageName}`];
  }
}
