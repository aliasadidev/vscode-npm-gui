import { PackageDetail } from '../models/nuget.model';
import { Element, ItemGroup } from '../models/project-file.model';
import { Project } from '../models/project.model';
import { EOL } from './utils';
const convert = require('xml-js');

export function getPackages(xml: string, project: Project): PackageDetail[] {
  let packageList: PackageDetail[] = [];
  let itemGroup = getItemGroupIndexResult(xml);
  if (JSON.stringify(itemGroup.itemGroupIndex) !== JSON.stringify([-1])) {

    for (let ix in itemGroup.itemGroupIndex) {
      let igIndex = itemGroup.itemGroupIndex[ix];
      let selectedItemGroup: Element = itemGroup.projectElement.elements[igIndex];
      let packages: Element[] = getPackageReferences(selectedItemGroup);
      let packageMap = packages.map(e => {
        let attr = e.attributes;
        let result: PackageDetail = {
          packageName: attr["Include"],
          packageVersion: attr["Version"]
        };
        return result;
      });
      if (packageMap) {
        packageList = packageList.concat(packageMap);
      }
    }
  }

  return packageList;
}

export function removePackage(xml: string, packageName: string, project: Project) {
  let xmlResult: string = xml;
  let itemGroup = getItemGroupIndexResult(xml);
  for (let ix in itemGroup.itemGroupIndex) {
    let igIndex = itemGroup.itemGroupIndex[ix];

    let selectedItemGroup: Element = itemGroup.projectElement.elements[igIndex];
    let delIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
    if (delIndex > -1) {
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
      xmlResult = convert.js2xml(itemGroup.rootElement, { fullTagEmptyElement: fullTagEmptyElement });
      break;
    }
  };

  return fixXmlIndention(xmlResult);
}

export function updatePackage(xml: string, packageName: string, version: string) {
  let xmlResult: string = xml;
  let itemGroup = getItemGroupIndexResult(xml);

  for (let ix in itemGroup.itemGroupIndex) {
    let igIndex = itemGroup.itemGroupIndex[ix];

    let selectedItemGroup: Element = itemGroup.projectElement.elements[igIndex];
    let packageIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
    if (packageIndex > -1) {
      selectedItemGroup.elements[packageIndex].attributes["Version"] = version;
      xmlResult = convert.js2xml(itemGroup.rootElement, {});
      break;
    }
  }

  return fixXmlIndention(xmlResult);
}

export function addPackage(xml: string, packageName: string, version: string, project: Project) {
  let xmlResult: string = xml;
  let itemGroup = getItemGroupIndexResult(xml);
  let isEmptyProject = false;

  if (JSON.stringify(itemGroup.itemGroupIndex) === JSON.stringify([-1])) {
    let newItemGroup = createNewItemGroup(itemGroup);
    isEmptyProject = newItemGroup.isEmptyProject;
    itemGroup.itemGroupIndex = [newItemGroup.itemGroupIndex];
  }

  // check the package is already exist:
  for (let ix in itemGroup.itemGroupIndex) {
    let igIndex = itemGroup.itemGroupIndex[ix];
    let selectedItemGroup: Element = itemGroup.projectElement.elements[igIndex];
    let packageIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
    if (packageIndex > -1) {
      throw "package already exists in project!";
    }
  }

  let firstIndex = itemGroup.itemGroupIndex[0];
  let selectedItemGroup: Element = itemGroup.projectElement.elements[firstIndex];
  // let packageIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
  // if (packageIndex === -1) {

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

  xmlResult = convert.js2xml(itemGroup.rootElement, {});

  // } else {

  // }
  return fixXmlIndention(xmlResult);
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

function fixXmlIndention(xml: string): string {
  let reg = /.[/?]>/g;
  var result = xml.replace(reg, function (match, index) {
    let spaceSelfClosing = (xml[index] == '"' || xml[index] == "'");
    return match.replace(/ ?([/?]>)/g, spaceSelfClosing ? ' $1' : match);
  });
  return result;
}

function getItemGroupIndexResult(xml: string): ItemGroup {
  let rootObj: Element = xmlToObject(xml);
  let projectIndex: number = getProjectIndex(rootObj);
  let projectElement: Element = rootObj.elements[projectIndex];
  let groupItemIndex: number[] = getItemGroupIndex(projectElement);
  return { rootElement: rootObj, itemGroupIndex: groupItemIndex, projectElement: projectElement };
}

function createNewItemGroup(itemGroup: ItemGroup): { isEmptyProject: boolean, itemGroupIndex: number } {
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


  let itemGroupIndex = lstIndex + 1;
  // item group is empty
  let newTopLeftText = topLeftText?.split(/\r\n|\r|\n/);
  if (newTopLeftText) {
    let lastFormat = newTopLeftText[newTopLeftText.length - 1];
    let space = {
      type: 'text',
      text: `${EOL}` + lastFormat + lastFormat,
      name: '',
      elements: []
    };
    let selectedItemGroup: Element = itemGroup.projectElement.elements[itemGroupIndex];
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
  return { isEmptyProject, itemGroupIndex };
}

function xmlToObject(xml: string): any {
  return convert.xml2js(xml, { captureSpacesBetweenElements: true });
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

function getItemGroupIndex(elm: Element): number[] {
  let indexes: number[] = elm.elements?.flatMap(
    (x, i) => (x.name == "ItemGroup" &&
      x.type == "element" &&
      x.elements &&
      x.elements.length > 0 &&
      x.elements.find(z => z.name == "PackageReference" && z.type == "element") !== undefined) ? i : []
  );


  return indexes && indexes.length > 0 ? indexes : [-1];
}

