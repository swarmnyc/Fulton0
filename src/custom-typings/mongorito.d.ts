declare module "mongorito" {

  
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

      class Model {
        before(event: string, handlerName: string): void
        collection(): string
        constructor(o: JSONDocument)
        configure(): void
        get: (attr?: string) => Model
        set: (attr: string, value: any) => void
        toJSON: () => JSONDocument
        save: () => Model
        remove: () => void
        static index(pathName: string, options?: IIndexOptions): void
        static where(attr: string, value: any): Model
        static sort(attr: string, order: number): Model
        static count(query?: IQuery): number
        static find(query?: IQuery, options?: IQueryOptions): Model[]
        static all(): Model[]
        static findOne(query?: IQuery): Model
        static findById(id: string): Model
        static update(query: IQuery, update: IUpdateObject, options?: IUpdateOptions): IResultsObject
        static remove(query?: IQuery): IResultsObject
      }
      function connect(mongoURI: string): void
      function disconnect(): void  
  }

  export = mongorito;
}