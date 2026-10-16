import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAcademicResources } from './resources.ts';
import type { AcademicResource } from '../types/index.ts';

const TEST_RESOURCES: AcademicResource[] = [
  {
    id: 'test-1',
    title: 'Data Structures with Binary Trees',
    subject: 'Computer Science',
    format: 'PDF',
    author: 'Test Author',
    readsCount: 10,
    rating: 5,
    summary: 'Trees and hashing algorithms',
    topics: ['Binary Trees', 'Hashing'],
    isPublic: true,
    dateAdded: '2026-10-01',
  },
  {
    id: 'test-2',
    title: 'Calculus Formulas',
    subject: 'Mathematics',
    format: 'Notes',
    author: 'Math Instructor',
    readsCount: 20,
    rating: 4.8,
    summary: 'Derivatives and integrals',
    topics: ['Calculus', 'Derivatives'],
    isPublic: true,
    dateAdded: '2026-10-02',
  },
];

test('filterAcademicResources filters correctly by subject', () => {
  const csResources = filterAcademicResources(TEST_RESOURCES, '', 'Computer Science');
  assert.equal(csResources.length, 1);
  assert.equal(csResources[0].subject, 'Computer Science');
});

test('filterAcademicResources searches by keyword across title, topics, and author', () => {
  const treeResults = filterAcademicResources(TEST_RESOURCES, 'Binary Trees');
  assert.equal(treeResults.length, 1);
  assert.equal(treeResults[0].id, 'test-1');

  const mathResults = filterAcademicResources(TEST_RESOURCES, 'calculus');
  assert.equal(mathResults.length, 1);
  assert.equal(mathResults[0].subject, 'Mathematics');
});

test('filterAcademicResources handles combined subject and format filter', () => {
  const filtered = filterAcademicResources(TEST_RESOURCES, '', 'Computer Science', 'PDF');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].subject, 'Computer Science');
  assert.equal(filtered[0].format, 'PDF');
});
