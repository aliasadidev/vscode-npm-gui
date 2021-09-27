import { Injectable } from '@angular/core';
import { BehaviorSubject, bindCallback, Observable } from 'rxjs';
import { CommandResult } from 'src/app/models/command-result';
import { SearchPackageResult } from '../../../../../src/models/nuget.model';
import { Project } from '../../../../../src/models/project.model';
declare var command: any;
@Injectable({
  providedIn: 'root'
})
export class CommandService {
  constructor() { }

  private syncData = new BehaviorSubject('');
  changeProjects: Observable<string> = this.syncData.asObservable();
  syncViews(event: string) {
    this.syncData.next(event);
  }



  reload(loadVersion: boolean = false): Observable<CommandResult<Project[]>> {
    var obs = new Observable<CommandResult<Project[]>>((sub) => {
      command('nugetpackagemanagergui.reload', { LoadVersion: loadVersion }, (res: CommandResult<Project[]>) => sub.next(res));
    });
    return obs;
  }


  getdata(): Observable<CommandResult<Project[]>> {
    var obs = new Observable<CommandResult<Project[]>>((sub) => {
      command('nugetpackagemanagergui.getdata', (res: CommandResult<Project[]>) => sub.next(res));
    });
    return obs;
  }

  updateAllProjects(): Observable<CommandResult<Project[]>> {
    var obs = new Observable<CommandResult<Project[]>>((sub) => {
      command('nugetpackagemanagergui.updateAllProjects', (res: CommandResult<Project[]>) => sub.next(res));
    });
    return obs;
  }

  searchPackage(query: string, skip: number, take: number): Observable<CommandResult<SearchPackageResult>> {

    var obs = new Observable<CommandResult<SearchPackageResult>>((sub) => {
      command('nugetpackagemanagergui.searchPackage', {
        Query: query,
        Skip: skip,
        Take: take
      }, (res: CommandResult<SearchPackageResult>) => sub.next(res));
    });
    return obs;

  }


  installPackage(projectId: number, packageName: string, selectedVersion: string): Observable<CommandResult<any>> {

    var obs = new Observable<CommandResult<any>>((sub) => {
      command('nugetpackagemanagergui.installPackage', {
        ID: projectId,
        PackageName: packageName,
        SelectedVersion: selectedVersion
      }, (res: CommandResult<any>) => sub.next(res));
    });
    return obs;
  }



  updatePackage(projectId: number, packageName: string, selectedVersion: string): Observable<CommandResult<any>> {

    var obs = new Observable<CommandResult<any>>((sub) => {
      command('nugetpackagemanagergui.updatePackage',
        {
          ID: projectId,
          PackageName: packageName,
          SelectedVersion: selectedVersion
        }, (res: CommandResult<any>) => sub.next(res));
    });
    return obs;
  }


  updateAllPackage(projectId: number, packageName: string, selectedVersion: string): Observable<CommandResult<any>> {

    var obs = new Observable<CommandResult<any>>((sub) => {
      command('nugetpackagemanagergui.updateAllPackage',
        {
          ID: projectId,
          PackageName: packageName,
          SelectedVersion: selectedVersion
        }, (res: CommandResult<any>) => sub.next(res));
    });
    return obs;
  }


  removePackage(projectId: number, packageName: string, selectedVersion: string): Observable<CommandResult<any>> {

    var obs = new Observable<CommandResult<any>>((sub) => {
      command('nugetpackagemanagergui.removePackage',
        {
          ID: projectId,
          PackageName: packageName,
          SelectedVersion: selectedVersion
        }, (res: CommandResult<any>) => sub.next(res));
    });
    return obs;
  }


  removeAllPackage(projectId: number, packageName: string): Observable<CommandResult<any>> {

    var obs = new Observable<CommandResult<any>>((sub) => {
      command('nugetpackagemanagergui.removeAllPackage',
        {
          ID: projectId,
          PackageName: packageName
        }, (res: CommandResult<any>) => sub.next(res));
    });
    return obs;
  }

}
