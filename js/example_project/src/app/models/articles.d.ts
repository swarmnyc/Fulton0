import { Model } from 'fulton';
import { ISchemaDefinition } from 'fulton';
export declare class Article extends Model {
    collection(): string;
    concurrencyControl(): boolean;
    schema(): ISchemaDefinition;
}
export default Article;
