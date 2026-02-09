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
        let selectedItemGroup: Element =
            itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
        let packages: Element[] = getPackageReferences(selectedItemGroup);
        packageList = packages.map(e => {
            let attr = e.attributes;
            let result: PackageDetail = {
                packageName: attr['Include'],
                packageVersion: attr['Version'] || '',
                versionOverride: attr['VersionOverride'] || undefined,
            };
            return result;
        });
    }
    return packageList;
}

export function removePackage(
    xml: string,
    packageName: string,
    project: Project
) {
    let xmlResult: string = xml;
    let itemGroup = getItemGroupIndexResult(xml);
    checkMoreThenOneItemGroup(itemGroup.projectElement, project);
    let selectedItemGroup: Element =
        itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
    let delIndex: number = getPackageReferenceIndex(
        selectedItemGroup,
        packageName
    );

    let indexSize = 1;
    if (delIndex > 0) {
        let left = selectedItemGroup.elements[delIndex - 1]?.text;
        if (left != null && left.search(/\s+/gm) >= 0) {
            indexSize++;
            delIndex--;
        }
    }

    selectedItemGroup.elements.splice(delIndex, indexSize);

    let fullTagEmptyElement: boolean = selectedItemGroup.elements.length === 0;
    xmlResult = js2xml(itemGroup.rootElement, {
        fullTagEmptyElement: fullTagEmptyElement,
    });
    return xmlResult;
}

export function updatePackage(
    xml: string,
    packageName: string,
    version: string
) {
    let xmlResult: string = xml;
    let itemGroup = getItemGroupIndexResult(xml);
    let selectedItemGroup: Element =
        itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
    let packageIndex: number = getPackageReferenceIndex(
        selectedItemGroup,
        packageName
    );
    selectedItemGroup.elements[packageIndex].attributes['Version'] = version;
    xmlResult = js2xml(itemGroup.rootElement, {});
    return xmlResult;
}

export function addPackage(
    xml: string,
    packageName: string,
    version: string,
    project: Project
) {
    let xmlResult: string = xml;
    let itemGroup = getItemGroupIndexResult(xml);
    let isEmptyProject = false;
    if (itemGroup.itemGroupIndex == -1) {
        isEmptyProject = createNewItemGroup(itemGroup);
    }
    checkMoreThenOneItemGroup(itemGroup.projectElement, project);

    let selectedItemGroup: Element =
        itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
    let packageIndex: number = getPackageReferenceIndex(
        selectedItemGroup,
        packageName
    );
    if (packageIndex === -1) {
        let lstIndex = selectedItemGroup.elements
            .map(ele => ele.type === 'element')
            .lastIndexOf(true);

        let insertIndex = 0;
        if (lstIndex != -1) {
            insertIndex = lstIndex + 1;
            let rightText = selectedItemGroup.elements[lstIndex - 1]?.text;

            if (rightText != null && rightText.search(/\s+/gm) >= 0) {
                let space = {
                    type: 'text',
                    text: rightText,
                    name: '',
                    elements: [],
                };
                selectedItemGroup.elements = insertElement(
                    selectedItemGroup.elements,
                    insertIndex,
                    space
                );

                insertIndex++;
            }
        } else {
            insertIndex = 1;
        }

        /* eslint-disable */
        let newElement: any = {
            type: 'element',
            name: 'PackageReference',
            attributes: {
                Include: packageName,
                Version: version,
            },
        };
        /* eslint-enable */

        selectedItemGroup.elements = insertElement(
            selectedItemGroup.elements,
            insertIndex,
            newElement
        );

        if (isEmptyProject) {
            let space2 = {
                type: 'text',
                text: `${EOL}  `,
                name: '',
                elements: [],
            };

            selectedItemGroup.elements.push(space2);
        }

        xmlResult = js2xml(itemGroup.rootElement, {});
    } else {
        throw 'package already exists in project!';
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
        ...arr.slice(index),
    ];
}

function getItemGroupIndexResult(xml: string): ItemGroup {
    let rootObj: Element = xmlToObject(xml);
    let projectIndex: number = getProjectIndex(rootObj);
    let projectElement: Element = rootObj.elements[projectIndex];
    let groupItemIndex: number = getItemGroupIndex(projectElement);
    return {
        rootElement: rootObj,
        itemGroupIndex: groupItemIndex,
        projectElement: projectElement,
    };
}

function createNewItemGroup(itemGroup: ItemGroup): boolean {
    let isEmptyProject = false,
        isEmptyInlineProject = false;
    let lstIndex =
        itemGroup.projectElement.elements
            ?.map(ele => ele.type === 'element')
            ?.lastIndexOf(true) ?? -1;
    let topLeftText = null;
    if (lstIndex > 0) {
        topLeftText = itemGroup.projectElement.elements[lstIndex - 1]?.text;
    }
    if (topLeftText != null && topLeftText.search(/\s+/gm) >= 0) {
        if (topLeftText.search(/(\r\n|\n|\r)/gm) >= 0) {
            topLeftText = `${EOL}` + topLeftText.replace(/(\r\n|\n|\r)/gm, '');
        }
        itemGroup.projectElement.elements = insertElement(
            itemGroup.projectElement.elements,
            lstIndex + 1,
            {
                type: 'text',
                text: topLeftText,
                name: '',
                elements: [],
            }
        );
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
                    elements: [],
                }
            );
        } else {
            isEmptyInlineProject = true;
            itemGroup.projectElement.elements = [
                {
                    type: 'text',
                    text: `${EOL}  `,
                    name: '',
                    elements: [],
                },
            ];
        }

        lstIndex++;
    }

    itemGroup.projectElement.elements = insertElement(
        itemGroup.projectElement.elements,
        lstIndex + 1,
        {
            type: 'element',
            name: 'ItemGroup',
            elements: [],
        }
    );

    if (isEmptyInlineProject) {
        let space2 = {
            type: 'text',
            text: `${EOL}`,
            name: '',
            elements: [],
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
            elements: [],
        };
        let selectedItemGroup: Element =
            itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
        selectedItemGroup.elements.push(space);

        if (!isEmptyProject) {
            let space2 = {
                type: 'text',
                text: topLeftText,
                name: '',
                elements: [],
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
    let index: number = elm.elements.findIndex(
        x => x.name == 'Project' && x.type == 'element'
    );

    return index;
}
function getPackageReferenceIndex(elm: Element, pkgName: string): number {
    let index: number = elm.elements.findIndex(
        x =>
            x.name == 'PackageReference' &&
            x.type == 'element' &&
            x.attributes['Include'] === pkgName
    );
    return index;
}

function getPackageReferences(elm: Element): Element[] {
    let index: Element[] = elm.elements.filter(
        x => x.name == 'PackageReference' && x.type == 'element'
    );
    return index;
}

function getItemGroupIndex(elm: Element): number {
    let newElm: number = elm.elements?.findIndex(
        x =>
            x.name == 'ItemGroup' &&
            x.type == 'element' &&
            x.elements &&
            x.elements.length > 0 &&
            x.elements.find(
                z => z.name == 'PackageReference' && z.type == 'element'
            ) !== undefined
    );

    return newElm ?? -1;
}

function checkMoreThenOneItemGroup(elm: Element, project: Project): Element[] {
    let newElm: Element[] = elm.elements.filter(
        x =>
            x.name == 'ItemGroup' &&
            x.type == 'element' &&
            x.elements &&
            x.elements.length > 0 &&
            x.elements.find(
                z => z.name == 'PackageReference' && z.type == 'element'
            ) !== undefined
    );
    if (newElm && newElm.length > 1) {
        throw `More than one <ItemGroup> find. ${project.projectName} | ${project.projectPath}`;
    }
    return newElm;
}

// ======================== CPM (Central Package Management) ========================

/**
 * Check if a Directory.Packages.props XML has ManagePackageVersionsCentrally set to true
 */
export function isCpmEnabled(propsXml: string): boolean {
    try {
        const rootObj: Element = xmlToObject(propsXml);
        const projectIndex = getProjectIndex(rootObj);
        if (projectIndex === -1) { return false; }
        const projectElement: Element = rootObj.elements[projectIndex];
        if (!projectElement.elements) { return false; }

        for (const child of projectElement.elements) {
            if (child.name === 'PropertyGroup' && child.type === 'element' && child.elements) {
                for (const prop of child.elements) {
                    if (prop.name === 'ManagePackageVersionsCentrally' && prop.type === 'element') {
                        const textNode = prop.elements?.find(e => e.type === 'text');
                        if (textNode && textNode.text?.trim().toLowerCase() === 'true') {
                            return true;
                        }
                    }
                }
            }
        }
    } catch {
        // If parsing fails, not CPM-enabled
    }
    return false;
}

/**
 * Extract PackageVersion entries from a Directory.Packages.props file
 */
export function getPackageVersionsFromProps(propsXml: string): PackageDetail[] {
    let packageList: PackageDetail[] = [];
    const rootObj: Element = xmlToObject(propsXml);
    const projectIndex = getProjectIndex(rootObj);
    if (projectIndex === -1) { return packageList; }
    const projectElement: Element = rootObj.elements[projectIndex];
    if (!projectElement.elements) { return packageList; }

    for (const child of projectElement.elements) {
        if (child.name === 'ItemGroup' && child.type === 'element' && child.elements) {
            const pkgVersions = child.elements.filter(
                e => e.name === 'PackageVersion' && e.type === 'element'
            );
            for (const pv of pkgVersions) {
                packageList.push({
                    packageName: pv.attributes?.['Include'] || '',
                    packageVersion: pv.attributes?.['Version'] || '',
                });
            }
        }
    }
    return packageList;
}

/**
 * Get the index of the first ItemGroup containing PackageVersion elements in the props file
 */
function getPackageVersionItemGroupIndex(elm: Element): number {
    const idx = elm.elements?.findIndex(
        x =>
            x.name === 'ItemGroup' &&
            x.type === 'element' &&
            x.elements &&
            x.elements.length > 0 &&
            x.elements.find(z => z.name === 'PackageVersion' && z.type === 'element') !== undefined
    );
    return idx ?? -1;
}

/**
 * Get the index of a specific PackageVersion element by Include attribute
 */
function getPackageVersionIndex(elm: Element, pkgName: string): number {
    return elm.elements.findIndex(
        x =>
            x.name === 'PackageVersion' &&
            x.type === 'element' &&
            x.attributes?.['Include'] === pkgName
    );
}

/**
 * Get the parsed ItemGroup result for a props file (targeting PackageVersion items)
 */
function getPropsItemGroupResult(propsXml: string): ItemGroup {
    const rootObj: Element = xmlToObject(propsXml);
    const projectIndex = getProjectIndex(rootObj);
    const projectElement: Element = rootObj.elements[projectIndex];
    const groupItemIndex = getPackageVersionItemGroupIndex(projectElement);
    return {
        rootElement: rootObj,
        itemGroupIndex: groupItemIndex,
        projectElement: projectElement,
    };
}

/**
 * Add a PackageVersion entry to Directory.Packages.props
 */
export function addPackageVersion(
    propsXml: string,
    packageName: string,
    version: string
): string {
    let itemGroup = getPropsItemGroupResult(propsXml);

    if (itemGroup.itemGroupIndex === -1) {
        // Create a new ItemGroup for PackageVersion entries
        createNewItemGroup(itemGroup);
    }

    const selectedItemGroup: Element =
        itemGroup.projectElement.elements[itemGroup.itemGroupIndex];

    // Check if already exists
    const existingIndex = getPackageVersionIndex(selectedItemGroup, packageName);
    if (existingIndex !== -1) {
        // Already exists — update its version instead
        selectedItemGroup.elements[existingIndex].attributes['Version'] = version;
        return js2xml(itemGroup.rootElement, {});
    }

    // Find the last element-type child to insert after
    let lstIndex = selectedItemGroup.elements
        .map(ele => ele.type === 'element')
        .lastIndexOf(true);

    let insertIndex = 0;
    if (lstIndex !== -1) {
        insertIndex = lstIndex + 1;
        const rightText = selectedItemGroup.elements[lstIndex - 1]?.text;

        if (rightText != null && rightText.search(/\s+/gm) >= 0) {
            const space = {
                type: 'text',
                text: rightText,
                name: '',
                elements: [],
            };
            selectedItemGroup.elements = insertElement(
                selectedItemGroup.elements,
                insertIndex,
                space
            );
            insertIndex++;
        }
    } else {
        insertIndex = 1;
    }

    /* eslint-disable */
    const newElement: any = {
        type: 'element',
        name: 'PackageVersion',
        attributes: {
            Include: packageName,
            Version: version,
        },
    };
    /* eslint-enable */

    selectedItemGroup.elements = insertElement(
        selectedItemGroup.elements,
        insertIndex,
        newElement
    );

    return js2xml(itemGroup.rootElement, {});
}

/**
 * Update a PackageVersion entry in Directory.Packages.props
 */
export function updatePackageVersion(
    propsXml: string,
    packageName: string,
    version: string
): string {
    const itemGroup = getPropsItemGroupResult(propsXml);
    if (itemGroup.itemGroupIndex === -1) {
        throw `No <PackageVersion> entries found in Directory.Packages.props for package '${packageName}'`;
    }
    const selectedItemGroup: Element =
        itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
    const pkgIndex = getPackageVersionIndex(selectedItemGroup, packageName);
    if (pkgIndex === -1) {
        throw `Package '${packageName}' not found in Directory.Packages.props`;
    }
    selectedItemGroup.elements[pkgIndex].attributes['Version'] = version;
    return js2xml(itemGroup.rootElement, {});
}

/**
 * Remove a PackageVersion entry from Directory.Packages.props
 */
export function removePackageVersion(
    propsXml: string,
    packageName: string
): string {
    const itemGroup = getPropsItemGroupResult(propsXml);
    if (itemGroup.itemGroupIndex === -1) {
        throw `No <PackageVersion> entries found in Directory.Packages.props`;
    }
    const selectedItemGroup: Element =
        itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
    let delIndex = getPackageVersionIndex(selectedItemGroup, packageName);
    if (delIndex === -1) {
        throw `Package '${packageName}' not found in Directory.Packages.props`;
    }

    let indexSize = 1;
    if (delIndex > 0) {
        const left = selectedItemGroup.elements[delIndex - 1]?.text;
        if (left != null && left.search(/\s+/gm) >= 0) {
            indexSize++;
            delIndex--;
        }
    }

    selectedItemGroup.elements.splice(delIndex, indexSize);

    const fullTagEmptyElement: boolean = selectedItemGroup.elements.length === 0;
    return js2xml(itemGroup.rootElement, {
        fullTagEmptyElement: fullTagEmptyElement,
    });
}

/**
 * Add a PackageReference WITHOUT a Version attribute (CPM mode)
 */
export function addPackageReferenceWithoutVersion(
    xml: string,
    packageName: string,
    project: Project
): string {
    let xmlResult: string = xml;
    let itemGroup = getItemGroupIndexResult(xml);
    let isEmptyProject = false;
    if (itemGroup.itemGroupIndex === -1) {
        isEmptyProject = createNewItemGroup(itemGroup);
    }
    checkMoreThenOneItemGroup(itemGroup.projectElement, project);

    const selectedItemGroup: Element =
        itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
    const packageIndex = getPackageReferenceIndex(selectedItemGroup, packageName);
    if (packageIndex === -1) {
        let lstIndex = selectedItemGroup.elements
            .map(ele => ele.type === 'element')
            .lastIndexOf(true);

        let insertIndex = 0;
        if (lstIndex !== -1) {
            insertIndex = lstIndex + 1;
            const rightText = selectedItemGroup.elements[lstIndex - 1]?.text;

            if (rightText != null && rightText.search(/\s+/gm) >= 0) {
                const space = {
                    type: 'text',
                    text: rightText,
                    name: '',
                    elements: [],
                };
                selectedItemGroup.elements = insertElement(
                    selectedItemGroup.elements,
                    insertIndex,
                    space
                );
                insertIndex++;
            }
        } else {
            insertIndex = 1;
        }

        /* eslint-disable */
        const newElement: any = {
            type: 'element',
            name: 'PackageReference',
            attributes: {
                Include: packageName,
            },
        };
        /* eslint-enable */

        selectedItemGroup.elements = insertElement(
            selectedItemGroup.elements,
            insertIndex,
            newElement
        );

        if (isEmptyProject) {
            const space2 = {
                type: 'text',
                text: `${EOL}  `,
                name: '',
                elements: [],
            };
            selectedItemGroup.elements.push(space2);
        }

        xmlResult = js2xml(itemGroup.rootElement, {});
    } else {
        throw 'package already exists in project!';
    }
    return xmlResult;
}

/**
 * Set or update the VersionOverride attribute on a PackageReference
 */
export function setVersionOverride(
    xml: string,
    packageName: string,
    version: string
): string {
    const itemGroup = getItemGroupIndexResult(xml);
    const selectedItemGroup: Element =
        itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
    const packageIndex = getPackageReferenceIndex(selectedItemGroup, packageName);
    if (packageIndex === -1) {
        throw `Package '${packageName}' not found in project file`;
    }
    selectedItemGroup.elements[packageIndex].attributes['VersionOverride'] = version;
    return js2xml(itemGroup.rootElement, {});
}

/**
 * Remove the VersionOverride attribute from a PackageReference
 */
export function removeVersionOverride(
    xml: string,
    packageName: string
): string {
    const itemGroup = getItemGroupIndexResult(xml);
    const selectedItemGroup: Element =
        itemGroup.projectElement.elements[itemGroup.itemGroupIndex];
    const packageIndex = getPackageReferenceIndex(selectedItemGroup, packageName);
    if (packageIndex === -1) {
        throw `Package '${packageName}' not found in project file`;
    }
    delete selectedItemGroup.elements[packageIndex].attributes['VersionOverride'];
    return js2xml(itemGroup.rootElement, {});
}
