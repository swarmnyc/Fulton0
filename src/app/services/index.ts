import { Service } from '../../lib';
import { Logger } from './logger';
import { OAuth2 } from './oauth';
import { MongoDB } from './mongodb';
import { RedisService } from './redis';
var serviceArray: typeof Service[] = [
    Logger,
    OAuth2,
    MongoDB,
    RedisService
]
export default serviceArray