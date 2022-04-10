import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import GSAP from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Splide } from '@splidejs/splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import { Rellax } from 'rellax';
import { Pie } from '@antv/g2plot';
import GLightbox from 'glightbox';
declare const imagesLoaded: any;
declare const niceScroll: any;
declare const $: any;
declare const WOW: any;
import {
  vertexShader,
  fragmentShader,
  faqData,
} from '../constant/constant.const';
GSAP.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  faq = faqData;
  element: any;
  elements: any;
  viewport: any;
  mouse: any;
  scroll: any;
  settings: any;
  scene: any;
  renderer: any;
  canvas: any;
  camera: any;
  clock: any;
  smoothScroll: any;
  // updateScrollAnimations: any;
  // update: any;
  geometry: any;
  material: any;
  mesh: any;
  animations: any;
  showSidebar: boolean = false;
  imagesLoaded = false;
  constructor() {
    this.viewport = {
      width: $('body').width(),
      height: $('body').height(),
    };
    this.mouse = {
      x: 0,
      y: 0,
    };

    this.scroll = {
      height: 0,
      limit: 0,
      hard: 0,
      soft: 0,
      ease: 0.05,
      normalized: 0,
      running: false,
    };

    this.settings = {
      // vertex
      uFrequency: {
        start: 0,
        end: 0,
      },
      uAmplitude: {
        start: 0,
        end: 0,
      },
      uDensity: {
        start: 0,
        end: 0,
      },
      uStrength: {
        start: 0,
        end: 0,
      },
      // fragment
      uDeepPurple: {
        // max 1
        start: 1,
        end: 0,
      },
      uOpacity: {
        // max 1
        start: 0.5,
        end: 0.66,
      },
    };
    GSAP.defaults({
      ease: 'power2',
      duration: 6.6,
      overwrite: true,
    });
  }

  ngOnInit(): void {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    this.canvas = this.renderer.domElement;

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.viewport.width / this.viewport.height,
      0.1,
      10
    );

    this.clock = new THREE.Clock();
  }

  ngAfterViewInit(): void {
    this.element = document.querySelector('.content');
    // this.smoothScroll = new SmoothScroll({
    //   element: this.element,
    //   viewport: this.viewport,
    //   scroll: this.scroll,
    // });
    this.init();
    new WOW().init();
    this.onResize();
  }

  handleShowSidebar() {
    const bodyElement = document.getElementsByTagName('body')[0];
    this.showSidebar = !this.showSidebar;
    if (this.showSidebar && bodyElement) {
      bodyElement.classList.add('overflow-hidden');
    }
    if (!this.showSidebar && bodyElement) {
      bodyElement.classList.remove('overflow-hidden');
    }
  }

  init() {
    this.addCanvas();
    this.addCamera();
    this.addMesh();
    this.addEventListeners();
    this.onResize();
    this.handleUpdate();
    this.handleWorkSlider();
    this.handleChart();
    this.initialGiveawaySlider();
    this.handleAccordion();
    this.handleCustomCursor();
    this.handleImagesLoaded();
    // this.handleGiveawayLightBox();
    // this.initialParallaxObject();
  }

  handleImagesLoaded() {
    imagesLoaded(document.querySelector('#main-wrapper'), (instance: any) => {
      this.imagesLoaded = true;
    });
  }

  handleGiveawayLightBox() {
    const lightbox = GLightbox({
      selector: '.giveawayLightBox',
      touchNavigation: true,
      loop: true,
    });
  }

  addCanvas() {
    this.canvas.classList.add('webgl');
    document.body.appendChild(this.canvas);
  }

  addCamera() {
    this.camera.position.set(0, 0, 2.5);
    this.scene.add(this.camera);
  }
  addMesh() {
    this.geometry = new THREE.IcosahedronGeometry(1, 64);

    this.material = new THREE.ShaderMaterial({
      wireframe: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      vertexShader,
      fragmentShader,
      uniforms: {
        uFrequency: { value: this.settings.uFrequency.start },
        uAmplitude: { value: this.settings.uAmplitude.start },
        uDensity: { value: this.settings.uDensity.start },
        uStrength: { value: this.settings.uStrength.start },
        uDeepPurple: { value: this.settings.uDeepPurple.start },
        uOpacity: { value: this.settings.uOpacity.start },
      },
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.mesh);
  }
  handleUpdateScrollAnimations() {
    this.scroll.running = false;
    this.scroll.normalized = (this.scroll.hard / this.scroll.limit).toFixed(1);

    GSAP.to(this.mesh.rotation, {
      x: this.scroll.normalized * Math.PI,
    });
  }

  addEventListeners() {
    window.addEventListener('load', this.onLoad.bind(this));

    // window.addEventListener('scroll', this.onScroll.bind(this));

    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onLoad() {
    document.body.classList.remove('loading');
    this.animations = new Animations(this.element, this.camera);
    this.onResize();
  }

  onMouseMove(event) {
    //@ts-ignore
    this.mouse.x = (event.clientX / this.viewport.width).toFixed(2) * 1.2;
    //@ts-ignore
    this.mouse.y = (event.clientY / this.viewport.height).toFixed(2) * 2;

    GSAP.to(this.mesh.material.uniforms.uFrequency, { value: this.mouse.x });
    GSAP.to(this.mesh.material.uniforms.uAmplitude, { value: this.mouse.x });
    GSAP.to(this.mesh.material.uniforms.uDeepPurple, { value: this.mouse.x });
    GSAP.to(this.mesh.material.uniforms.uDensity, { value: this.mouse.x });
    GSAP.to(this.mesh.material.uniforms.uStrength, { value: this.mouse.x });
    // GSAP.to(this.mesh.material.uniforms.uOpacity, { value: this.mouse.x });
  }

  onScroll() {
    if (!this.scroll.running) {
      window.requestAnimationFrame(() => {
        this.handleUpdateScrollAnimations();
      });

      this.scroll.running = true;
    }
  }

  onResize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // this.smoothScroll.onResize();

    if (this.viewport.width < this.viewport.height) {
      this.mesh.scale.set(0.75, 0.75, 0.75);
    } else {
      this.mesh.scale.set(1, 1, 1);
    }

    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.viewport.width, this.viewport.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }

  handleUpdate() {
    const elapsedTime = this.clock?.getElapsedTime();
    this.mesh.rotation.y = elapsedTime * 0.05;

    // this.smoothScroll.update();

    this.render();

    window.requestAnimationFrame(() => {
      this.handleUpdate();
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  initialGiveawaySlider() {
    const giveawaySlider = new Splide('.giveaway__slider', {
      type: 'loop',
      lazyLoad: true,
      gap: 24,
      perPage: 1,
      pagination: true,
      autoplay: true,
      interval: 5000,
      speed: 3000,
      breakpoints: {
        768: {
          gap: 16,
          padding: '1rem',
        },
      },
    }).mount();
  }

  handleAccordion() {
    const accordionItem = document.querySelectorAll('.main-accordion-item');
    const heading = document.querySelectorAll('.main-accordion-header');
    heading.forEach((element) => {
      element.addEventListener('click', toggleItem);
    });
    function toggleItem() {
      const itemClass = this.parentNode.className;
      accordionItem.forEach((item) => {
        item.className = 'main-accordion-item close';
      });
      if (itemClass == 'main-accordion-item close') {
        this.parentNode.className = 'main-accordion-item open';
      }
    }
  }

  handleWorkSlider() {
    new Splide('.work__slider__first', {
      perPage: 7,
      type: 'loop',
      drag: 'free',
      focus: 'center',
      pagination: false,
      lazyLoad: true,
      gap: 8,
      autoScroll: {
        speed: 1,
      },
      breakpoints: {
        768: {
          perPage: 3,
        },
      },
    }).mount({
      AutoScroll,
    });
    new Splide('.work__slider__second', {
      perPage: 7,
      type: 'loop',
      drag: 'free',
      focus: 'center',
      pagination: false,
      lazyLoad: true,
      direction: 'rtl',
      gap: 8,
      autoScroll: {
        speed: 1,
      },
      breakpoints: {
        768: {
          perPage: 3,
        },
      },
    }).mount({
      AutoScroll,
    });
  }

  initialParallaxObject() {
    const rellax = new Rellax('.fix-element');
  }

  handleCustomCursor() {
    const cursor = document.querySelector('#cursor');
    const cursorCircle = cursor.querySelector('.cursor__circle');
    const mouse = { x: -100, y: -100 }; // mouse pointer's coordinates
    const pos = { x: 0, y: 0 }; // cursor's coordinates
    const speed = 0.1; // between 0 and 1

    const updateCoordinates = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', updateCoordinates);

    function getAngle(diffX, diffY) {
      return (Math.atan2(diffY, diffX) * 180) / Math.PI;
    }

    function getSqueeze(diffX, diffY) {
      const distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
      const maxSqueeze = 0.15;
      const accelerator = 1500;
      return Math.min(distance / accelerator, maxSqueeze);
    }

    const updateCursor = () => {
      const diffX = Math.round(mouse.x - pos.x);
      const diffY = Math.round(mouse.y - pos.y);

      pos.x += diffX * speed;
      pos.y += diffY * speed;

      const angle = getAngle(diffX, diffY);
      const squeeze = getSqueeze(diffX, diffY);

      const scale = 'scale(' + (1 + squeeze) + ', ' + (1 - squeeze) + ')';
      const rotate = 'rotate(' + angle + 'deg)';
      const translate = 'translate3d(' + pos.x + 'px ,' + pos.y + 'px, 0)';

      //@ts-ignore
      cursor.style.transform = translate;
      //@ts-ignore
      cursorCircle.style.transform = rotate + scale;
    };

    function loop() {
      updateCursor();
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    const cursorModifiers = document.querySelectorAll('[cursor-class]');

    cursorModifiers.forEach((curosrModifier) => {
      curosrModifier.addEventListener('mouseenter', function () {
        const className = this.getAttribute('cursor-class');
        cursor.classList.add(className);
      });

      curosrModifier.addEventListener('mouseleave', function () {
        const className = this.getAttribute('cursor-class');
        cursor.classList.remove(className);
      });
    });
  }

  handleChart() {
    const data = [
      { type: 'Critics', value: 1000, name: 'Critics' },
      { type: 'Punks', value: 2000, name: 'Punks' },
      { type: 'Hippies', value: 3000, name: 'Hippies' },
      { type: 'Fantasies', value: 4000, name: 'Fantasies' },
    ];

    const piePlot = new Pie('chartContainer', {
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 0.7,
      innerRadius: 0.6,
      height: 420,
      label: {
        type: 'outer',
        offset: '50%',
        content: '{name}',
        style: {
          fontSize: 14,
          fill: '#fff',
        },
      },
      legend: false,
      statistic: {
        title: false,
        content: {
          style: {
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: 'title',
            color: '#fff',
            fontSize: '24',
          },
          content: 'SMART\nOTTERS\nSOCIETY',
        },
      },
    });

    piePlot.update({
      theme: {
        styleSheet: {
          brandColor: '#ff592c',
          paletteQualitative10: ['#9537d4', '#55b638', '#cc3a3a', '#d6a140'],
        },
      },
    });
    piePlot.render();
  }

  handleScrollToElement(target: string) {
    const element = document.getElementById(`${target}`);
    const headerOffset = 75;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
}

class Animations {
  element: any;
  camera: any;
  constructor(element, camera) {
    this.element = element;
    this.camera = camera;
    this.animateIn();
  }
  animateIn() {
    const animateIn = GSAP.timeline({
      defaults: {
        ease: 'expo',
      },
    });
    animateIn.from(this.camera.position, {
      z: 10,
      duration: 4,
    });
  }
}
