//Core
import express from 'express';

//Instruments
import { get, post } from './route';
import { getByHash, updateByHash, removeByHash } from './hash';

export const router = express.Router();

router.get('/', get);
router.post('/', post);

router.get('/:userHash', getByHash);
router.put('/:userHash', updateByHash);
router.delete('/:userHash', removeByHash);

export { router as users };
