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
  themes: {
    theme: {
      primary: colors.red.darken4
    }
  }
}

export default new Vuetify(opts);
