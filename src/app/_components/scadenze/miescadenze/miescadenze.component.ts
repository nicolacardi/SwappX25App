//#region ----- IMPORTS ------------------------

import { Component, OnInit }                    from '@angular/core';
import { MatTableDataSource }                   from '@angular/material/table';
import { Observable, map }                           from 'rxjs';

//components
import { Utility }                              from '../../utilities/utility.component';
import { DialogOkComponent }                    from '../../utilities/dialog-ok/dialog-ok.component';

//services
import { ScadenzePersoneService }               from '../scadenze-persone.service';
import { ToastService }                         from 'src/app/_services/toast.service';
import { LoadingServiceIonic }                  from '../../utilities/loading/loadingIonic.service';

//models
import { User }                                 from 'src/app/_user/Users';
import { CAL_ScadenzaPersone }                  from 'src/app/_models/CAL_Scadenza';
import { ModalController } from '@ionic/angular';

//#endregion

@Component({
  selector: 'app-mie-scadenze',
  templateUrl: './miescadenze.component.html',
  styleUrls: ['../scadenze.scss'],
  standalone: false
})

export class MieScadenzeComponent implements OnInit {

//#region ----- Variabili ----------------------

  //public userID: string;
  public currUser!:                             User;
  public obsMieScadenze$!:                      Observable<CAL_ScadenzaPersone[]>
  public iscrizioneID:                          number = 43;
  public ckMostraScadenzeLette :                   boolean = false;


  matDataSource = new MatTableDataSource<CAL_ScadenzaPersone>();
  displayedColumns: string[] = [
    "message",
    "actionsColumn",
    "delete"
  ];

//#endregion

//#region ----- Constructor --------------------

  constructor(private svcScadenzePersone        : ScadenzePersoneService,
              private _loadingService           : LoadingServiceIonic,
              private _toast                    : ToastService,
              private modalCtrl                 : ModalController,
              
               ) {

    this.currUser = Utility.getCurrentUser();   
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit(){
    this.loadData();
  }

  loadData(){
    let scadenze$: Observable<CAL_ScadenzaPersone[]>;

    if(this.ckMostraScadenzeLette){
      scadenze$ = this.svcScadenzePersone.listByPersona(this.currUser.personaID)
    }
    else  
    scadenze$ = this.svcScadenzePersone.listByPersona(this.currUser.personaID)
    .pipe(map(
      res=> res.filter((x) => x.ckLetto == false))
    );;
    

    scadenze$.subscribe();
    this.obsMieScadenze$ =this._loadingService.showLoaderUntilCompleted(scadenze$);
  }

//#endregion

//#region ----- Altri metodi -------------------

  setLetto(element: CAL_ScadenzaPersone) {

    //element.ckLetto = !element.ckLetto;
    element.ckLetto = true;

    this.svcScadenzePersone.put(element).subscribe({
      next: res=> this.loadData(),
      error: err=> this._toast.presentToast ('Errore nella chuisura della scadenza ')
    });
  }

  setAccettato(element: CAL_ScadenzaPersone) {
    element.ckAccettato = true;
    element.ckLetto = true; //una scadenza accettata si dà anche per letta (il flag ckLetto non compare quando si tratta di accettare o respingere)
    element.ckRespinto = false;
    this.svcScadenzePersone.put(element).subscribe({
      next: res=> {},
      error: err=> this._toast.presentToast('Errore nella chuisura della scadenza ')
    });
  }

  async setRespinto(element: CAL_ScadenzaPersone) {
    if (element.personaID == this.currUser.personaID) {

      const modal = await this.modalCtrl.create({
        component: DialogOkComponent,
        componentProps: {
          data: { titolo: "ATTENZIONE!", sottoTitolo: "Non è possibile Respingere un proprio invito" }
        }
      });
      modal.present();
      
      this.loadData();
    } 
    else {
      element.ckAccettato = false;
      element.ckRespinto = true;
      this.svcScadenzePersone.put(element).subscribe({
        next: res=> {},
        error: err=> this._toast.presentToast('Errore nella chuisura della scadenza ')
      });
    }
  }

//#endregion

  deleteMsg(id: number) {
    //TODO??
    //da decidere cosa fare
    // this.svcScadenze.delete(id).subscribe(
    //   res=> this.loadData(),
    //   err=> this._snackBar.openFromComponent(SnackbarComponent, { data: 'Errore nella cancellazione  del messaggio ', panelClass: ['red-snackbar']})
    // );
  }

  toggleAttivi(){
    this.ckMostraScadenzeLette = !this.ckMostraScadenzeLette;
    this.loadData();
  }
}
