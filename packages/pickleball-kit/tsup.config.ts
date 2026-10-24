import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'ui/index': 'src/ui/index.ts',
    'design-tokens/index': 'src/design-tokens/index.ts',
    'sdk/index': 'src/sdk/index.ts',
    'graphql/index': 'src/graphql/index.ts',
    'types/index': 'src/types/index.ts',
    'schemas/index': 'src/schemas/index.ts',
    'utils/index': 'src/utils/index.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  external: ['react', 'react-dom']
});
