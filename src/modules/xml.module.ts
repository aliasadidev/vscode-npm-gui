import { PackageDetail } from '../models/nuget.model';
import { Attribute, Element, ItemGroup } from '../models/project-file.model';
const convert = require('xml-js');

export function getPackages(xml: string): PackageDetail[] {
    let packageList: PackageDetail[] = [];
    let itemGroup = getItemGroupIndexResult(xml);
    if (itemGroup.ItemGroupIndex !== -1) {
        checkMoreThenOneItemGroup(itemGroup.ProjectElement);
        let selectedItemGroup: Element = itemGroup.ProjectElement.elements[itemGroup.ItemGroupIndex];
        let pacakges: Element[] = getPackageReferences(selectedItemGroup);
        packageList = pacakges.map(e => {
            let attr = (<Attribute>e.attributes);
            let result: PackageDetail = {
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
    let selectedItemGroup: Element = itemGroup.ProjectElement.elements[itemGroup.ItemGroupIndex];
    let delIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
    selectedItemGroup.elements.splice(delIndex, 1);
    if (selectedItemGroup.elements.length === 0) {
        itemGroup.ProjectElement.elements.splice(itemGroup.ItemGroupIndex, 1);
    }
    xmlResult = convert.js2xml(itemGroup.RootElement, { compact: false, spaces: 2 });
    return xmlResult;
}

export function updatePackage(xml: string, packageName: string, version: string) {
    let xmlResult: string = xml;
    let itemGroup = getItemGroupIndexResult(xml);
    let selectedItemGroup: Element = itemGroup.ProjectElement.elements[itemGroup.ItemGroupIndex];
    let packageIndex: number = getPackageReferenceIndex(selectedItemGroup, packageName);
    selectedItemGroup.elements[packageIndex].attributes["Version"] = version;
    xmlResult = convert.js2xml(itemGroup.RootElement, { compact: false, spaces: 2 });
    return xmlResult;
}

export function addPackage(xml: string, packageName: string, version: string) {
    let xmlResult: string = xml;
    let itemGroup = getItemGroupIndexResult(xml);

    if (itemGroup.ItemGroupIndex == -1) {
        itemGroup.ProjectElement.elements.push({ type: "element", name: "ItemGroup", elements: [] });
        itemGroup.ItemGroupIndex = itemGroup.ProjectElement.elements.length - 1
    }
    checkMoreThenOneItemGroup(itemGroup.ProjectElement);

    let selectedItemGroup: Element = itemGroup.ProjectElement.elements[itemGroup.ItemGroupIndex];
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



function getItemGroupIndexResult(xml: string): ItemGroup {
    let rootObj: Element = getData(xml);
    let projectIndex: number = getProjectIndex(rootObj);
    let projectElement: Element = rootObj.elements[projectIndex];
    let groupItemIndex: number = getItemGroupIndex(projectElement);
    return { RootElement: rootObj, ItemGroupIndex: groupItemIndex, ProjectElement: projectElement };
}



function getData(xml: string): any {
    return convert.xml2js(xml, { compact: false, spaces: 2 });
}


function getProjectIndex(elm: Element): number {
    let index: number = elm.elements.findIndex(x => x.name == "Project" && x.type == "element");

    return index;
}
function getPackageReferenceIndex(elm: Element, pkgName: string): number {
    let index: number = elm.elements.findIndex(x => x.name == "PackageReference" && x.type == "element" && (<Attribute>x.attributes).Include === pkgName);
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
