import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  standalone: false,
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  perfil: any = {};

  constructor(private auth: Auth, private firestore: Firestore) {}

  async ngOnInit() {
    const user = this.auth.currentUser;
    const ref = doc(this.firestore, `usuarios/${user?.uid}`);
    const datos = await getDoc(ref);
    this.perfil = datos.data();
  }
}
