/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function runCheck(name, command, args) {
  return new Promise((resolve) => {
    console.log(`\n======================================================`);
    console.log(`RUNNING CHECK: ${name}`);
    console.log(`Command: ${command} ${args.join(' ')}`);
    console.log(`======================================================\n`);

    const child = spawn(command, args, {
      cwd: rootDir,
      shell: true,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      const success = code === 0;
      if (success) {
        console.log(`\n✅ ${name} PASSED`);
      } else {
        console.error(`\n❌ ${name} FAILED with exit code ${code}`);
      }
      resolve(success);
    });

    child.on('error', (err) => {
      console.error(`\n❌ Failed to start process: ${err.message}`);
      resolve(false);
    });
  });
}

async function main() {
  const checks = [
    { name: 'TypeScript Compilation check', command: 'npx', args: ['tsc', '--noEmit'] },
    { name: 'ESLint check', command: 'npm', args: ['run', 'lint'] },
    { name: 'Next.js Production Build', command: 'npx', args: ['next', 'build'] }
  ];

  const results = {};
  let anyFailed = false;

  for (const check of checks) {
    const passed = await runCheck(check.name, check.command, check.args);
    results[check.name] = passed ? 'PASSED ✅' : 'FAILED ❌';
    if (!passed) {
      anyFailed = true;
    }
  }

  console.log(`\n======================================================`);
  console.log(`INTEGRITY CHECKS SUMMARY`);
  console.log(`======================================================`);
  for (const [name, result] of Object.entries(results)) {
    console.log(`${name.padEnd(35)}: ${result}`);
  }
  console.log(`======================================================\n`);

  if (anyFailed) {
    console.error('❌ Codebase integrity checks failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('✅ All codebase integrity checks passed successfully!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error running integrity checks:', err);
  process.exit(1);
});
