import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { LoadingScreenService } from 'src/app/services/loading-screen/loading-screen.service';
import { SearchPackageResultVersion, PackageSearchResult } from '../../../../../src/models/nuget.model';
import { DropDownKeyValue } from 'src/app/models/drop-down-key-value';
import { CommandService } from 'src/app/services/command-service/command.service';
import { AlertService } from 'src/app/services/alert-service/alert.service';
import { PackageSource } from '../../../../../src/models/option.model';
import { getPackageSourceWebUrl } from '../../shared/component-shared';
import { findStableVersion } from '../../../../../src/services/common.service';

@Component({
  selector: 'app-install-package',
  templateUrl: './install-package.component.html',
  styleUrls: ['./install-package.component.scss']
})
export class InstallPackageComponent implements AfterViewInit {

  constructor(
    private loading: LoadingScreenService,
    private cd: ChangeDetectorRef,
    private commandSrv: CommandService,
    private alert: AlertService) {


  }

  installForm = new FormGroup({
    projectIndex: new FormControl('', []),
    packageSourceId: new FormControl('', []),
    searchValue: new FormControl('', [])
  });


  // pageNumber: number = 1;
  // totalHits: number = 0;
  readonly itemsPerPage: number = 10;
  projectList: DropDownKeyValue[] = [];
  packageSourceList: DropDownKeyValue[] = [];

  ngAfterViewInit(): void {
    this.getData();
  }

  totalPackageSource: number = 0;
  originalPackageSources: PackageSource[] = [];
  getData() {
    this.loading.startLoading();
    this.commandSrv.reload().subscribe(res => {

      this.projectList = res.result.map(proj => ({
        Key: proj.id.toString(),
        Value: proj.projectName
      }));

      this.commandSrv.getPackageSources().subscribe(sources => {
        if (Array.isArray(sources.result) && sources.result.length >= 1) {
          this.originalPackageSources = sources.result;
          this.packageSourceList = sources.result.map(z => ({ Key: z.id.toString(), Value: z.sourceName }));

          sources.result.forEach(src => {
            this.packageSearchResultList[src.id] = {
              packageSourceId: src.id,
              packageSourceName: src.sourceName,
              packages: [],
              totalHits: 0
            };
            this.sourcesPages[src.id] = 1;
          });

          if (this.packageSourceList.length == 1) {
            this.totalPackageSource = 1;
            this.installForm.controls["packageSourceId"].setValue(this.packageSourceList[0].Key);
          }
          else {
            this.totalPackageSource = this.packageSourceList.length;
            this.packageSourceList.unshift({
              Key: '0',
              Value: 'All Sources'
            });
            this.installForm.controls["packageSourceId"].setValue(this.packageSourceList[0].Key);
          }
          this.cd.detectChanges();
        }

        if (this.projectList.length == 1) {
          this.installForm.controls["projectIndex"].setValue(this.projectList[0].Key);
          this.cd.detectChanges();
        }
        this.loading.stopLoading();

      });

    });
  }
  sourcesPages: Record<number, number> = {};
  packageSearchResultList: Record<number, PackageSearchResult> = {};
  packageSourceCollapseStatus: Record<number, boolean> = {};

  searchPackage(pageNumber: number, packageSourceId: number | null) {

    this.loading.startLoading();
    const skip = (pageNumber - 1) * this.itemsPerPage;
    const take = this.itemsPerPage;

    this.commandSrv.searchPackage(this.installForm.controls["searchValue"].value.trim(), skip, take, packageSourceId).subscribe(res => {

      res.result.filter(x => x.packageSourceId == packageSourceId || packageSourceId == null).forEach(source => {
        this.packageSearchResultList[source.packageSourceId] = source;
        source.packages.forEach(p => {
          p.stableVersion = this.findPackageStableVersion(p.versions);
        });
        this.sourcesPages[source.packageSourceId] = pageNumber;
        this.cd.detectChanges();
      });

      this.loading.stopLoading();

    });
  }

  getPackageSourceId() {
    const val: string = this.installForm.controls["packageSourceId"].value;
    let packageSourceId: number | null = null;

    if (val != '0') {
      packageSourceId = +val;
    }
    return packageSourceId;
  }

  onSearch() {
    this.searchPackage(1, this.getPackageSourceId());
  }

  pageChanged(pageNumber: number, packageSourceId: number) {
    this.searchPackage(pageNumber, packageSourceId);
  }
  packageListVersion: Record<string, string> = {};
  change(packageName: string, value: any) {
    this.packageListVersion[packageName] = value;
  }

  isFilterOnSource(packageSourceId: number | null) {
    var selected = this.getPackageSourceId();
    return selected == null || selected == packageSourceId
  }

  install(packageName: string) {
    this.loading.startLoading();
    const selectedVersion = this.packageListVersion[packageName];
    const projectID = this.installForm.controls["projectIndex"].value;
    if (projectID) {
      this.commandSrv.installPackage(parseInt(projectID), packageName, selectedVersion).subscribe(res => {
        this.commandSrv.syncViews("getData");
        this.loading.stopLoading();
      });
    } else {
      this.loading.stopLoading();
      this.alert.error(`The target project isn't selected, select your target project from the drop-down beside the 'search' button.`);
    }
  }

  findPackageStableVersion(searchPackageResultVersions: SearchPackageResultVersion[]): string {
    let versions = searchPackageResultVersions.map(x => x.version);
    var version = findStableVersion(versions)
    return version;
  }

  changeCollapseStatus(packageSourceId: number) {
    this.packageSourceCollapseStatus[packageSourceId] = !(this.packageSourceCollapseStatus[packageSourceId])
  }
  getPackageSourceWebUrl = getPackageSourceWebUrl;
}
