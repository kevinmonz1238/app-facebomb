import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-social',
  templateUrl: './social.page.html',
  styleUrls: ['./social.page.scss'],
})
export class SocialPage {

  irAlJuego() {
    // Redirigir al juego externo
    // El test interceptará esto con spyOn(window, 'open')
    window.open('https://facebomb.onrender.com/', '_blank');
  }
}
