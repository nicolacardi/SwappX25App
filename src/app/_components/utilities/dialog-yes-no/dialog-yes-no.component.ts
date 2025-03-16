import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DialogData } from 'src/app/_models/DialogData';

@Component({
  selector: 'app-dialog-yes-no',
  templateUrl: './dialog-yes-no.component.html',
  styleUrls: ['./dialog-yes-no.component.css'],
  standalone: false
})
export class DialogYesNoComponent {
  @Input() data!: DialogData;  // Usa @Input() per ricevere i dati

  constructor(private modalCtrl: ModalController) {}

  // Metodo per chiudere il modale con "Yes"
  accept() {
    this.modalCtrl.dismiss(true);  // Passa true quando si clicca "Sì"
  }

  // Metodo per chiudere il modale con "No"
  reject() {
    this.modalCtrl.dismiss(false);  // Passa false quando si clicca "No"
  }
}
