import { queryHelper } from '../../app/helpers/query';
import { Model } from '../../app/lib';
import * as mongorito from 'mongorito';
import * as faker from 'faker';
import * as _ from 'lodash';
import * as chai from 'chai';

const { assert } = chai;

describe('Query Helper', () => {
    class QueryHelperTest extends Model {
        collection() {
            return 'query-helper-tests';
        }

        timestamps() {
            return true;
        }

        schema() {
            return {
                name: { type: 'string', required: true, unique: true },
                birthdate: { type: 'date' },
                location: { type: 'any', index: true, indexType: '2dsphere' }
            };
        }
    }

    function factory() {
        return {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            birthdate: faker.date.past(_.random(1, 99)),
            location: [faker.address.latitude(), faker.address.longitude()],
            email: faker.internet.email()
        };
    }

    let data: QueryHelperTest[] = [];
    const totalTestRecords = 100;

    before(async () => {
        await mongorito.connect('mongodb://localhost:27017/spec-tests');
        await mongorito.db.dropDatabase();
        let items = _.times(totalTestRecords, factory);

        for (let item of items) {
            let m = await new QueryHelperTest(item);
            m = await m.save();
            data.push(m);
        }

        return;
    });

    it('should return a query object that can be passed into a find operation', async () => {
        const sample = _.sample(data);
        const query = { "filter[name]": sample.get('name') };        
        const results = await queryHelper(QueryHelperTest, query);

        assert.isTrue(results.length > 0);
        assert.equal(_.sample(results).get('name'), sample.get('name'));
        return;
    });

    it('should return a sorted set of results', async () => {
        const query = { sort: '-name' };
        const results = await queryHelper(QueryHelperTest, query);
        const sortedData = _.chain(data).invokeMap('toJSON').sortBy('name').reverse().value();
        
        assert.equal(results.length, data.length);
        assert.isTrue(_.head(sortedData)['_id'].equals(_.head(results).get('_id')));   
        assert.isTrue(_.last(sortedData)['_id'].equals(_.last(results).get('_id')));        
        return;
    });

    it('should return a limited result set', async () => {
        const query = { limit: 20 };
        const results = await queryHelper(QueryHelperTest, query);

        assert.equal(results.length, 20);
        return;
    });

    it('should skip the specified number of records', async() => {
        const query = { skip: 20, sort: '-createdAt', limit: 15 };
        const results = await queryHelper(QueryHelperTest, query);
        const sortedData = _.chain(data).invokeMap('toJSON').sortBy('createdAt').reverse().value();

        assert.equal(results.length, 15);
        assert.notEqual(results[0].get('_id').toString(), sortedData[0]['_id'].toString());
        assert.equal(results[0].get('_id').toString(), sortedData[20]['_id'].toString());
        return;
    });
});