import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '@angular/fire/auth'; // Solo importamos el tipo User
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { PerfilService } from '../../services/perfil.service'; // Importamos el nuevo servicio

@Component({
  standalone: false,
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit, OnDestroy {

  perfil: any = {};
  user: User | null = null;
  monedas: number = 100;
  cargando: boolean = true;
  enviandoVerificacion: boolean = false;

  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private perfilService: PerfilService // Inyectamos el servicio
  ) {}

  async ngOnInit() {
    this.userSubscription = this.authService.user$.subscribe(async (user) => {
      this.user = user;
      if (user) {
        await this.cargarDatosUsuario();
      } else {
        this.cargando = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async cargarDatosUsuario() {
    this.cargando = true;
    try {
      await this.cargarPerfilFirestore();
      this.cargarDatosAuth();
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.cargando = false;
    }
  }

  async cargarPerfilFirestore() {
    try {
      if (!this.user?.uid) return;

      // USAMOS EL SERVICIO EN LUGAR DE getDoc DIRECTO
      const datos = await this.perfilService.obtenerDatosPerfil(this.user.uid);

      if (datos) {
        this.perfil = { ...this.perfil, ...datos };
        this.monedas = this.perfil.monedas || 100;
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  }

  cargarDatosAuth() {
    if (this.user) {
      this.perfil = {
        ...this.perfil,
        nombre: this.perfil.nombre || this.user.displayName || 'Usuario',
        email: this.perfil.email || this.user.email || 'No especificado',
        fotoURL: this.perfil.fotoURL || this.user.photoURL,
        proveedor: this.perfil.proveedor || this.user.providerData[0]?.providerId || 'email',
        emailVerified: this.user.emailVerified
      };
    }
  }

  getFotoPerfil(): string {
    if (this.perfil.fotoURL) return this.perfil.fotoURL;
    if (this.user?.photoURL) return this.user.photoURL;
    return this.getAvatarPorDefecto();
  }

  onErrorImagen(event: any) {
    console.log('Error cargando imagen, usando avatar por defecto');
    event.target.src = this.getAvatarPorDefecto();
  }

  getAvatarPorDefecto(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSI2MCIgZmlsbD0iIzI2MTkxMiIvPgogIDxwYXRoIGQ9Ik02MCAzMEM2Ni42IDMwIDcyIDM1LjQgNzIgNDJDNzIgNDguNiA2Ni42IDU0IDYwIDU0QzUzLjQgNTQgNDggNDguNiA0OCA0MkM0OCAzNS40IDUzLjQgMzAgNjAgMzBaTTYwIDYwQzcyIDYwIDgyIDY2IDgyIDc0Vjg2SDM4Vjc0QzM4IDY2IDQ4IDYwIDYwIDYwWiIgZmlsbD0iI2ZmY2M1YyIvPgo8L3N2Zz4=';
  }

  getNombreDisplay(): string {
    return this.perfil.nombre || this.user?.displayName || 'USUARIO';
  }

  getEmail(): string {
    return this.perfil.email || this.user?.email || 'No especificado';
  }

  estaVerificado(): boolean {
    return this.user?.emailVerified || false;
  }

  async enviarVerificacionEmail() {
    if (!this.user) return;

    this.enviandoVerificacion = true;
    try {
      // USAMOS EL SERVICIO EN LUGAR DE sendEmailVerification DIRECTO
      await this.perfilService.enviarCorreoVerificacion(this.user);
      alert('✅ Email de verificación enviado. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      console.error('Error enviando verificación:', error);
      alert('❌ Error al enviar verificación: ' + error.message);
    } finally {
      this.enviandoVerificacion = false;
    }
  }

  async actualizarPerfil() {
    await this.cargarDatosUsuario();
    console.log('Perfil actualizado');
  }

  getProveedor(): string {
    return this.perfil.proveedor === 'google.com' ? 'GOOGLE' : 'EMAIL';
  }
}
