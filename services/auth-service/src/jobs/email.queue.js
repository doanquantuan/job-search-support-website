import { Queue } from 'bullmq';
import redis from '../../../user-service/src/config/redis.js';

export const emailQueue = new Queue('email', {
    connection: redis
});

export default { emailQueue };
