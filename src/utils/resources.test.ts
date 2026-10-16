import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAcademicResources, INITIAL_RESOURCES } from './resources.ts';

test('filterAcademicResources filters correctly by subject', () => {
  const csResources = filterAcademicResources(INITIAL_RESOURCES, '', 'Computer Science');
  assert.ok(csResources.length > 0);
  assert.ok(csResources.every((r) => r.subject === 'Computer Science'));
});

test('filterAcademicResources searches by keyword across title, topics, and author', () => {
  const treeResults = filterAcademicResources(INITIAL_RESOURCES, 'Binary Trees');
  assert.equal(treeResults.length, 1);
  assert.equal(treeResults[0].id, 'res-1');

  const mathResults = filterAcademicResources(INITIAL_RESOURCES, 'calculus');
  assert.ok(mathResults.length >= 1);
  assert.equal(mathResults[0].subject, 'Mathematics');
});

test('filterAcademicResources handles combined subject and format filter', () => {
  const filtered = filterAcademicResources(INITIAL_RESOURCES, '', 'Computer Science', 'PDF');
  assert.ok(filtered.length >= 1);
  assert.equal(filtered[0].subject, 'Computer Science');
  assert.equal(filtered[0].format, 'PDF');
});
