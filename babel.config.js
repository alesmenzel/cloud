module.exports = {
  // This configuration is only for jest
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
            useSpread: true,
            useBuiltIns: true,
          },
        ],
        '@babel/typescript',
      ],
    },
  },
};
