import { RequiredError, ValidationError, UniqueError } from '../../app/lib/schema-error';
import { Model, Schema } from '../../app/lib';
import * as chai from 'chai';

const { assert } = chai;

class TestModel extends Model {}

describe('Schema', () => {
  it('should remove paths not specified in the schema from the model', async () => {
    const def = {
      name: { type: 'string' }
    };
    const schema = new Schema(def, TestModel);
    const test = new TestModel({
        name: 'Jimmy',
        favoriteNumber: 55
    });

    await schema.validate(test);      
    assert.isUndefined(test.get('favoriteNumber'));
    return;
  });

  it('should enforce required paths in schema on save', async () => {
    const schema = new Schema({
      name: { type: 'string', required: true }
    }, TestModel);
    const test = new TestModel({
        blah: 25
    });
    let result: any;

    try {
        result = await schema.validate(test);
    } catch(e) {
        result = e;
    } finally {
        assert.instanceOf(result, RequiredError);
        return;
    }
  });

  it('should enforce unique paths in schema on save', async () => {
    class TestModel4 extends Model {
      collection() {
          return 'test-items-4';
      }

      static schema() {
          return {
              nickname: { type: 'string', unique: true }
          };
      }
    }
    const schema = new Schema({ nickname: { type: 'string', unique: true }}, TestModel4);

    let test1: TestModel4;
    let test2: TestModel4;
    let result: any;

    await TestModel4.remove({});

    test1 = new TestModel4({
        nickname: 'ted'
    });

    test2 = new TestModel4({
        nickname: 'ted'
    });

    await test1.save();

    try {
        result = await schema.validate(test2);
    } catch(e) {
        result = e;
    } finally {
        assert.instanceOf(result, UniqueError);
        return;
    }
  });

    it('should enforce typecasting on schema paths on save', async () => {
      const schema = new Schema({
        name: { type: 'string' }
      }, TestModel);
      const test = new TestModel({
          name: 4
      });
      let result: any;

      try {
          result = await schema.validate(test);
      } catch(e) {
          result = e;
      } finally {
          assert.instanceOf(result, TypeError);
          return;
      }
  });

  it ('should enforce typecasting on invalid date objects', async () => {
      const schema = new Schema({
        name: { type: 'string' },
        birthdate: { type: 'date' }
      }, TestModel);
      const test = new TestModel({
          name: 'Brad',
          birthdate: 22
      });
      let result: any;

      try {
          result = await schema.validate(test);
      } catch(e) {
          result = e;
      } finally {
          assert.instanceOf(result, TypeError);
          return;
      }
  });

  it('should throw TypeError when setting objectId path to invalid objectId', async () => {
    class Friend extends Model {
        collection() {
            return 'friends';
        }
    }
    const schema = new Schema({
        name: { type: 'string' },
        friend: { type: 'ObjectId', ref: Friend }
    }, TestModel);
    const test = new TestModel({
        name: 'Brad',
        friend: 'afjklasdfkljds'
    });
    let result: any;

    try {
        result = await schema.validate(test);
    } catch(e) {
        result = e;
    } finally {
        assert.instanceOf(result, TypeError);
        return;
    }
  });

  it('should not throw TypeError when assigning another model to an objectId path', async () => {
      class Friend extends Model {
          collection() {
              return 'friends';
          }

          schema() {
              return {
                  name: { type: 'string', required: true }
              };
          }
      }
      const schema = new Schema({
          name: { type: 'string' },
          friend: { type: 'ObjectId', ref: Friend }
      }, TestModel);
      let friend = new Friend({ name: 'Dan' });
      let test: TestModel;
      let result: any;

      await friend.save();
      test = new TestModel({
          name: 'Brad',
          friend: friend
      });

      try {
          result = await schema.validate(test);
      } catch(e) {
          result = e;
      } finally {
          assert.instanceOf(result, TestModel);
          assert.equal(result.get('friend').toString(), friend.get('_id').toString());
          return;
      }
  });
});