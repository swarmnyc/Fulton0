export interface IQueryObject {
  [K: string]: any
}

export interface IResultObject {
  [K: string]: any
}

export interface IUpdateObject {
  [K: string]: any
}

export interface IModel {
  constructor(o: IQueryObject): Promise<IResultObject>
  find(query?: IQueryObject): Promise<IResultObject[]>
  findOne(query?: IQueryObject): Promise<IResultObject>
  findById(id: any): Promise<IResultObject>
  remove(query: IQueryObject): Promise<IResultObject>
  update(query: IQueryObject, update: IUpdateObject): Promise<IResultObject>
  save(): Promise<IResultObject>
}

export default IModel