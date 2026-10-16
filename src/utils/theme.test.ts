import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGrayscaleRgb, getThemeTokens } from './theme.ts';

test('calculateGrayscaleRgb returns white at value 0', () => {
  const result = calculateGrayscaleRgb(0);
  assert.equal(result.r, 255);
  assert.equal(result.g, 255);
  assert.equal(result.b, 255);
  assert.equal(result.hex, '#ffffff');
});

test('calculateGrayscaleRgb returns black at value 100', () => {
  const result = calculateGrayscaleRgb(100);
  assert.equal(result.r, 0);
  assert.equal(result.g, 0);
  assert.equal(result.b, 0);
  assert.equal(result.hex, '#000000');
});

test('calculateGrayscaleRgb clamps values correctly below 0 and above 100', () => {
  const belowZero = calculateGrayscaleRgb(-10);
  assert.equal(belowZero.hex, '#ffffff');

  const aboveHundred = calculateGrayscaleRgb(150);
  assert.equal(aboveHundred.hex, '#000000');
});

test('getThemeTokens provides dark mode contrast when value is over 52', () => {
  const lightTokens = getThemeTokens(20);
  assert.equal(lightTokens.isDark, false);
  assert.equal(lightTokens.textPrimary, '#302747');

  const darkTokens = getThemeTokens(80);
  assert.equal(darkTokens.isDark, true);
  assert.equal(darkTokens.textPrimary, '#F7F5FC');
});
