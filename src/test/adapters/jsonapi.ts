import { JSONAPIAdapter } from '../../app/adapters/jsonapi';
import * as chai from 'chai';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as faker from 'faker';

const { assert } = chai;

function factory() {
    return {
        id: faker.random.number(),
        name: faker.name.firstName(),
        birthdate: faker.date.past(_.random(9, 50)),
        friends: function() {
            const seed = _.random(0, 255);
            const friends: number[] = [];
            for (let i = 0; i < seed; i++) {
                friends.push(faker.random.number());
            }
            return friends;
        }()
    };
}

const jsonapiobj = {
    data: {
        attributes: {
            name: 'John Doe',
            birthdate: moment().subtract(33, 'years')
        },
        relationships: {
            friends: {
                data: [{ id: 22, type: 'users' }, { id: 43, type: 'users' }],
                links: { self: '/users/1/relationships/friends', related: '/users/1/friends' } 
            }
        },
        links: {
            self: '/users/1'            
        },
        id: 1,
        type: 'users'
    }
};

const opts = {
            idPath: 'id',
            type: 'users',
            relationships: [{ type: 'users', path: 'friends' }]
        };

describe('JSONAPIAdapter', () => {
    it('should serialiaze a plain JS object into jsonapi package', async () => {
        const plainobj = factory();
        const adapter = new JSONAPIAdapter(opts);
        const obj = adapter.serialize(plainobj);

        assert.property(obj, 'data');
        assert.equal(_.get(obj, 'data.id'), plainobj.id);
        assert.equal(_.get(obj, 'data.attributes.name'), plainobj.name);

        return;
    });

    it('should serialize an array of plain JS objects into jsonapi package', async () => {
        const adapter = new JSONAPIAdapter(opts);
        const users = _.times(_.random(1, 255), factory);
        const obj = adapter.serialize(users);
        const data = Array.isArray(obj.data) ? obj.data : [];

        assert.property(obj, 'data');
        assert.isArray(obj.data);
        assert.equal(data.length, users.length);
        assert.equal(_.get(data[0], 'attributes.name'), users[0].name);
        assert.equal(data[0].id, users[0].id);
        assert.equal(_.last(data).id, _.last(users).id);
        return;
    });

    it('should deserialize an array of serialized json api package into plain JS objects', async () => {
        const adapter = new JSONAPIAdapter(opts);
        const users = _.times(_.random(1, 255), factory);
        const jsonapi = adapter.serialize(users);
        const jsonapidata = Array.isArray(jsonapi.data) ? jsonapi.data : [];
        const plainarray = adapter.deserialize(jsonapi);
        const plaindata = Array.isArray(plainarray) ? plainarray : [];

        assert.isArray(plainarray);
        assert.equal(plaindata.length, jsonapidata.length);
        assert.equal(jsonapidata[0].id, plainarray[0].id);
        assert.equal(_.last(jsonapidata).id, _.get(_.last(plaindata), 'id'));
        return;
    });

    it('should deserialize a single serialized json api package into plain JS object', async () => {
        const adapter = new JSONAPIAdapter(opts);
        const user = factory();
        const jsonapi = adapter.serialize(user);
        const plainuser = adapter.deserialize(jsonapi);

        assert.equal(user.id, _.get(plainuser, 'id'));
        assert.equal(user.name, _.get(plainuser, 'name'));
        assert.isObject(plainuser);
        return;
    });
});