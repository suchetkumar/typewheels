import {Router, RouterConfiguration} from 'aurelia-router';
import { inject } from 'aurelia-framework';
import {PLATFORM} from 'aurelia-pal';

@inject(RouterConfiguration, Router)
export class App {
  configureRouter(config, router) {
    this.router = router;
    config.title = 'TypeRacer!';
    config.map([
      { route: ['', 'home'], 
        name: 'home',       
        moduleId: PLATFORM.moduleName('pages/home'), 
        nav: true, 
        title: 'Home' },

      { route: 'play', 
      name: 'play',       
      moduleId: PLATFORM.moduleName('pages/play'), 
      nav: true, 
      title: 'Play' },
    ]);
  }
}

