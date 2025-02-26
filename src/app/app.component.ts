import { Component, ViewChild }     from '@angular/core';
import { UserService }              from './_user/user.service';
import { Router }                   from '@angular/router';
import { EventEmitterService }      from './_services/event-emitter.service';
import { UntypedFormControl }       from '@angular/forms';
import { User }                     from './_user/Users';
import { Utility }                  from './_components/utilities/utility.component';
import { IonMenu }                  from '@ionic/angular';

//services
import { TitleService }             from './_services/title.service';

//models
import { PER_Persona }              from './_models/PER_Persone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  //#region ----- Variabili ----------------------
  public isLoggedIn?       : boolean = false;
  public currUser!         : User;
  public currPersona!      : PER_Persona;

  public userFullName      : string = "";
  public imgAccount        = "";
  stringJson               : any;
  stringObject             : any;

  isPinned                 = false;
  isExpanded               = false;

  public mode              = new UntypedFormControl('over');
  title                    = 'Stoody';


//#endregion

//#region ----- ViewChild Input Output ---------
  @ViewChild('menu', { static: false }) menu!: IonMenu; // Aggiungi il riferimento del menu
//#endregion

  constructor(private svcUser:                  UserService,
              private router:                   Router,
              private eventEmitterService:      EventEmitterService,
              private titleService:             TitleService
            ) {

              this.titleService.currentTitle.subscribe(newTitle => {
                this.title = newTitle; // aggiorna il titolo
              });

}


  async ngOnInit () {

    //Carico i dati e l'immagine dell'utente tramite un eventEmitter
    if (this.eventEmitterService.userSubscribeAttiva==undefined) {    
      //in questo modo non solo faccio la subscribe al RefreshFoto ma imposto la subscription a un valore diverso da undefined
      this.eventEmitterService.userSubscribeAttiva = this.eventEmitterService.invokeUserEmit.subscribe(
        user => {
          this.currUser = user;
          console.log ("app.component - ngOnInit currUser", this.currUser);
          //questo è un "captatore" dell'Emit, quindi può funzionare sia in fase di Login che di Logout
          if (user) {
            this.userFullName = this.currUser.fullname;
            this.isLoggedIn = true;
          } 
          else {
            console.log ("app.component - ngOnInit set isLoggedIn to false");
            this.isLoggedIn = false; //Ma serve? se emetto (vedi funzione logout sì) altrimenti no
          }
        }
      );    
    }

    this.refreshUserData();

    //Carico i dati e l'immagine dell'utente tramite un eventEmitter
    if (this.eventEmitterService.refreshFotoSubscribeAttiva==undefined) {    
      //in questo modo non solo faccio la subscribe al RefreshFoto ma imposto la subscription a un valore diverso da undefined
      //inoltre predispongo per il refresh
      this.eventEmitterService.refreshFotoSubscribeAttiva = this.eventEmitterService.invokeAppComponentRefreshFoto.subscribe(
        () => this.refreshUserData()  //così facendo in caso di F5 viene lanciato refreshUserData
      );    
    } 
  }


  refreshUserData () {


    if(!this.currUser) 
      this.currUser = Utility.getCurrentUser();

    if (this.currUser) {
      console.log ("app.component - refreshUserData set isLoggedIn to true");

      this.isLoggedIn = true;

      this.userFullName = this.currUser.fullname;
      this.svcUser.getFotoByUserID(this.currUser.userID).subscribe(
        res => this.imgAccount = res.foto
      );
    }

  }


  logOut() {
    //console.log("app.component - prima di Logout");
    this.svcUser.Logout(); //azzero tutto, compreso il BS dello User
    this.isLoggedIn = false;
    this.router.navigate(['/user/login']);
  }

  closeMenu(menu: IonMenu) {
    menu.close(); // Chiude il menu
  }



  // Metodo per aggiornare il titolo
  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);  // aggiorna il titolo usando il servizio
  }

  openExternalLink() {
    window.open('https://www.arcascuola.it', '_blank');  // Apre il sito in una nuova finestra
  }
}


