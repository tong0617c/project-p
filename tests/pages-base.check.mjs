import test from 'node:test';
import assert from 'node:assert/strict';
import { pagesBase } from '../scripts/pages-base.mjs';
test('local root and ordinary Pages repository', () => {
  assert.equal(pagesBase({}), '/');
  assert.equal(pagesBase({GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:'someone/project-p-mobile'}), '/project-p-mobile/');
});
test('user site and explicit custom path', () => {
  assert.equal(pagesBase({GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:'Someone/someone.github.io'}), '/');
  assert.equal(pagesBase({PAGES_BASE_PATH:'/preview/game/'}), '/preview/game/');
});
test('reject malformed and traversal paths', () => {
  for (const base of ['https://example.com/','project/','/project','/../','//','/./']) assert.throws(() => pagesBase({PAGES_BASE_PATH:base}));
  assert.throws(() => pagesBase({GITHUB_ACTIONS:'true'}));
});
