import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingScreenService } from 'src/app/services/loading-screen/loading-screen.service';
import { Project } from '../../../../../src/models/project.model';
import { SearchPackageResult } from '../../../../../src/models/nuget.model';
declare var command: any;
@Component({
  selector: 'app-install-package',
  templateUrl: './install-package.component.html',
  styleUrls: ['./install-package.component.scss']
})
export class InstallPackageComponent implements OnInit {
  projects: Project[] = [];
  constructor(private loading: LoadingScreenService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
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
    this.loading.startLoading()
    command('nugetpackagemanagergui.searchPackage', { Query: this.searchValue }, (response: any) => {
      this.loading.stopLoading();
      this.packages = response.result;
      console.log(this.packages);
      this.cd.detectChanges();
    });
  }

}
