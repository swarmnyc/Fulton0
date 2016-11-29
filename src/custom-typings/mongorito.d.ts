declare module "mongorito" {

  import { Db } from 'mongodb';
  namespace mongorito {
    
      interface IQuery {
        [K: string]: any
      }

      interface ISortOptions {
        [K: string]: number
      }

      interface IPopulateOptions {
        [K: string]: Model
      }

      interface IQueryOptions {
        sort?: ISortOptions
        limit?: number
        skip?: number
        populate?: IPopulateOptions
      }

      interface IIndexOptions {
        unique?: boolean
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

      interface IPreviousValueHash {
        [path: string]: any
      }

      interface IChangedValuesHash {
        [path: string]: any
      }

      interface Document<T> {
        T: any
      }

      interface PopulationOption<T> {

      }

      interface IAttributesHash {
        [Key: string]: any
      }

      interface ModelConstructor {
        new (...args: any[]): Model
      }

      abstract class Model {
        after(event: string, handlerName: string): void
        around(event: string, handlerName: string): void
        before(event: string, handlerName: string): void
        collection(): string
        constructor(o: JSONDocument)
        configure(): void
        attributes: IAttributesHash
        previous: IPreviousValueHash
        changed: IChangedValuesHash
        get: (attr?: string) => any
        set: (attr: string, value: any) => void
        toJSON: () => JSONDocument
        save: () => Model
        remove: () => void
        update: () => void
        static populate(pathName: string, model: PopulationOption<typeof Model>): typeof Model
        static index(pathName: string, options?: IIndexOptions): void
        static where(attr: string, value: any): typeof Model
        static sort(attr: string, order: number): typeof Model
        static count(query?: IQuery): Promise<number>
        static find(query?: IQuery, options?: IQueryOptions): Promise<Model[]>
        static all(): Promise<Model[]>
        static findOne(query?: IQuery): Promise<Model>
        static findById(id: string): Promise<Model>
        static update(query: IQuery, update: IUpdateObject, options?: IUpdateOptions): Promise<IResultsObject>
        static remove(query?: IQuery): Promise<IResultsObject>
      }

      
      const db: Db
      function connect(mongoURI: string): void
      function disconnect(): void
  }

  export = mongorito;
}