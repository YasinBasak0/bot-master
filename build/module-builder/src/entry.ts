#!/usr/bin/env node

import buildCmd from './build'
import { configure } from './log'
import packageCmd from './package'
import watchCmd from './watch'

require('yargs')
  .command('build', 'builds a qbot module', {}, argv => {
    configure(argv.verbose)
    // tslint:disable-next-line: no-floating-promises
    buildCmd(argv)
  })
  .command('watch', 'watches and rebuilds a module', {}, argv => {
    configure(argv.verbose)
    // tslint:disable-next-line: no-floating-promises
    watchCmd(argv)
  })
  .command(
    'package',
    'packages a module for distribution (.tgz)',
    {
      out: {
        alias: 'o',
        describe: 'the output location of the package',
        default: './%name%.tgz'
      }
    },
    argv => {
      configure(argv.verbose)
      // tslint:disable-next-line: no-floating-promises
      packageCmd(argv)
    }
  )
  .option('verbose', {
    alias: 'v',
    describe: 'display more info about what is being done'
  })
  .epilogue('for more information, visit https://qbot.com.tr/')
  .demandCommand(1)
  .help()
  .wrap(72).argv
