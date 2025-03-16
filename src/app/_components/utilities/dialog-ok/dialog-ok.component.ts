import { Component, Inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DialogData } from 'src/app/_models/DialogData';
// Interfaccia per i dati che il modale riceverà


@Component({
  selector: 'app-dialog-ok',
  templateUrl: './dialog-ok.component.html',
  styleUrls: ['./dialog-ok.component.css'],
  standalone: false
})
export class DialogOkComponent {
  constructor(
    private modalCtrl: ModalController,
    @Inject('data') public data: DialogData
  ) {}

  // Metodo per chiudere il modale
  dismiss() {
    this.modalCtrl.dismiss(false); // Passa il valore che vuoi quando chiudi
  }
}