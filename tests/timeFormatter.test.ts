import assert from 'assert';
import { formatTime } from '../src/models/timeFormatter';

// Basic cases
assert.strictEqual(formatTime(0), '0:00');
assert.strictEqual(formatTime(59), '0:59');
assert.strictEqual(formatTime(60), '1:00');
assert.strictEqual(formatTime(3599), '59:59');
assert.strictEqual(formatTime(3600), '1:00:00');

console.log('All tests passed');
