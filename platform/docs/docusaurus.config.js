/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('path');
const versions = require('./versions.json');

// This probably only makes sense for the beta phase, temporary
function getNextBetaVersionName() {
  const expectedPrefix = '';

  const lastReleasedVersion = versions[0];
  if (!lastReleasedVersion.includes(expectedPrefix)) {
    throw new Error(
      'this code is only meant to be used during the 2.0 beta phase.'
    );
  }
  const version = parseInt(lastReleasedVersion.replace(expectedPrefix, ''), 10);
  return `${expectedPrefix}${version + 1}`;
}

const allDocHomesPaths = [
  '/docs/',
  '/docs/next/',
  ...versions.slice(1).map(version => `/docs/${version}/`),
];

const isDev = process.env.NODE_ENV === 'development';

const isDeployPreview =
  process.env.NETLIFY && process.env.CONTEXT === 'deploy-preview';

const baseUrl = process.env.BASE_URL || '/';
const isBootstrapPreset = process.env.DOCUSAURUS_PRESET === 'bootstrap';

// Special deployment for staging locales until they get enough translations
// https://app.netlify.com/sites/docusaurus-i18n-staging
// https://docusaurus-i18n-staging.netlify.app/
const isI18nStaging = process.env.I18N_STAGING === 'true';

// const isVersioningDisabled = !!process.env.DISABLE_VERSIONING || isI18nStaging;

/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'OHIF',
  tagline: 'Build optimized websites quickly, focus on your content',
  organizationName: 'facebook',
  projectName: 'OHIF',
  baseUrl,
  baseUrlIssueBanner: true,
  url: 'https://ohif.org',
  i18n: {
    defaultLocale: 'en',
    locales: isDeployPreview
      ? // Deploy preview: keep it fast!
        ['en']
      : isI18nStaging
      ? // Staging locales: https://docusaurus-i18n-staging.netlify.app/
        ['en']
      : // Production locales
        ['en'],
  },
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  // customFields: {
  //   description:
  //     'An optimized site generator in React. Docusaurus helps you to move fast and write content. Build documentation websites, blogs, marketing pages, and more.',
  // },
  themes: ['@docusaurus/theme-live-codeblock'],
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        fromExtensions: ['html'],
        createRedirects: function(path) {
          // redirect to /docs from /docs/introduction,
          // as introduction has been made the home doc
          if (allDocHomesPaths.includes(path)) {
            return [`${path}/introduction`];
          }
        },
        // redirects: [
        // {
        //   from: ['/'],
        //   to: '/docs',
        // },
        // {
        //   from: ['/docs/support', '/docs/next/support'],
        //   to: '/community/support',
        // },
        // {
        //   from: ['/docs/team', '/docs/next/team'],
        //   to: '/community/team',
        // },
        // {
        //   from: ['/docs/resources', '/docs/next/resources'],
        //   to: '/community/resources',
        // },
        // ],
      },
    ],
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
      },
    ],
    [
      '@docusaurus/plugin-pwa',
      {
        debug: isDeployPreview,
        offlineModeActivationStrategies: [
          'appInstalled',
          'standalone',
          'queryString',
        ],
        // swRegister: false,
        // swCustom: path.resolve(__dirname, 'src/sw.js'),
        pwaHead: [
          {
            tagName: 'link',
            rel: 'icon',
            href: 'img/docusaurus.png',
          },
          {
            tagName: 'link',
            rel: 'manifest',
            href: `${baseUrl}manifest.json`,
          },
          {
            tagName: 'meta',
            name: 'theme-color',
            content: 'rgb(37, 194, 160)',
          },
          {
            tagName: 'meta',
            name: 'apple-mobile-web-app-capable',
            content: 'yes',
          },
          {
            tagName: 'meta',
            name: 'apple-mobile-web-app-status-bar-style',
            content: '#000',
          },
          {
            tagName: 'link',
            rel: 'apple-touch-icon',
            href: 'img/docusaurus.png',
          },
          {
            tagName: 'link',
            rel: 'mask-icon',
            href: 'img/docusaurus.svg',
            color: 'rgb(62, 204, 94)',
          },
          {
            tagName: 'meta',
            name: 'msapplication-TileImage',
            content: 'img/docusaurus.png',
          },
          {
            tagName: 'meta',
            name: 'msapplication-TileColor',
            content: '#000',
          },
        ],
      },
    ],
  ],
  presets: [
    [
      isBootstrapPreset
        ? '@docusaurus/preset-bootstrap'
        : '@docusaurus/preset-classic',
      {
        debug: true, // force debug plugin usage
        docs: {
          routeBasePath: '/',
          path: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: ({ locale, docPath }) => {
            if (locale !== 'en') {
              return `https://crowdin.com/project/docusaurus-v2/${locale}`;
            }
            // We want users to submit doc updates to the upstream/next version!
            // Otherwise we risk losing the update on the next release.
            const nextVersionDocsDirPath = 'docs';
            return `https://github.com/OHIF/Viewers/edit/master/website/${nextVersionDocsDirPath}/${docPath}`;
          },
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          // remarkPlugins: [
          //   [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          // ],
          // disableVersioning: isVersioningDisabled,
          // lastVersion: 'current',
          // onlyIncludeVersions:
          //   !isVersioningDisabled && (isDev || isDeployPreview)
          //     ? ['current', ...versions.slice(0, 2)]
          //     : undefined,
          // versions: {
          //   current: {
          //     // label: `${getNextBetaVersionName()} 🚧`,
          //     // label: `2.0 🎉`,
          //     label: `2.0`,
          //     // path: `2.0`,
          //   },
          // },
        },
        theme: {
          customCss: [require.resolve('./src/css/custom.css')],
        },
      },
    ],
  ],
  themeConfig: {
    liveCodeBlock: {
      playgroundPosition: 'bottom',
    },
    hideableSidebar: false,
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      // respectPrefersColorScheme: true,
    },
    // announcementBar: {
    //   id: 'v1-new-domain',
    //   content:
    //     '➡️ Docusaurus v1 documentation has moved to <a target="_blank" rel="noopener noreferrer" href="https://v1.docusaurus.io/">v1.docusaurus.io</a>! 🔄',
    // },
    /*
    announcementBar: {
      id: 'supportus',
      content:
        '⭐️ If you like Docusaurus, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/OHIF/Viewers">GitHub</a>! ⭐️',
    },
     */
    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
    },
    image: 'img/docusaurus-soc.png',
    // metadatas: [{name: 'twitter:card', content: 'summary'}],
    // gtag: {
    //   trackingID: 'UA-110573590-2',
    // },
    // algolia: {
    //   apiKey: '47ecd3b21be71c5822571b9f59e52544',
    //   indexName: 'docusaurus-2',
    //   contextualSearch: true,
    // },
    navbar: {
      hideOnScroll: false,
      logo: {
        alt: 'OHIF Logo',
        src: 'img/ohif-logo-light.svg',
        srcDark: 'img/ohif-logo.svg',
      },
      items: [
        {
          position: 'left',
          to: '/',
          activeBaseRegex: '^(/next/|/)$',
          docId: 'Introduction',
          label: 'Docs & API',
        },
        { to: 'next/userManuals/index', label: 'User Manuals', position: 'left' },
        { to: 'next/help', activeBaseRegex: '(^/help$)|(/next/help)', label: 'Help', position: 'right' },
        { to: 'https://react.ohif.org/', label: 'UI Component Library', position: 'left' },
        // {to: 'showcase', label: 'Showcase', position: 'left'},
        // right
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownActiveClassDisabled: true,
        },
        {
          type: 'localeDropdown',
          position: 'right',
          dropdownItemsAfter: [
            {
              to: 'next/viewer/internationalization#contributing-with-new-languages',
              label: 'Help Us Translate',
            },
          ],
        },
        {
          href: 'https://github.com/OHIF/Viewers',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub Repository'
        },
      ],
    },
    footer: {

      style: 'dark',
      links: [
        {
          title: 'Open Health Imaging Foundation',
          items: [
            {
              html: `
                <a href="https://viewer.ohif.org/" target="_blank" rel="noreferrer noopener" aria-label="Deploys by Netlify">
                  <img src= 'https://rally.partners.org/study/image/A3C43B37-4BE8-4950-AB00-42B19677D9D2' style="margin-right: 100px;" alt="MGH" />
                </a>
              `,
            },
          ],
        },
        {
          title: 'Learn',
          items: [
            {
              label: 'Introduction',
              to: '/',
            },
            {
              label: 'Installation',
              to: 'development/getting-started',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Feedback',
              to: 'https://community.ohif.com/',
            },
            {
              label: 'Discussion board',
              href: 'https://community.ohif.com/',
            },
            {
              label: 'Help',
              to: '/help',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/OHIF/Viewers',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/OHIFviewer',
            },
            // {
            //   html: `
            //     <a href="https://viewer.ohif.org/" target="_blank" rel="noreferrer noopener" aria-label="Deploys by Netlify">
            //       <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg" alt="Deploys by Netlify" />
            //     </a>
            //   `,
            // },
          ],
        },
      ],
      logo: {
        alt: 'OHIF ',
        src: 'img/ohif-logo.svg',
        href: 'https://ohif.org',
      },
      copyright: `OHIF is open source software released under the MIT license.`,
    },
  },
});
