declare module "mongorito" {
  interface IQuery {
    [K: string]: any
  }

  interface JSONDocument {
    [K: string]: any
  }

  interface IResultsObject {
    [K: string]: any
  }

  interface IUpdateObject {
    [K: string]: any
  }

  interface IUpdateOptions {
    multi: boolean
    upsert: boolean
  }

  export class Model {
    collection(): string
    constructor(o: JSONDocument)
    get: (attr?: string) => Model
    set: (attr: string, value: any) => void
    toJSON: () => JSONDocument
    save: () => Model
    remove: () => void
    where(attr: string, value: string): Model
    sort(attr: string, order: number): Model
    count(query?: IQuery): number
    static find(query?: IQuery): Model[]
    static all(): Model[]
    static findOne(query?: IQuery): Model
    static findById(id: string): Model
    static update(query: IQuery, update: IUpdateObject, options?: IUpdateOptions): IResultsObject
    static remove(query?: IQuery): IResultsObject
  }

  function connect(mongoURI: string): void
  function disconnect(): void
}
