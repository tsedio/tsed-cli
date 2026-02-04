// https://vitepress.dev/guide/custom-theme
import "./style.css";

import {DefaultTheme} from "@tsed/vitepress-theme";
import HomeBanner from "@tsed/vitepress-theme/organisms/home/HomeBanner.vue";
import HomeBeforeFeatures from "@tsed/vitepress-theme/organisms/home/HomeBeforeFeatures.vue";
import HomeBody from "@tsed/vitepress-theme/organisms/home/HomeBody.vue";
import HomeTabsTerminal from "@tsed/vitepress-theme/organisms/home/terminal/HomeTabsTerminal.vue";
import HomeTabTerminalBun from "@tsed/vitepress-theme/organisms/home/terminal/HomeTabTerminalBun.vue";
import HomeTabTerminalNpm from "@tsed/vitepress-theme/organisms/home/terminal/HomeTabTerminalNpm.vue";
import HomeTabTerminalPnpm from "@tsed/vitepress-theme/organisms/home/terminal/HomeTabTerminalPnpm.vue";
import HomeTabTerminalYarn from "@tsed/vitepress-theme/organisms/home/terminal/HomeTabTerminalYarn.vue";
import type {Theme} from "vitepress";
import {h} from "vue";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      "home-hero-image": () =>
        h(HomeBanner, null, {
          default: () =>
            h(HomeTabsTerminal, null, {
              npm: () => h(HomeTabTerminalNpm),
              yarn: () => h(HomeTabTerminalYarn),
              pnpm: () => h(HomeTabTerminalPnpm),
              bun: () => h(HomeTabTerminalBun)
            })
        }),
      "home-features-before": () => h(HomeBeforeFeatures),
      "home-features-after": () => h(HomeBody)
    });
  }
} satisfies Theme;
