import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';

import { CommandResult } from 'src/app/models/command-result';
import { LoadingScreenService } from 'src/app/services/loading-screen/loading-screen.service';
import { PackageDetail, Project } from '../../../../../src/models/project.model'


declare var command: any;


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})

export class ProjectListComponent implements AfterViewInit {
  projects: Project[] = [];
  packageListVersion: Record<string, string> = {};
  displayedColumns: string[] = [
    "PackageName",
    "InstalledVersion",
    "Versions",
    "IsUpdated",
    "NewerVersion",
    "Actions"
  ];
  colSpan: number = 0;

  constructor(private loading: LoadingScreenService, private cd: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.loadPackageVersion(false);
    this.colSpan = this.displayedColumns.length;
  }

  getData() {
    this.loading.startLoading();
    command('nugetpackagemanagergui.getdata', (res: CommandResult<Project[]>) => {
      this.projects = res.result;
      this.loading.stopLoading();

      this.cd.detectChanges();
    });
  }

  loadPackageVersion(loadVersion: boolean) {
    this.loading.startLoading();
    command('nugetpackagemanagergui.reload', { LoadVersion: loadVersion }, (res: CommandResult<Project[]>) => {
      this.projects = res.result;

      this.loading.stopLoading();
      this.cd.detectChanges();
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

  update(projectId: number, packageName: string) {
    const selectedVersion = this.getSelectedVersion(projectId, packageName);

    command('nugetpackagemanagergui.updatePackage', { ID: projectId, PackageName: packageName, SelectedVersion: selectedVersion }, () => {
      this.getData();
    });
  }

  updateAll(projectId: number, packageName: string) {
    const selectedVersion = this.getSelectedVersion(projectId, packageName);

    command('nugetpackagemanagergui.updateAllPackage', { ID: projectId, PackageName: packageName, SelectedVersion: selectedVersion }, () => {
      this.getData();
    });
  }

  remove(projectId: number, packageName: string) {
    const selectedVersion = this.getSelectedVersion(projectId, packageName);

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
    this.packageListVersion[(id + '.' + packageName)] = value;
  }

  getSelectedVersion(projectId: number, packageName: string) {
    return this.packageListVersion[`${projectId}.${packageName}`];
  }

}
