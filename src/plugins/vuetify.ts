import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import colors from 'vuetify/es5/util/colors';
import { VuetifyPreset } from 'vuetify/types/presets';

Vue.use(Vuetify)

const opts: VuetifyPreset = {
  icons: {
    iconfont: 'md'
  },
  options: {
    customProperties: true
  },
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: colors.red.darken4
      }
    },
    options: {
      customProperties: true
    }
  }
}

export default new Vuetify(opts);
