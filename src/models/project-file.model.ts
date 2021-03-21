export interface element {
    name: string;
    type: string;
    attributes?: any;
    elements: Array<element>;
}

export interface attribute {
    Include: string;
    Version: string;
}


export interface itemgroup {
    RootElement: element;
    GroupItemIndex: number;
    ProjectElement: element;
}