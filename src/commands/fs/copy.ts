/**
 * @license
 * Copyright (c) 2021 Alex Layton
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// @ts-expect-error shut up ts
import type { Body } from '@oada/client/dist/client.js';

import Command from '../../BaseCommand.js';
import getConn from '../../connections.js';
import { input } from '../../io.js';
import { shell } from '../../highlight.js';

const examples = [
  shell`$ oada cp /resources/foo /bookmarks/foo`,
  shell`$ oada cp /resources/foo1 /resources/foo2 /bookmarks/foo/`,
];

/**
 * OADA "copy"
 */
export default class Copy extends Command {
  static override description = 'perform an "OADA copy"';

  static override aliases = ['cp'];

  static override examples = examples;

  static override flags = {
    ...Command.flags,
  };

  static override args = [
    { name: 'paths...', required: true, description: 'path(s) to copy' },
    { name: 'path', required: true, description: 'OADA path to which to copy' },
  ];

  static override strict = false;

  async run() {
    const { argv: paths } = this.parse(Copy);
    const conn = getConn(this.iconfig);
    const path = paths.pop()!;

    // Do POST for trailing slash, o.w. PUT
    const method = path.endsWith('/') ? 'post' : 'put';

    for (const file of paths) {
      // eslint-disable-next-line no-await-in-loop, require-yield
      await input<Body>(conn, file, this.iconfig, async function* (source) {
        for await (const data of source) {
          // eslint-disable-next-line security/detect-object-injection
          await conn[method]({ path, data });
        }
      });
    }
  }
}
