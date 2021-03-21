export interface Element {
    name: string;
    type: string;
    attributes?: any;
    elements: Element[];
}

export interface Attribute {
    Include: string;
    Version: string;
}

export interface ItemGroup {
    RootElement: Element;
    GroupItemIndex: number;
    ProjectElement: Element;
}