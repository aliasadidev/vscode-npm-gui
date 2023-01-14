import { PackageDetail } from '../models/nuget.model';
import { Element, ItemGroup } from '../models/project-file.model';
import { Project } from '../models/project.model';
import { EOL } from './utils';
import { js2xml } from './js2xml';
import { xml2js } from './xml2js';

export function getPackages(xml: string, project: Project): PackageDetail[] {
  let packageList: PackageDetail[] = [];
  let itemGroup = getItemGroupIndexResult(xml);
  if (itemGroup.itemGroupIndex !== -1) {
    checkMoreThenOneItemGroup(itemGroup.projectElement, project);
    let selectedItemGroup: Element = itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
    let packages: Element[] = getPackageReferences(selectedItemGroup);
    packageList = packages.map(e => {
      let attr = e.attributes;
      let result: PackageDetail = {
        packageName: attr["Include"],
        packageVersion: attr["Version"]
      };
      return result;
    });
  }
  return packageList;
}

export function removePackage(xml: string, packageName: string, project: Project) {
  let xmlResult: string = xml;
  let itemGroup = getItemGroupIndexResult(xml);
  checkMoreThenOneItemGroup(itemGroup.projectElement, project);
  let selectedItemGroup: Element = itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
  let delIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);

  let indexSize = 1;
  if (delIndex > 0) {
    let left = selectedItemGroup.elements[delIndex - 1]?.text;
    if (left != null && left.search(/\s+/mg) >= 0) {
      indexSize++;
      delIndex--;
    }
  }

  selectedItemGroup.elements.splice(delIndex, indexSize);

  let fullTagEmptyElement: boolean = (selectedItemGroup.elements.length === 0);
  xmlResult = js2xml(itemGroup.rootElement, { fullTagEmptyElement: fullTagEmptyElement });
  return xmlResult;
}

export function updatePackage(xml: string, packageName: string, version: string) {
  let xmlResult: string = xml;
  let itemGroup = getItemGroupIndexResult(xml);
  let selectedItemGroup: Element = itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
  let packageIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
  selectedItemGroup.elements[packageIndex].attributes["Version"] = version;
  xmlResult = js2xml(itemGroup.rootElement, {});
  return xmlResult;
}

export function addPackage(xml: string, packageName: string, version: string, project: Project) {
  let xmlResult: string = xml;
  let itemGroup = getItemGroupIndexResult(xml);
  let isEmptyProject = false;
  if (itemGroup.itemGroupIndex == -1) {
    isEmptyProject = createNewItemGroup(itemGroup);
  }
  checkMoreThenOneItemGroup(itemGroup.projectElement, project);

  let selectedItemGroup: Element = itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
  let packageIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
  if (packageIndex === -1) {

    let lstIndex = selectedItemGroup.elements.map(ele => ele.type === 'element')
      .lastIndexOf(true);

    let insertIndex = 0;
    if (lstIndex != -1) {

      insertIndex = lstIndex + 1;
      let rightText = selectedItemGroup.elements[lstIndex - 1]?.text;

      if (rightText != null && rightText.search(/\s+/mg) >= 0) {
        let space = {
          type: 'text',
          text: rightText,
          name: '',
          elements: []
        };
        selectedItemGroup.elements = insertElement(
          selectedItemGroup.elements,
          insertIndex,
          space);

        insertIndex++;
      }
    } else {
      insertIndex = 1;
    }


    /* eslint-disable */
    let newElement: any = {
      type: "element",
      name: "PackageReference",
      attributes: {
        Include: packageName,
        Version: version
      }
    };
    /* eslint-enable */

    selectedItemGroup.elements = insertElement(
      selectedItemGroup.elements,
      insertIndex,
      newElement);

    if (isEmptyProject) {
      let space2 = {
        type: 'text',
        text: `${EOL}  `,
        name: '',
        elements: []
      };

      selectedItemGroup.elements.push(space2);
    }

    xmlResult = js2xml(itemGroup.rootElement, {});

  } else {
    throw "package already exists in project!";
  }
  return xmlResult;
}

function insertElement(arr: Element[], index: number, newItem: Element) {
  return [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted item
    newItem,
    // part of the array after the specified index
    ...arr.slice(index)
  ];
}


function getItemGroupIndexResult(xml: string): ItemGroup {
  let rootObj: Element = xmlToObject(xml);
  let projectIndex: number = getProjectIndex(rootObj);
  let projectElement: Element = rootObj.elements[projectIndex];
  let groupItemIndex: number = getItemGroupIndex(projectElement);
  return { rootElement: rootObj, itemGroupIndex: groupItemIndex, projectElement: projectElement };
}

function createNewItemGroup(itemGroup: ItemGroup): boolean {
  let isEmptyProject = false, isEmptyInlineProject = false;
  let lstIndex = itemGroup.projectElement.elements?.map(ele => ele.type === 'element')
    ?.lastIndexOf(true) ?? -1;
  let topLeftText = null;
  if (lstIndex > 0) {
    topLeftText = itemGroup.projectElement.elements[lstIndex - 1]?.text;
  }
  if (topLeftText != null && topLeftText.search(/\s+/mg) >= 0) {
    if (topLeftText.search(/(\r\n|\n|\r)/gm) >= 0) {
      topLeftText = `${EOL}` + topLeftText.replace(/(\r\n|\n|\r)/gm, "");
    }
    itemGroup.projectElement.elements = insertElement(
      itemGroup.projectElement.elements,
      lstIndex + 1,
      {
        type: 'text',
        text: topLeftText,
        name: '',
        elements: []
      });
    lstIndex++;
  } else {
    // add a default
    isEmptyProject = true;
    topLeftText = '  ';
    if (itemGroup.projectElement.elements) {
      itemGroup.projectElement.elements = insertElement(
        itemGroup.projectElement.elements,
        lstIndex + 1,
        {
          type: 'text',
          text: `${EOL}  `,
          name: '',
          elements: []
        });
    } else {
      isEmptyInlineProject = true;
      itemGroup.projectElement.elements = [{
        type: 'text',
        text: `${EOL}  `,
        name: '',
        elements: []
      }];
    }

    lstIndex++;
  }


  itemGroup.projectElement.elements = insertElement(
    itemGroup.projectElement.elements,
    lstIndex + 1,
    {
      type: "element",
      name: "ItemGroup",
      elements: []
    });

  if (isEmptyInlineProject) {
    let space2 = {
      type: 'text',
      text: `${EOL}`,
      name: '',
      elements: []
    };

    itemGroup.projectElement.elements.push(space2);
  }


  itemGroup.itemGroupIndex = lstIndex + 1;
  // item group is empty
  var newTopLeftText = topLeftText?.split(/\r\n|\r|\n/);
  if (newTopLeftText) {
    var lastFormat = newTopLeftText[newTopLeftText.length - 1];
    let space = {
      type: 'text',
      text: `${EOL}` + lastFormat + lastFormat,
      name: '',
      elements: []
    };
    let selectedItemGroup: Element = itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
    selectedItemGroup.elements.push(space);


    if (!isEmptyProject) {
      let space2 = {
        type: 'text',
        text: topLeftText,
        name: '',
        elements: []
      };

      selectedItemGroup.elements.push(space2);
    }
  }
  return isEmptyProject;
}

function xmlToObject(xml: string): any {
  return xml2js(xml, { captureSpacesBetweenElements: true });
}


function getProjectIndex(elm: Element): number {
  let index: number = elm.elements.findIndex(x => x.name == "Project" && x.type == "element");

  return index;
}
function getPackageReferenceIndex(elm: Element, pkgName: string): number {
  let index: number = elm.elements.findIndex(x => x.name == "PackageReference" && x.type == "element" && x.attributes["Include"] === pkgName);
  return index;
}

function getPackageReferences(elm: Element): Element[] {
  let index: Element[] = elm.elements.filter(x => x.name == "PackageReference" && x.type == "element");
  return index;
}

function getItemGroupIndex(elm: Element): number {
  let newElm: number = elm.elements?.findIndex(
    x => x.name == "ItemGroup" &&
      x.type == "element" &&
      x.elements &&
      x.elements.length > 0 &&
      x.elements.find(z => z.name == "PackageReference" && z.type == "element") !== undefined
  );

  return newElm ?? -1;
}

function checkMoreThenOneItemGroup(elm: Element, project: Project): Element[] {
  let newElm: Element[] = elm.elements.filter(
    x => x.name == "ItemGroup" &&
      x.type == "element" &&
      x.elements &&
      x.elements.length > 0 &&
      x.elements.find(z => z.name == "PackageReference" && z.type == "element") !== undefined
  );
  if (newElm && newElm.length > 1) {
    throw `More than one <ItemGroup> find. ${project.projectName} | ${project.projectPath}`;
  }
  return newElm;
}
