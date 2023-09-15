const config = {
  siteName: 'inula Antd',
  copyright: 'Ant Design Admin  ©2020 zuiidea',
  logoPath: '/logo.svg',
  apiPrefix: '/api/v1',
  fixedHeader: true, // sticky primary layout header

  /* Layout configuration, specify which layout to use for route. */
  layouts: [
    {
      name: 'primary',
      include: [/.*/],
      exclude: [/(\/(en|zh))*\/login/],
    },
  ],

  /* I18n configuration, `languages` and `defaultLanguage` are required currently. */
  i18n: {
    /* Countrys flags: https://www.flaticon.com/packs/countrys-flags */
    languages: [
      {
        key: 'pt-br',
        title: 'Português',
      },
      {
        key: 'en',
        title: 'English',
      },
      {
        key: 'zh',
        title: '中文',
      },
    ],
    defaultLanguage: 'en',
  },
};

export default config;
