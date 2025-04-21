import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faLinkedinIn,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  // Iconos redes sociales
  faFacebook = faFacebookF;
  faTwitter = faTwitter;
  faInstagram = faInstagram;
  faLinkedin = faLinkedinIn;
  faYoutube = faYoutube;
  
  // Iconos contacto
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faMapMarker = faMapMarkerAlt;
  
  // Año actual para el copyright
  currentYear = new Date().getFullYear();
  
  // Enlaces de navegación
  quickLinks = [
    { title: 'Inicio', path: '/' },
    { title: 'Especialidades', path: '/especialidades' },
    { title: 'Exámenes', path: '/examenes' },
    { title: 'Planes', path: '/planes' },
    { title: 'Preguntas frecuentes', path: '/faq' }
  ];

  redesSociales = [
    { icon: this.faFacebook, path: '' },
    { icon: this.faTwitter, path: '' },
    { icon: this.faInstagram, path: '' },
    { icon: this.faLinkedin, path: '' },
    { icon: this.faYoutube, path: '' },
  ]
  
  // Enlaces de especialidades
  specialities = [
    { title: 'Derecho Constitucional', path: '/especialidades/constitucional' },
    { title: 'Derecho Civil', path: '/especialidades/civil' },
    { title: 'Derecho Penal', path: '/especialidades/penal' },
    { title: 'Derecho Administrativo', path: '/especialidades/administrativo' },
    { title: 'Derecho Laboral', path: '/especialidades/laboral' }
  ];

}
