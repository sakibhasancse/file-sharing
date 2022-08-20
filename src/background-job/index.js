import cronJob from 'node-cron'
import { removeInactiveFiles } from '../modules/files/files-service';

console.log("Star")
const job = cronJob.schedule('59 59 23 * * *', removeInactiveFiles);
module.exports = job