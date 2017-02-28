import { Model } from '../../app/lib';
import * as _ from 'lodash';
import * as mongorito from 'mongorito';
import * as koa from 'koa';
import * as chai from 'chai';

const { assert } = chai;

class TestModel extends Model {
    collection() {
        return 'test-items';
    }

    schema() {
        return {
            name: { type: 'string', required: true }
        }
    }
}

describe('Model', () => {
    
    it('should use the specified collection on model.collection()', async () => {
        let collections;
        let collectionNames;
        const o = new TestModel({
            name: 'dan',
            hi: true
        });

        await o.save();
        collections = await mongorito.db.collections();
        collectionNames = _.map(collections, 'collectionName');
        assert(collectionNames.indexOf('test-items') >= 0, `Expected collections to include collection "test-items". Got ${collectionNames.join(', ')}`);
        return;
    });

    it('should mount middleware hooks on model.configure()', async () => {
        let cool: boolean;
        class TestModel2 extends TestModel {

            configure() {
                super.configure();
                this.after('save', '_setCoolVariable');
            }

            protected async _setCoolVariable(next: any) {
                cool = true;
                await next;
            }
        }

        const test = new TestModel2({
            name: 'Roxy',
            face: 'yours'
        });

        await test.save();
        assert(cool === true);
        return;
    });

    it('should automatically include timestamp paths on model.timestamps() == true', async () => {
        class TestModel3 extends TestModel {
            timestamps() {
                return true;
            }
        }

        const test = new TestModel3({
            name: 'Bob'
        });

        const doc = await test.save();
        assert.instanceOf(doc.get('createdAt'), Date);
        assert.instanceOf(doc.get('updatedAt'), Date);
        return;
    });
});