import cronJob from 'node-cron'
import { removeInactiveFiles } from '../modules/files/files-service';

const job = cronJob.schedule(process.env.FILE_REMOVE_PERIOD, removeInactiveFiles, null,
  false,
  'America/Los_Angeles'
);
module.exports = job