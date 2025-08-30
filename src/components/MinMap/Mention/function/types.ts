export interface IData {
    uid: string;
    text: string
}
export interface IMinMapContent {
    data: IData;
    children: IMinMapContent[]
}

export interface IMinMap {
    _id: string;
    userId: string;
    type: string;
    title: string;
    parentId: string;
    novelId: string;
    content: IMinMapContent;
}