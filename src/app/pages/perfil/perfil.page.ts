import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auth, User, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

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
    private auth: Auth,
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Suscribirse a cambios del usuario
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
      // Primero cargar datos de Firestore
      await this.cargarPerfilFirestore();

      // Luego complementar con datos de Auth
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

      const ref = doc(this.firestore, `usuarios/${this.user.uid}`);
      const datos = await getDoc(ref);

      if (datos.exists()) {
        this.perfil = { ...this.perfil, ...datos.data() };
        this.monedas = this.perfil.monedas || 100;
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  }

  cargarDatosAuth() {
    if (this.user) {
      this.perfil = {
        // Mantener datos existentes de Firestore
        ...this.perfil,
        // Sobrescribir con datos de Auth si no existen
        nombre: this.perfil.nombre || this.user.displayName || 'Usuario',
        email: this.perfil.email || this.user.email || 'No especificado',
        fotoURL: this.perfil.fotoURL || this.user.photoURL,
        proveedor: this.perfil.proveedor || this.user.providerData[0]?.providerId || 'email',
        // Asegurar que emailVerified venga de Auth
        emailVerified: this.user.emailVerified
      };
    }
  }

  // Método para obtener la foto de perfil con manejo de errores
  getFotoPerfil(): string {
    // Si hay fotoURL en el perfil, usarla
    if (this.perfil.fotoURL) {
      return this.perfil.fotoURL;
    }

    // Si el usuario de Auth tiene foto, usarla
    if (this.user?.photoURL) {
      return this.user.photoURL;
    }

    // Imagen por defecto (SVG en base64 para evitar archivo externo)
    return this.getAvatarPorDefecto();
  }

  // Manejar error en carga de imagen
  onErrorImagen(event: any) {
    console.log('Error cargando imagen, usando avatar por defecto');
    event.target.src = this.getAvatarPorDefecto();
  }

  // Avatar por defecto como SVG en base64
  getAvatarPorDefecto(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIHJ4PSI2MCIgZmlsbD0iIzI2MTkxMiIvPgogIDxwYXRoIGQ9Ik02MCAzMEM2Ni42IDMwIDcyIDM1LjQgNzIgNDJDNzIgNDguNiA2Ni42IDU0IDYwIDU0QzUzLjQgNTQgNDggNDguNiA0OCA0MkM0OCAzNS40IDUzLjQgMzAgNjAgMzBaTTYwIDYwQzcyIDYwIDgyIDY2IDgyIDc0Vjg2SDM4Vjc0QzM4IDY2IDQ4IDYwIDYwIDYwWiIgZmlsbD0iI2ZmY2M1YyIvPgo8L3N2Zz4=';
  }

  // Método para obtener el nombre para mostrar
  getNombreDisplay(): string {
    return this.perfil.nombre || this.user?.displayName || 'USUARIO';
  }

  // Método para obtener el email
  getEmail(): string {
    return this.perfil.email || this.user?.email || 'No especificado';
  }

  // Método para verificar si el email está verificado
  estaVerificado(): boolean {
    return this.user?.emailVerified || false;
  }

  // Método para enviar verificación de email
  async enviarVerificacionEmail() {
    if (!this.user) return;

    this.enviandoVerificacion = true;
    try {
      await sendEmailVerification(this.user);
      alert('✅ Email de verificación enviado. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      console.error('Error enviando verificación:', error);
      alert('❌ Error al enviar verificación: ' + error.message);
    } finally {
      this.enviandoVerificacion = false;
    }
  }

  // Método para actualizar perfil
  async actualizarPerfil() {
    await this.cargarDatosUsuario();
    console.log('Perfil actualizado');
  }

  // Método para obtener el tipo de proveedor
  getProveedor(): string {
    return this.perfil.proveedor === 'google.com' ? 'GOOGLE' : 'EMAIL';
  }
}
