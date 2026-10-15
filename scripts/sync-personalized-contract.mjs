import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {COUNTRY_CODES} from '../supabase/functions/_shared/country-codes.mjs';

// Keep browser copies derived from the same server contract. Tests check parity.
export async function syncPersonalizedContract(){
  const root=new URL('../',import.meta.url);
  const source=await readFile(new URL('supabase/functions/_shared/personalized-fields.mjs',root),'utf8');
  const browser=source.replace("import { COUNTRY_CODES } from './country-codes.mjs';",'var COUNTRY_CODES=window.ESTNationalityCodes;').replace('export function fieldIssues','function fieldIssues');
  await writeFile(new URL('js/personalized-rules.js',root),'// Generated from personalized-fields.mjs; tested for parity.\n(function(){\n'+browser+'\nwindow.ESTPersonalizedFields={fieldIssues:fieldIssues};\n})();\n');
  await writeFile(new URL('js/nationality-codes.js',root),'// Generated from country-codes.mjs. Unicode CLDR 48; Unicode-3.0.\n// Copyright Unicode, Inc. See https://www.unicode.org/license.txt\nwindow.ESTNationalityCodes = Object.freeze('+JSON.stringify(COUNTRY_CODES)+');\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await syncPersonalizedContract();
