import { createApp } from "vue";
import App from "./App.vue";
import "./assets/style.css"
import router from "./router";
import { createPinia } from 'pinia';
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
// import PrimeVueComponents from './plugins/primevue';
import "primeicons/primeicons.css";
import { definePreset } from "@primevue/themes";
import { indexedDBStorage } from "./utils/indexedDBStorage";
import Chip from "primevue/chip";

const app = createApp(App);

app.use(router);
// app.use(PrimeVueComponents); // Use the plugin

const pinia = createPinia();
// const installPersistedStatePlugin = createPersistedStatePlugin();
// pinia.use((context) => installPersistedStatePlugin(context));

pinia.use(
    createPersistedStatePlugin({
      storage: indexedDBStorage,
    })
);

app.use(pinia);

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        },
        formField: {
            borderRadius: '9999px',
            paddingX: '0.5rem',
            paddingY: '0.5rem',
        },
    },
    components: {
        chip: {
            paddingY: '0.2rem',
        }
    }
});

app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    },
    unstyled: false,
    pt: {
        input: {
            root: { class: 'rounded-full' }
        },
        inputtext: {
            root: { class: 'rounded-full' }
        },
        inputicon: {
            root: { class: 'rounded-full overflow-hidden' },
            input: { class: 'rounded-full' }
        },
        // Add other input components as needed
    }
});

app.mount("#app");
