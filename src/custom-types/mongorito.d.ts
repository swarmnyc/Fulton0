declare module "mongorito" {
    
      import { Db, Collection } from 'mongodb';
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
    
          interface IModelHooks {
            before: IModelHookCollection
            after: IModelHookCollection
          }
    
          interface IModelHookCollection {
            create: IModelHookEvent[]
            update: IModelHookEvent[]
            remove: IModelHookEvent[]
            save: IModelHookEvent[]
          }
    
          interface IModelHookEvent {
            (next: any): any
          }
    
          class Model {
            after(event: string, handlerName: string): void
            around(event: string, handlerName: string): void
            before(event: string, handlerName: string): void
            collection(): string
            constructor(o: JSONDocument, opts?: any)
            configure(): void
            toJSON(): JSONDocument
            _hooks: IModelHooks
            _collection: string
            attributes: IAttributesHash
            previous: IPreviousValueHash
            changed: IChangedValuesHash
            get: (attr?: string) => any
            set: (key: any/*string if only one*/, value?: any) => void        
            save: () => Promise<this>
            remove: () => void
            update: () => Promise<this>
            static skip(amount: number): typeof Model
            static populate(pathName: string, model: PopulationOption<typeof Model>): typeof Model
            static index(pathName: string, options?: IIndexOptions): void
            static where(attr: string, value: any): typeof Model
            static sort(attr: any, order?: number): typeof Model
            static limit(amount: number): typeof Model
            static count(query?: IQuery): Promise<number>
            static find<T extends Model>(query?: IQuery, options?: IQueryOptions): Promise<T[]>
            static all<T extends Model>(): Promise<T[]>
            static findOne<T extends Model>(query?: IQuery): Promise<T>
            static findById<T extends Model>(id: string): Promise<T>
            static update(query: IQuery, update: IUpdateObject, options?: IUpdateOptions): Promise<IResultsObject>
            static remove(query?: IQuery): Promise<IResultsObject>
            static aggregate(pipeline?: any[]): Promise<any>
          }
    
          
          const db: Db
          function connect(mongoURI: string, options?: any): void
          function disconnect(): void
      }
    
      export = mongorito;
    }