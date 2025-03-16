//#region ----- IMPORTS ------------------------

import { Component, Inject, Input, NgZone, OnInit, ViewChild }       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup }                      from '@angular/forms';
// import { MAT_DIALOG_DATA }                                  from '@angular/material/dialog';
import { Observable }                                                from 'rxjs';
import { tap }                                                       from 'rxjs/operators';

import { registerLocaleData }                                        from '@angular/common';
import localeIt                                                      from '@angular/common/locales/it';
registerLocaleData(localeIt, 'it');
import { CdkTextareaAutosize }                                       from '@angular/cdk/text-field';
import { ModalController }                                           from '@ionic/angular';


//components
import { DialogYesNoComponent }                                      from '../../utilities/dialog-yes-no/dialog-yes-no.component';
import { FormatoData, Utility }                                      from '../../utilities/utility.component';
import { DialogOkComponent }                                         from '../../utilities/dialog-ok/dialog-ok.component';
//import { VotiCompitoListComponent }             from '../voti-compito-list/voti-compito-list.component';
import { PresenzeListComponent }                                     from '../presenze-list/presenze-list.component';

//services
import { MaterieService }                                            from 'src/app/_components/materie/materie.service';
import { DocenzeService }                                            from '../../docenze/docenze.service';
import { ClassiSezioniAnniService }                                  from '../../classi/classi-sezioni-anni.service';
import { DocentiService }                                            from '../../docenti/docenti.service';
import { LezioniService }                                            from '../lezioni.service';
import { PresenzeService }                                           from '../presenze.service';
import { IscrizioniService }                                         from '../../iscrizioni/iscrizioni.service';
import { VotiCompitiService }                                        from '../voti-compiti.service';
import { LoadingServiceIonic }                                       from '../../utilities/loading/loadingIonic.service';
import { ToastService }                                              from 'src/app/_services/toast.service';


//models
import { CAL_Lezione }                                               from 'src/app/_models/CAL_Lezione';
import { MAT_Materia }                                               from 'src/app/_models/MAT_Materia';
import { PER_Docente }                                               from 'src/app/_models/PER_Docente';
import { CLS_ClasseDocenteMateria }                                  from 'src/app/_models/CLS_ClasseDocenteMateria';
import { CAL_Presenza }                                              from 'src/app/_models/CAL_Presenza';
import { TST_VotoCompito }                                           from 'src/app/_models/TST_VotiCompiti';

//#endregion

@Component({
  selector: 'app-lezione',
  templateUrl: './lezione-edit.component.html',
  styleUrls: ['../lezioni.scss'],
  standalone:false

})
export class LezioneComponent implements OnInit {

//#region ----- Variabili ----------------------

  form! :                                       UntypedFormGroup;
  docenteID!:                                   number;
  lezione$!:                                    Observable<CAL_Lezione>;
  obsMaterie$!:                                 Observable<MAT_Materia[]>;
  obsClassiDocentiMaterie$!:                    Observable<CLS_ClasseDocenteMateria[]>;
  obsDocenti$!:                                 Observable<PER_Docente[]>;
  obsSupplenti$!:                               Observable<PER_Docente[]>;
  lezione!:                                      CAL_Lezione;


  dtStart!:                                     Date;
  dtEnd!:                                       Date;
  strClasseSezioneAnno!:                        string;
  strMateria!:                                  string;
  strDocente!:                                  string;
  strDtStart!:                                  string;
  strDtEnd!:                                    string;

  strH_Ini!:                                    string;
  strH_End!:                                    string;
  classeSezioneAnnoID!:                         number;

  emptyForm :                                   boolean = false;
  loading:                                      boolean = true;
  ckAppello:                                    boolean = false;
  ckCompito:                                    boolean = false;

  public docenteView:                           boolean = false;
  breakpoint!:                                  number;
  selectedTab:                                  number = 0;

  @ViewChild('autosize') autosize!:             CdkTextareaAutosize;
  @ViewChild("presenzeList") PresenzeListComponent!: PresenzeListComponent; 
  @Input() lezioneID!        : number;
  //@ViewChild(VotiCompitoListComponent) VotiCompitoListComponent!: VotiCompitoListComponent; 


//#endregion

//#region ----- Constructor --------------------

  constructor(
    
              // public _dialogRef                          : MatDialogRef<LezioneComponent>,
              
              private modalCtrl                 : ModalController,

              private fb                        : UntypedFormBuilder,
              private svcLezioni                : LezioniService,
              private svcMaterie                : MaterieService,
              private svcDocenti                : DocentiService,
              private svcClasseSezioneAnno      : ClassiSezioniAnniService,
              private svcIscrizioni             : IscrizioniService,
              private svcPresenze               : PresenzeService,
              private svcVotiCompiti            : VotiCompitiService,
              private _toast                    : ToastService,
              private _loadingService           : LoadingServiceIonic,
            
            ) {


    this.form = this.fb.group({
      id                         : [null],
      classeSezioneAnnoID        : [''],
    
      //campi di FullCalendar
      title                      : [''],
      dtCalendario               : [''], // Disabilitato
      h_Ini                      : [''], // Disabilitato
      h_End                      : [''], // Disabilitato
      colore                     : [''],
  
      docenteID                  : [{value: '', disabled: true}],
      materiaID                  : [''],
      ckEpoca                    : [''],
      ckFirma                    : [''],
      dtFirma                    : [''],
      ckAssente                  : [''],
      ckAppello                  : [''],

      ckCompito                  : [false],
      argomentoCompito           : [''],

      argomento                  : [''],
      compiti                    : [''],
      supplenteID                : [''],
      start                      : [''],
      end                        : ['']
    });
  }

//#endregion

//#region ----- LifeCycle Hooks e simili--------

  ngOnInit () {


    console.log ("lezione-edit - ngOnInit dati ricevuti", this.lezioneID);

    if (this.lezioneID) {
      const obsLezione$: Observable<CAL_Lezione> = this.svcLezioni.get(this.lezioneID);
      const loadLezione$ = this._loadingService.showLoaderUntilCompleted(obsLezione$);
      this.lezione$ = loadLezione$
      .pipe( tap(
        lezione => {
          this.lezione = lezione;
          console.log("lezione-edit - loadData - lezione estratta", lezione)
          this.form.patchValue(lezione)
          this.form.controls['dtCalendario'].setValue(lezione.dtCalendario.split('T')[0]);

          this.svcClasseSezioneAnno.get(this.lezione.classeSezioneAnnoID).subscribe(
            val => this.strClasseSezioneAnno = val.classeSezione.classe!.descrizione2 + " " + val.classeSezione.sezione
          );

          this.svcMaterie.get(this.lezione.materiaID).subscribe(
            val => this.strMateria = val.descrizione
          );

          this.svcDocenti.get(this.lezione.docenteID).subscribe(
            val => this.strDocente = val.persona.nome + ' ' + val.persona.cognome
          );

          //oltre ai valori del form vanno impostate alcune variabili: una data e alcune stringhe
          this.dtStart = new Date (lezione.start);
          this.strDtStart = Utility.formatDate(this.dtStart, FormatoData.yyyy_mm_dd);
          this.strH_Ini = Utility.formatHour(this.dtStart);

          this.dtEnd = new Date (lezione.end);
          this.strH_End = Utility.formatHour(this.dtEnd);
          this.ckAppello = lezione.ckAppello;
          this.ckCompito = lezione.ckCompito;

        } )
      );
    } 
  }


//#endregion

//#region ----- Operazioni CRUD ----------------

  save() {

        if (this.form.controls['ckAppello'].value == '')   this.form.controls['ckAppello'].setValue(false);     
        if (this.form.controls['ckCompito'].value == '')   this.form.controls['ckCompito'].setValue(false);     
        
        const objLezione = <CAL_Lezione>{
          
          classeSezioneAnnoID: this.form.controls['classeSezioneAnnoID'].value,
          dtCalendario: this.form.controls['dtCalendario'].value,
          //title: this.form.controls['title'].value,
          title: this.form.controls['title'].value.substring(1), //siccome ho aggiunto la stellina devo toglierla
          start: this.form.controls['start'].value,
          end: this.form.controls['end'].value,
          colore: this.form.controls['colore'].value,

          h_Ini: this.form.controls['h_Ini'].value,
          h_End: this.form.controls['h_End'].value,

          docenteID: this.form.controls['docenteID'].value,
          materiaID: this.form.controls['materiaID'].value,
          supplenteID: this.form.controls['supplenteID'].value,

          ckEpoca: this.form.controls['ckEpoca'].value,
          ckFirma: this.form.controls['ckFirma'].value,
          dtFirma: this.form.controls['dtFirma'].value,
          ckAssente: this.form.controls['ckAssente'].value,
          ckAppello: this.form.controls['ckAppello'].value,
          
          argomento: this.form.controls['argomento'].value,
          compiti: this.form.controls['compiti'].value,
          ckCompito: this.form.controls['ckCompito'].value,
          argomentoCompito: this.form.controls['argomentoCompito'].value
        };

        console.log ("lezione-edit - save - passo alla put l'objLezione", objLezione);
          objLezione.id = this.form.controls['id'].value;
          this.svcLezioni.put(objLezione).subscribe({
          next: res=> {
            this.modalCtrl.dismiss();
            this._toast.presentToast('Record salvato');
          },
          error: err=> this._toast.presentToast('Errore in salvataggio')
        });
        
      // }
    // });
  }

  

//#endregion

//#region ----- Altri metodi -------------------


  ckAssenteChange() {
    if (this.form.controls['ckAssente'].value != true) 
      this.form.controls['supplenteID'].setValue("");
  }

  async generaAppello() {

    const modal = await this.modalCtrl.create({
      component: DialogYesNoComponent,
      componentProps: {
        data: {
          titolo: "ATTENZIONE",
          sottoTitolo: "Si conferma la generazione dell'appello ?"
        }
      }
    });
    
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.svcIscrizioni.listByClasseSezioneAnno(this.lezione.classeSezioneAnnoID).subscribe(
        iscrizioni => {
        //Inserisce le presenze
        for (let iscrizione of iscrizioni) {
          let objPresenza : CAL_Presenza =
          { 
            id : 0,
            AlunnoID : iscrizione.alunnoID,
            LezioneID : this.lezione.id,
            ckPresente : true,
            ckDAD: false
          };
          this.svcPresenze.post(objPresenza).subscribe();
        }

        //ora deve salvare il ckAppello nella lezione: 
        //ATTENZIONE: così salva anche eventuali modifiche ad altri campi che magari uno non voleva salvare
        //forse bisognerebbe salvare SOLO il ckAppello
        this.form.controls['ckAppello'].setValue(true);
        this.ckAppello = true;
        
        for (const prop in this.form.controls) {
          this.form.value[prop] = this.form.controls[prop].value;
        }
      
        this.svcLezioni.put(this.form.value).subscribe({
          next: res=> {
            this.PresenzeListComponent.loadData();
          },  
          error: err=> this._toast.presentToast('Errore in salvataggio')
        });
      });
    }

  }

  async changedCkCompito(checked: boolean,) {
    this.ckCompito = checked;
    if (checked) {
      this.form.controls['argomentoCompito'].enable();

      //Ora bisogna inserire in Voti un valore per ogni alunno
      this.svcIscrizioni.listByClasseSezioneAnno(this.lezione.classeSezioneAnnoID)
      .subscribe(iscrizioni => {
        //Inserisce le presenze
        for (let iscrizione of iscrizioni) {
          let objVoto : TST_VotoCompito =
          { 
            id : 0,
            alunnoID : iscrizione.alunnoID,
            lezioneID : this.lezione.id,
            voto : 0,
            giudizio: ''
          };
          this.svcVotiCompiti.post(objVoto).subscribe();
        }

        //ora deve salvare il ckCompito e l'argomentoCompito nella lezione: 
        //ATTENZIONE: così salva anche eventuali modifiche ad altri campi che magari uno non voleva salvare
        //forse bisognerebbe salvare SOLO il ckCompito e l'argomentoCompito
        //this.form.controls['ckCompito'].setValue(true); //dovrebbe essere già settato
        
        for (const prop in this.form.controls) {
          this.form.value[prop] = this.form.controls[prop].value;
        }
      
        this.svcLezioni.put(this.form.value).subscribe({
          // next: res=> this.VotiCompitoListComponent.loadData(),//A COSA SERVE QUESTO? DA CAPIRE
          // error: err=> this._snackBar.openFromComponent(SnackbarComponent, {data: 'Errore in salvataggio', panelClass: ['red-snackbar']})
        });
      });
    }
    else {
      this.form.controls['argomentoCompito'].setValue('');
      this.form.controls['argomentoCompito'].disable();


      const modal = await this.modalCtrl.create({
        component: DialogYesNoComponent,
        componentProps: {
          data: {
            titolo: "ATTENZIONE",
            sottoTitolo: "Si conferma di voler cancellare il compito e con esso tutti i voti dello stesso ?"
          }
        }
      });
      
      await modal.present();

      const { data } = await modal.onWillDismiss();

      if (data) {
        this.svcVotiCompiti.deleteByLezione(this.lezione.id).subscribe();
        for (const prop in this.form.controls) {
          this.form.value[prop] = this.form.controls[prop].value;
        }
      
        this.svcLezioni.put(this.form.value).subscribe({
          next: res=> console.log ("ho cancellato i voti ma non faccio la refresh, non serve, i voti sono nascosti dalla ngIf"),
          error: err=> this._toast.presentToast('Errore in salvataggio')
        });
      } 
      else {
        this.form.controls['ckCompito'].setValue(true);
        this.ckCompito = true;
      }
    }
  }

  selectedTabValue(event: any){
    //senza questo espediente non fa il primo render correttamente
    this.selectedTab = event.index;
  }


  async close() {
    


    if (this.form.dirty) {


      const modal = await this.modalCtrl.create({
        component: DialogYesNoComponent,
        componentProps: {
          data: {
            titolo: "ATTENZIONE",
            sottoTitolo: "Si desidera salvare?"
          }
        }
      });
      
      await modal.present();
  
      const { data } = await modal.onDidDismiss();
      if (data) {
        this.save();
        this.modalCtrl.dismiss();
      } else {
        this.modalCtrl.dismiss();
      }
    } else {
      this.modalCtrl.dismiss();
    }

  }

  isFormDirty(): boolean {
    return this.form.controls['ckCompito'].dirty ||
           this.form.controls['argomentoCompito'].dirty ||
           this.form.controls['argomento'].dirty ||
           this.form.controls['compiti'].dirty ||
           this.form.controls['ckFirma'].dirty;
  }
//#endregion
}
