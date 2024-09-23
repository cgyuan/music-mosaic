import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import Card from 'primevue/card';

export default {
  install: (app: any) => {
    app.component('Button', Button);
    app.component('InputText', InputText);
    app.component('Menu', Menu);
    app.component('Card', Card);
  }
}
