/*
 * test/lib.cjs — 검증 스크립트 공용 유틸 (외부 의존성 없음)
 *
 * 이 프로젝트의 검증 스크립트는 두 가지 방식을 함께 쓴다.
 *   1) 데이터 모듈을 실제로 import 해서 값으로 검사한다 (src/data/*.js 는 순수 ESM 이다)
 *   2) 소스 텍스트를 읽어 금지 표현 / 필수 표현을 검사한다 (JSX 는 실행하지 않는다)
 */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.join(__dirname, "..");

let passed = 0;
const failures = [];

function ok(name) {
  passed += 1;
  process.stdout.write(`  ok   ${name}\n`);
}

function fail(name, detail) {
  failures.push({ name, detail });
  process.stdout.write(`  FAIL ${name}\n       ${detail}\n`);
}

/* 조건이 참이어야 한다 */
function check(name, condition, detail) {
  if (condition) ok(name);
  else fail(name, detail || "조건이 거짓입니다");
}

/* 값이 같아야 한다 */
function equal(name, actual, expected) {
  if (actual === expected) ok(name);
  else fail(name, `기대 ${JSON.stringify(expected)} · 실제 ${JSON.stringify(actual)}`);
}

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

/* 확장자로 소스 파일 목록을 모은다 */
function walk(rel, exts) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const childRel = path.posix.join(rel, entry.name);
    if (entry.isDirectory()) out.push(...walk(childRel, exts));
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(childRel);
  }
  return out;
}

/* src/data 의 ESM 모듈을 실제로 불러온다 */
function load(rel) {
  return import(pathToFileURL(path.join(ROOT, rel)).href);
}

function section(title) {
  process.stdout.write(`\n${title}\n`);
}

function report(suite) {
  process.stdout.write(`\n${suite}: ${passed}개 통과, ${failures.length}개 실패\n`);
  if (failures.length) {
    process.exitCode = 1;
    return false;
  }
  return true;
}

module.exports = { ROOT, ok, fail, check, equal, readFile, exists, walk, load, section, report };
