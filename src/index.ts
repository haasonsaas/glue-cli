#!/usr/bin/env node

import { run } from '@oclif/core';

export async function main() {
  await run();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});