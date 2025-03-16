//#region ----- IMPORTS ------------------------

import { Component, EventEmitter, Input, OnInit, Output, ViewChild }       from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }                from '@angular/forms';
import { Observable, firstValueFrom, from , of }                           from 'rxjs';
import { concatMap, mergeMap, tap }                                        from 'rxjs/operators';
import { MatSelectChange, MatSelectTrigger }                               from '@angular/material/select';
import { DatePipe }                                                        from '@angular/common';
import { ModalController }                                                 from '@ionic/angular';

//components
import { FormatoData, Utility }                                            from '../../utilities/utility.component';
import { DialogOkComponent }                                               from '../../utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent }                                            from '../../utilities/dialog-yes-no/dialog-yes-no.component';


//services

import { PersoneService }                                                  from '../persone.service';
import { UserService }                                                     from 'src/app/_user/user.service';
import { ComuniService }                                                   from 'src/app/_services/comuni.service';
import { LoadingServiceIonic }                                             from '../../utilities/loading/loadingIonic.service';

// import { TipiPersonaService }                   from '../tipi-persona.service';
// import { AlunniService }                        from '../../alunni/alunni.service';
// import { GenitoriService }                      from '../../genitori/genitori.service';
// import { DocentiService }                       from '../../docenti/docenti.service';
// import { NonDocentiService }                    from '../nondocenti.service';
// import { ITManagersService }                    from '../ITmanagers.service';
// import { DirigentiService }                     from '../dirigenti.service';
// import { DocentiCoordService }                  from '../docenticoord.service';

//models
import { PER_Persona, PER_TipoPersona }                                    from 'src/app/_models/PER_Persone';
import { _UT_Comuni }                                                      from 'src/app/_models/_UT_Comuni';
//import { PER_Docente }                          from 'src/app/_models/PER_Docente';
import { User }                                                            from 'src/app/_user/Users';

//#endregion

@Component({
  selector: 'app-persona-form',
  templateUrl: './persona-form.component.html',
  styleUrls: ['../persone.scss'],
  standalone: false
})
export class PersonaFormComponent implements OnInit {

//#region ----- Variabili ----------------------

  persona$!:                                    Observable<PER_Persona>;
  obsTipiPersona$!:                             Observable<PER_TipoPersona[]>;
  currUser!:                                    User;

  public form! :                                UntypedFormGroup;
  emptyForm :                                   boolean = false;
  comuniArr!:                                   _UT_Comuni[];
  filteredComuniArr!:                           _UT_Comuni[];
  filteredComuniNascitaArr!:                    _UT_Comuni[];

  filteredComuni$!:                             Observable<_UT_Comuni[]>;
  filteredComuniNascita$!:                      Observable<_UT_Comuni[]>;
  comuniIsLoading:                              boolean = false;
  comuniNascitaIsLoading:                       boolean = false;
  breakpoint!:                                  number;
  breakpoint2!:                                 number;

  _lstRoles!:                                   string[];
  lstTipiPersona!:                              PER_TipoPersona[];
  selectedRoles:                                 number[] = []

  //per mostrare i form di ruoli specifici
  genitoreID = 0;
  alunnoID = 0;
  
  showGenitoreForm:boolean  = false;
  showAlunnoForm:boolean = false;

  //TODO.....

//#endregion

//#region ----- ViewChild Input Output -------

  @ViewChild('selectroles') selectroles!: MatSelectTrigger;

  @Input() personaID!:                          number;
  @Input() tipoPersonaID!:                      number;
  @Input() dove!:                               string;

  @Output('formChanged') formChanged = new EventEmitter();
  @Output('formValid') formValid = new EventEmitter<boolean>();
  // @Output('changedRoles') changedRoles = new EventEmitter();

//#endregion

//#region ----- Constructor --------------------

  constructor(private fb               : UntypedFormBuilder,
              private svcPersone       : PersoneService,
              private svcUser          : UserService,
              private svcComuni        : ComuniService,

              // private svcAlunni:                AlunniService,
              // private svcGenitori:              GenitoriService,
              // private svcDocenti:               DocentiService,
              // private svcDocentiCoord:          DocentiCoordService,
              // private svcNonDocenti:            NonDocentiService,
              // private svcITManagers:            ITManagersService,
              // private svcDirigenti:             DirigentiService,
              // private svcTipiPersona:           TipiPersonaService,
              private modalCtrl        : ModalController,
              private _loadingService  : LoadingServiceIonic,
              private datePipe         : DatePipe
 ) { 

    let regCF = "^[a-zA-Z]{6}[0-9]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9]{2}([a-zA-Z]{1}[0-9]{3})[a-zA-Z]{1}$";

    this.form = this.fb.group({
      id:                                       [null],
      //tipoPersonaID:                          ['', Validators.required],
      _lstRoles:                                [''],

      nome:                                     ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      cognome:                                  ['', { validators:[ Validators.required, Validators.maxLength(50)]}],
      dtNascita:                                ['', Validators.required],
      comuneNascita:                            ['', Validators.maxLength(50)],
      provNascita:                              ['', Validators.maxLength(2)] ,
      nazioneNascita:                           ['', Validators.maxLength(3)],
      indirizzo:                                ['', Validators.maxLength(255)],
      comune:                                   ['', Validators.maxLength(50)],
      prov:                                     ['', Validators.maxLength(2)],
      cap:                                      ['', Validators.maxLength(5)],
      nazione:                                  ['', Validators.maxLength(3)],
      genere:                                   ['',{ validators:[Validators.maxLength(1), Validators.required, Validators.pattern("M|F")]}],
      cf:                                       ['',{ validators:[Validators.maxLength(16), Validators.pattern(regCF)]}],
      telefono:                                 ['', Validators.maxLength(13)],
      email:                                    ['',{ validators:[Validators.email]}],
      ckAttivo:                                 [true],
      ckRegistrato:                             [false]
    });

    // this.currUser = Utility.getCurrentUser();
    //this.obsTipiPersona$ = this.svcTipiPersona.listByLivello(this.currPersona.persona!.tipoPersona!.livello);
    // this.obsTipiPersona$ = this.svcTipiPersona.list();
  }
  
//#endregion

//#region ----- LifeCycle Hooks e simili-------

  ngOnInit(){

    this.loadData();
    this.svcComuni.list().subscribe( res => this.comuniArr = res);
    this.form.valueChanges.subscribe(  () => {
        //console.log("form changed");
        this.formChanged.emit();
        this.formValid.emit(this.form.valid)
      }
    )
  }

  loadData(){

    // this.breakpoint = (window.innerWidth <= 800) ? 1 : 3;
    // this.breakpoint2 = (window.innerWidth <= 800) ? 2 : 3;

    if (this.personaID && this.personaID + '' != "0") {
      const obsPersona$: Observable<PER_Persona> = this.svcPersone.get(this.personaID);
      const loadPersona$ = this._loadingService.showLoaderUntilCompleted(obsPersona$);

      //interrogo ed aspetto per avere la lista dei tipi persona che mi serve nella loadPersona successiva
      // await firstValueFrom(this.obsTipiPersona$.pipe(tap(lstTipiPersona=> this.lstTipiPersona = lstTipiPersona)));

      this.persona$ = loadPersona$
        .pipe( 
          tap(
            persona => {
              this.form.patchValue(persona);
              console.log ("persona-form loadData persona", persona);
              if (persona && persona.dtNascita) {
                const formattedDate = this.datePipe.transform(persona.dtNascita, 'yyyy-MM-dd');
                persona.dtNascita = formattedDate || '';
                this.form.controls['dtNascita'].setValue(formattedDate);
              }

              // this._lstRoles = persona._LstRoles!; //questi i ruoli arrivati
              // console.log("persona-form arrivati:", persona._LstRoles)

              // for (let i= 0; i < persona._LstRoles!.length; i++) {
              //   const ruoloPersona = this.lstTipiPersona.find(tp => tp.descrizione === persona._LstRoles![i]);
              //   if (ruoloPersona) this.selectedRoles.push(ruoloPersona.id)
              // }
              // console.log("persona-form this.selectedRoles:", this.selectedRoles);

              // this.form.controls._lstRoles.setValue(this.selectedRoles);
              
              // //se tra i ruoli ci sono alunno /genitore mostro il form relativo
              // if (persona._LstRoles!.includes('Alunno')) { this.showAlunnoForm = true; }//devo anche valorizzare alunnoID e passarlo a alunno form
              // if (persona._LstRoles!.includes('Genitore')) {this.showGenitoreForm = true} //devo anche valorizzare genitoreID e passarlo a genitore form
            }
          ),
          tap( persona => this.svcUser.getByPersonaID(persona.id).subscribe(user=> {if (user.id) this.form.controls['ckRegistrato'].setValue(true         )}))
      );
    }
    else 
      this.emptyForm = true;

    //********************* FILTRO COMUNE E COMUNE DI NASCITA *******************

    this.form.controls['comune'].valueChanges.subscribe( res=> {
      this.comuniIsLoading = true
        if (res && res.length >=3 && this.comuniArr != undefined ) {
          this.filteredComuniArr = this.comuniArr.filter (val => val.comune.toLowerCase().includes(res.toLowerCase()) );
          this.comuniIsLoading = false
        } 
        else {
          this.filteredComuniArr = [];
          this.comuniIsLoading = false
        }
      }
    )

    this.form.controls['comuneNascita'].valueChanges.subscribe( res=> {
      this.comuniNascitaIsLoading = true
        if (res && res.length >=3  && this.comuniArr != undefined) {
          this.filteredComuniNascitaArr = this.comuniArr.filter(val => val.comune.toLowerCase().includes(res.toLowerCase()));
          this.comuniNascitaIsLoading = false
        } 
        else {
          this.filteredComuniNascitaArr = [];
          this.comuniNascitaIsLoading = false
        }
      }
    )
  }

  async checkExists(): Promise<any[] | null> {

    let result = [];
    let objTrovatoNC: PER_Persona | null = null;
    let objTrovatoCF: PER_Persona | null = null;
    let objTrovatoEM: PER_Persona | null = null;

    objTrovatoNC = await firstValueFrom(this.svcPersone.getByNomeCognome(this.form.controls['nome'].value, this.form.controls['cognome'].value, this.personaID? this.personaID : 0));
    if (this.form.controls['cf'].value && this.form.controls['cf'].value!= '') objTrovatoCF = await firstValueFrom(this.svcPersone.getByCF(this.form.controls['cf'].value, this.personaID? this.personaID : 0));
    objTrovatoEM = await firstValueFrom(this.svcPersone.getByEmail(this.form.controls['email'].value, this.personaID? this.personaID : 0));

    //console.log ("objTrovatoNC", objTrovatoNC);
    //console.log ("objTrovatoCF", objTrovatoCF);    
    //console.log ("objTrovatoEM", objTrovatoEM);    

    if (objTrovatoNC) result.push({msg: "Combinazione Nome e Cognome <br>già presente", grav: "nonBlock"} );
    if (objTrovatoCF) result.push({msg: "CF già presente", grav: "Block"} );
    if (objTrovatoEM) result.push({msg: "Email già presente", grav: "Block"} );
    
    return result;
  }


  save() :Observable<any>{

    //verifica (e attende l'esito) se ci sono già persone con lo stesso nome-cognome, cf, email. 
    return from(this.checkExists()).pipe(
      mergeMap(async (msg) => {
        if (msg && msg.length > 0) {

          const blockMessages = msg
            .filter(item => item.grav === "Block")
            .map(item => item.msg);
  
          if (blockMessages && blockMessages.length > 0) {

            const modal = await this.modalCtrl.create({
              component: DialogOkComponent,
              componentProps: {
                data: { titolo: "ATTENZIONE!", sottoTitolo: blockMessages.join(', ') + '<br>Impossibile Salvare' }
              }
            });
            modal.present();
            // la presenza di persone con stessa email o cf genera uno stop (gravità Block)
            return of();
          } 
          else {
            const UnblockMessages = msg
              .filter(item => item.grav === "nonBlock")
              .map(item => item.msg);
          
            return from(this.modalCtrl.create({
              component: DialogYesNoComponent,
              componentProps: { 
                titolo: "ATTENZIONE!", 
                sottoTitolo: UnblockMessages.join(', ') + '<br>Vuoi salvare un omonimo?' 
              }
            })).pipe(
              mergeMap(modal => {
                modal.present(); // Mostra il modale
                return from(modal.onDidDismiss()); // Attende la chiusura
              }),
              mergeMap(({ data: result }) => { 
                if (result) {
                  if (this.personaID == null || this.personaID == 0) {
                    // POST
                    return this.svcPersone.post(this.form.value).pipe(
                      tap(persona => {
                        let formData = { 
                          UserName: this.form.controls['email'].value,
                          Email: this.form.controls['email'].value,
                          PersonaID: persona.id,
                          Password: "1234"
                        };
                        this.svcUser.post(formData).subscribe();
                      })
                    );
                  } else {
                    // PUT
                    this.form.controls['dtNascita'].setValue(
                      Utility.formatDate(this.form.controls['dtNascita'].value, FormatoData.yyyy_mm_dd)
                    );
                    return this.svcPersone.put(this.form.value);
                  }
                } else {
                  // Se l'utente dice di non procedere, restituisce un Observable vuoto
                  return of();
                }
              })
            );
          }
        } else {
          // In caso di nessun messaggio, si procede con POST o PUT
          //***********************QUESTO BLOCCO E' PURTROPPO UGUALE A QUELLO SOPRA ************/
          if (this.personaID == null || this.personaID == 0) {
            //POST
            return this.svcPersone.post(this.form.value).pipe(
              // tap(() => this.saveRoles()),
              tap(persona => {
                let formData = { 
                  UserName: this.form.controls['email'].value,
                  Email: this.form.controls['email'].value,
                  PersonaID: persona.id,
                  Password: "1234"
                };
                console.log("sto creando l'utente", formData);
                this.svcUser.post(formData).subscribe();
              })
            );
          } 
          else {
            //PUT
            this.form.controls['dtNascita'].setValue(Utility.formatDate(this.form.controls['dtNascita'].value, FormatoData.yyyy_mm_dd));
            // this.saveRoles(); 
            return this.svcPersone.put(this.form.value);
          }
          //*****************************FINO A QUI ***********************************************************/

        }
      })
    );
  };


  delete() :Observable<any>{

    //BISOGNA CHE PRIMA CANCELLI TUTTI I VARI GENITORE, ALUNNO, DOCENTE, NON DOCENTE E USER ECC. TODO
    if (this.personaID != null) 
      return this.svcPersone.delete(this.personaID) ;
    else 
      return of();
  }

//#endregion

//#region ----- Altri metodi -------

  popolaProv(prov: string, cap: string) {
    this.form.controls['prov'].setValue(prov);
    this.form.controls['cap'].setValue(cap);
    this.form.controls['nazione'].setValue('ITA');
  }

  popolaProvNascita(prov: string) {
    this.form.controls['provNascita'].setValue(prov);
    this.form.controls['nazioneNascita'].setValue('ITA');
  }

  formatDtNascita(dtNascita: string){

    //prendo la stringa e ne estraggo i pezzi
    const parts = dtNascita.split('/'); // Split the input string by '/'
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
  
    // creo la nuova data con i valori estratti (assumendo l'ordine day/month/year)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
    // formatto la data al tipo richiesto dal controllo data ('yyyy-MM-dd')
    let formattedDate = date.toISOString().slice(0, 10);
  
    //piccolo step per evitare che 1/1/2008 diventi 31/12/2007
    formattedDate = Utility.formatDate(date, FormatoData.yyyy_mm_dd);

    //impostazione della data finale
    this.form.controls['dtNascita'].setValue(formattedDate);
  }
//#endregion

}
