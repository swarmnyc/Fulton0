import { EventEmitter } from 'events';

export class Authorizer extends EventEmitter {

    private authorize = async function() {

    }


    public auth = () => {
        const authorize = this.authorize;
        return authorize;
    }
}

export default Authorizer