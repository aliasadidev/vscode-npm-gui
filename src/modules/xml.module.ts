import { PackageDetail } from '../models/nuget.model';
import { Element, ItemGroup } from '../models/project-file.model';
const convert = require('xml-js');

export function getPackages(xml: string): PackageDetail[] {
  let packageList: PackageDetail[] = [];
  let itemGroup = getItemGroupIndexResult(xml);
  if (itemGroup.itemGroupIndex !== -1) {
    checkMoreThenOneItemGroup(itemGroup.projectElement);
    let selectedItemGroup: Element = itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
    let packages: Element[] = getPackageReferences(selectedItemGroup);
    packageList = packages.map(e => {
      let attr = e.attributes;
      let result: PackageDetail = {
        packageName: attr["Include"],
        packageVersion: attr["Version"]
      }
      return result;
    });
  }
  return packageList;
}

export function removePackage(xml: string, packageName: string) {
  let xmlResult: string = xml;
  let itemGroup = getItemGroupIndexResult(xml);
  checkMoreThenOneItemGroup(itemGroup.projectElement);
  let selectedItemGroup: Element = itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
  let delIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);

  let indexSize = 1;
  if (delIndex > 0) {
    let left = (selectedItemGroup.elements[delIndex - 1].text);
    if (left != null && left.search(/\s+/mg) >= 0) {
      indexSize++;
      delIndex--;
    }
  }

  selectedItemGroup.elements.splice(delIndex, indexSize);
  let fullTagEmptyElement: boolean = false;
  if (selectedItemGroup.elements.length === 0) {
    itemGroup.projectElement.elements.splice(itemGroup.itemGroupIndex, 1);
    fullTagEmptyElement = itemGroup.projectElement?.elements.length == 0;
  }
  xmlResult = convert.js2xml(itemGroup.rootElement, { fullTagEmptyElement: fullTagEmptyElement });
  return fixXmlIndention(xmlResult);
}

export function updatePackage(xml: string, packageName: string, version: string) {
  let xmlResult: string = xml;
  let itemGroup = getItemGroupIndexResult(xml);
  let selectedItemGroup: Element = itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
  let packageIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
  selectedItemGroup.elements[packageIndex].attributes["Version"] = version;
  xmlResult = convert.js2xml(itemGroup.rootElement, {});
  return fixXmlIndention(xmlResult);
}

export function addPackage(xml: string, packageName: string, version: string) {
  let xmlResult: string = xml;
  let itemGroup = getItemGroupIndexResult(xml);

  if (itemGroup.itemGroupIndex == -1) {
    let lstIndex = itemGroup.projectElement.elements.map(ele => ele.type === 'element')
      .lastIndexOf(true);
    let topLeft = itemGroup.projectElement.elements[lstIndex - 1].text;

    if (topLeft != null && topLeft.search(/\s+/mg) >= 0) {
      itemGroup.projectElement.elements = insertElement(
        itemGroup.projectElement.elements,
        lstIndex + 1,
        {
          type: 'text',
          text: topLeft,
          name: '',
          elements: []
        });
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


    itemGroup.itemGroupIndex = lstIndex + 1
    // item group is empty
    var text = topLeft?.split(/\r\n|\r|\n/)
    if (text) {
      var lastFormat = text[text.length - 1];
      let space = {
        type: 'text',
        text: "\r\n" + lastFormat + lastFormat,
        name: '',
        elements: []
      };
      let selectedItemGroup: Element = itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
      selectedItemGroup.elements.push(space);


      let space2 = {
        type: 'text',
        text: topLeft,
        name: '',
        elements: []
      };

      selectedItemGroup.elements.push(space2);
    }

  }
  checkMoreThenOneItemGroup(itemGroup.projectElement);

  let selectedItemGroup: Element = itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
  let packageIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
  if (packageIndex === -1) {

    let lstIndex = selectedItemGroup.elements.map(ele => ele.type === 'element')
      .lastIndexOf(true);

    let insertIndex = 0;
    if (lstIndex != -1) {

      insertIndex = lstIndex + 1;
      let right = selectedItemGroup.elements[lstIndex - 1].text;

      if (right != null && right.search(/\s+/mg) >= 0) {
        let space = {
          type: 'text',
          text: right,
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

    let newElement: any = {
      type: "element",
      name: "PackageReference",
      attributes: {
        Include: packageName,
        Version: version
      }
    }

    selectedItemGroup.elements = insertElement(
      selectedItemGroup.elements,
      insertIndex,
      newElement);

    xmlResult = convert.js2xml(itemGroup.rootElement, {});

  } else {
    throw "package already exists in project!"
  }
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
  let groupItemIndex: number = getItemGroupIndex(projectElement);
  return { rootElement: rootObj, itemGroupIndex: groupItemIndex, projectElement: projectElement };
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

function getItemGroupIndex(elm: Element): number {
  let newElm: number = elm.elements.findIndex(
    x => x.name == "ItemGroup" &&
      x.type == "element" &&
      x.elements &&
      x.elements.length > 0 &&
      x.elements.find(z => z.name == "PackageReference" && z.type == "element") !== undefined
  );

  return newElm;
}

function checkMoreThenOneItemGroup(elm: Element): Element[] {
  let newElm: Element[] = elm.elements.filter(
    x => x.name == "ItemGroup" &&
      x.type == "element" &&
      x.elements &&
      x.elements.length > 0 &&
      x.elements.find(z => z.name == "PackageReference" && z.type == "element") !== undefined
  );
  if (newElm && newElm.length > 1) {
    throw "More than one <ItemGroup> find."
  }
  return newElm;
}
