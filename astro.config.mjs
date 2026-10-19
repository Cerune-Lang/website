import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { ion } from 'starlight-ion-theme';

export default defineConfig({
  site: 'https://cerune.hokutaka.dev',
  output: 'static',
  integrations: [
    starlight({
      title: 'Cerune Docs',
      description: 'Ceruneを学び、コンパイラの仕組みを探るためのガイド。',
      favicon: '/favicon.svg',
      defaultLocale: 'root',
      locales: {
        root: { label: '日本語', lang: 'ja' },
        en: { label: 'English', lang: 'en' },
      },
      social: [
        { icon: 'github', label: 'Cerune on GitHub', href: 'https://github.com/Cerune-Lang/Cerune' },
        { icon: 'external', label: 'Try Cerune in Tint', href: 'https://tint.hokutaka.dev/' },
      ],
      sidebar: [
        { label: 'はじめに', translations: { en: 'Getting Started' }, items: [{ slug: 'guide/getting-started' }] },
        { label: '言語リファレンス', translations: { en: 'Language Reference' }, items: [{ slug: 'reference/overview' }] },
        { label: 'コンパイラ内部', translations: { en: 'Compiler Internals' }, items: [{ slug: 'internals/overview' }] },
        { label: 'サンプル', translations: { en: 'Examples' }, items: [{ slug: 'examples/overview' }] },
      ],
      customCss: ['./src/styles/cerune.css'],
      plugins: [ion()],
    }),
  ],
});
