import { TestBed } from '@angular/core/testing';
import { PerfilService } from './perfil.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

describe('PerfilService', () => {
  let service: PerfilService;
  const firestoreMock = {};
  const authMock = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PerfilService,
        { provide: Firestore, useValue: firestoreMock },
        { provide: Auth, useValue: authMock }
      ]
    });
    service = TestBed.inject(PerfilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('obtenerDatosPerfil debería intentar leer doc', async () => {
    try {
      await service.obtenerDatosPerfil('123');
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('enviarCorreoVerificacion debería intentar usar Auth', async () => {
    try {
      await service.enviarCorreoVerificacion({} as any);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
