"use strict";
import { Package } from './models';
let convert = require('xml-js');

export function getPackages(xml: string): Array<Package> {
    let packageList: Array<Package> = [];
    let itemGroup = getItemGroupIndexResult(xml);

    if (itemGroup.GroupItemIndex !== -1) {
        checkMoreThenOneItemGroup(itemGroup.ProjectElement);
        let selectedItemGroup: element = itemGroup.ProjectElement.elements[itemGroup.GroupItemIndex];
        let pacakges: Array<element> = getPackageReferences(selectedItemGroup);
        packageList = pacakges.map(e => {
            let attr = (<attribute>e.attributes);
            let result: Package = {
                PackageName: attr.Include,
                PackageVersion: attr.Version
            }
            return result;
        });
    }
    return packageList;
}

export function removePackage(xml: string, packageName: string) {
    let xmlResult: string = xml;
    let itemGroup = getItemGroupIndexResult(xml);
    checkMoreThenOneItemGroup(itemGroup.ProjectElement);
    let selectedItemGroup: element = itemGroup.ProjectElement.elements[itemGroup.GroupItemIndex];
    let delIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
    selectedItemGroup.elements.splice(delIndex, 1);
    if (selectedItemGroup.elements.length === 0) {
        itemGroup.ProjectElement.elements.splice(itemGroup.GroupItemIndex, 1);
    }
    xmlResult = convert.js2xml(itemGroup.RootElement, { compact: false, spaces: 2 });
    return xmlResult;
}

export function updatePackage(xml: string, packageName: string, version: string) {
    let xmlResult: string = xml;
    let itemGroup = getItemGroupIndexResult(xml);
    let selectedItemGroup: element = itemGroup.ProjectElement.elements[itemGroup.GroupItemIndex];
    let packageIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
    selectedItemGroup.elements[packageIndex].attributes["Version"] = version;
    xmlResult = convert.js2xml(itemGroup.RootElement, { compact: false, spaces: 2 });
    return xmlResult;
}

export function addPackage(xml: string, packageName: string, version: string) {
    let xmlResult: string = xml;
    let itemGroup = getItemGroupIndexResult(xml);

    if (itemGroup.GroupItemIndex == -1) {
        itemGroup.ProjectElement.elements.push({ type: "element", name: "ItemGroup", elements: [] });
        itemGroup.GroupItemIndex = itemGroup.ProjectElement.elements.length - 1
    }
    checkMoreThenOneItemGroup(itemGroup.ProjectElement);

    let selectedItemGroup: element = itemGroup.ProjectElement.elements[itemGroup.GroupItemIndex];
    let packageIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
    if (packageIndex === -1) {

        let newElement: any = {
            type: "element",
            name: "PackageReference",
            attributes: {
                Include: packageName,
                Version: version
            }
        }
        selectedItemGroup.elements.push(newElement);
        xmlResult = convert.js2xml(itemGroup.RootElement, { compact: false, spaces: 2 });

    } else {
        throw "package already exists in project!"
    }
    return xmlResult;
}



function getItemGroupIndexResult(xml: string): itemgroup {
    let rootObj: element = getData(xml);
    let projectIndex: number = getProjectIndex(rootObj);
    let projectElement: element = rootObj.elements[projectIndex];
    let groupItemIndex: number = getItemGroupIndex(projectElement);
    return { RootElement: rootObj, GroupItemIndex: groupItemIndex, ProjectElement: projectElement };
}



function getData(xml: string): any {
    return convert.xml2js(xml, { compact: false, spaces: 2 });
}


function getProjectIndex(elm: element): number {
    let index: number = elm.elements.findIndex(x => x.name == "Project" && x.type == "element");

    return index;
}
function getPackageReferenceIndex(elm: element, pkgName: string): number {
    let index: number = elm.elements.findIndex(x => x.name == "PackageReference" && x.type == "element" && (<attribute>x.attributes).Include === pkgName);
    return index;
}

function getPackageReferences(elm: element): Array<element> {
    let index: Array<element> = elm.elements.filter(x => x.name == "PackageReference" && x.type == "element");
    return index;
}

function getItemGroupIndex(elm: element): number {
    let newElm: number = elm.elements.findIndex(
        x => x.name == "ItemGroup" &&
            x.type == "element" &&
            x.elements &&
            x.elements.length > 0 &&
            x.elements.find(z => z.name == "PackageReference" && z.type == "element") !== undefined
    );

    return newElm;
}

function checkMoreThenOneItemGroup(elm: element): any {
    let newElm: Array<element> = elm.elements.filter(
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



// function throwIfUndefined(index: number, err: string) {
//     if (index === -1)
//         throw err;
// }



interface element {
    name: string;
    type: string;
    attributes?: any;
    elements: Array<element>;
}

interface attribute {
    Include: string;
    Version: string;
}


interface itemgroup {
    RootElement: element;
    GroupItemIndex: number;
    ProjectElement: element;
}