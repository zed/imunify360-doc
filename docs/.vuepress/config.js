const urls = require("./urls-mapping.js");
const sidebarUrls = require("./sidebar-urls");
const _slugify = require('vuepress/lib/markdown/slugify');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js'
      }
    }
  },
  base: "/",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
  ],
  locales: {
    // The key is the path for the locale to be nested under.
    // As a special case, the default locale can use '/' as its path.
    "/": {
      lang: "en-US", // this will be set as the lang attribute on <html>
      title: "Documentation",
      description: "Imunify360 documentation"
    },
    "/ru/": {
      lang: "ru",
      title: "Документация",
      description: "Документация Imunify360"
    }
  },
  theme: "cloudlinux",
  // theme: '/Users/prefer/src/cloudlinux-doc-theme', // local path
  markdown: {
      slugify: (s) => {
        if (sidebarUrls[s]) {
          return sidebarUrls[s];
        }
        return _slugify(s);
      }
  },

  themeConfig: {
    repo: "cloudlinux/imunify360-doc",
    editLinks: true,
    docsBranch: "dev",
    docsDir: "docs",

    translationSource: 'docs.imunify360.com',
    defaultURL: "/introduction/",
    redirectionMapping: urls,
    sidebarDepth: 2,
    logo: "/logo.svg",
    try_free: "https://www.imunify360.com/trial",
    social: [
      { url: "https://www.facebook.com/imunify360/", logo: "/fb.png" },
      { url: "https://twitter.com/imunify360/", logo: "/tw.png" },
      { url: "https://linkedin.com/company/cloudlinux", logo: "/in.png" },
      {
        url: "https://www.youtube.com/channel/UCcW6dDJjcy41c7Hl_5LdLZQ",
        logo: "/ytube.png"
      }
    ],
    cloudlinuxSite: "https://cloudlinux.com",
    locales: {
      "/": {
        // text for the language dropdown title
        title: "Language",
        // text for the language dropdown
        selectText: "En",
        // label for this locale in the language dropdown
        label: "English",
        // text for the edit-on-github link
        editLinkText: "Edit this page",
        tryFree: "Try Free",
        search: "Search",
        // config for Service Worker
        serviceWorker: {
          updatePopup: {
            message: "New content is available.",
            buttonText: "Refresh"
          }
        },
        algolia: {
          apiKey: '29339fdc91169afd5a7dd2a0a9bba6d2',
          indexName: 'imunify360',
          appId: 'C6CXTFLPAJ'
        },
        stayInTouch: "Stay in touch",
        bottomLinks: [
            {
                text: "How to",
                url: "https://cloudlinux.zendesk.com/hc/sections/115001344329-How-do-I"
            },
            {
                text: "Getting started",
                url: "https://imunify360.com/getting-started"
            },
            {
                text: "Contact support",
                url: "https://cloudlinux.zendesk.com/hc/en-us/requests/new"
            },
            { text: "Blog", url: "https://www.imunify360.com/blog" }
        ],
        sidebar: [
          {
            title: "Contents",
            collapsable: false,
            children: [
              "/introduction/",
              "/terminology/",
              "/billing/",
              "/installation/",
              "/stand_alone/",
              "/ids_integration/",
              "/webshield/",
              "/backup_providers_integration/",
              "/firewall_config/",
              "/localization/",
              "/dashboard/",
              "/hosting_panels_specific_settin/",
              "/config_file_description/",
              "/features/",
              "/hooks/",
              "/command_line_interface/",
              "/uninstall/",
              "/faq_and_known_issues/",
              "/whmcs_plugin/"
            ]
          }
        ]
      },
      "/ru/": {
        title: "Язык",
        selectText: "Рус",
        label: "Русский",
        editLinkText: "Редактировать",
        tryFree: "Попробовать бесплатно",
        search: "Поиск",
        serviceWorker: {
          updatePopup: {
            message: "Доступен новый контент",
            buttonText: "Обновить"
          }
        },
        algolia: {
          apiKey: '29339fdc91169afd5a7dd2a0a9bba6d2',
          indexName: 'imunify360-ru',
          appId: 'C6CXTFLPAJ'
        },
        stayInTouch: "Будем на связи",
        bottomLinks: [
            {
                text: "Инструкции",
                url: "https://cloudlinux.zendesk.com/hc/sections/115001344329-How-do-I"
            },
            {
                text: "С чего начать",
                url: "https://imunify360.com/getting-started"
            },
            {
                text: "Техподдержка",
                url: "https://cloudlinux.zendesk.com/hc/en-us/requests/new"
            },
            { text: "Блог", url: "https://www.imunify360.com/blog" }
        ],
        sidebar: [
          {
            title: "Содержание",
            collapsable: false,
            children: [
              "/ru/introduction/",
              "/ru/terminology/",
              "/ru/billing/",
              "/ru/installation/",
              "/ru/stand_alone/",
              "/ru/ids_integration/",
              "/ru/webshield/",
              "/ru/backup_providers_integration/",
              "/ru/firewall_config/",
              "/ru/localization/",
              "/ru/dashboard/",
              "/ru/hosting_panels_specific_settin/",
              "/ru/config_file_description/",
              "/ru/features/",
              "/ru/hooks/",
              "/ru/command_line_interface/",
              "/ru/uninstall/",
              "/ru/faq_and_known_issues/",
              "/ru/whmcs_plugin/"
            ]
          }
        ]
      }
    }
  }
};
