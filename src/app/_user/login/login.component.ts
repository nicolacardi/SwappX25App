import { Component, ElementRef, OnInit, Renderer2, ViewChild, Output, EventEmitter }                     from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router }                                           from '@angular/router';
import { UserService }                                      from '../user.service';
import { ParametriService }                                 from 'src/app/_components/impostazioni/parametri/parametri.service';
import { EventEmitterService }                              from 'src/app/_services/event-emitter.service';
import { MatDialog }                                        from '@angular/material/dialog';

import { tap }                                              from 'rxjs';

//components

//services
import { ToastService }                                     from 'src/app/_services/toast.service';
import { LoadingServiceIonic }                              from 'src/app/_components/utilities/loading/loadingIonic.service';

//models


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../user.scss'],
  standalone: false
})
export class LoginComponent  implements OnInit {


//#region ----- Variabili ----------------------

loading = false;
form! :                                       UntypedFormGroup;
ckPsw = true;

//#endregion

//#region ----- ViewChild Input Output ---------
@ViewChild('psw') pswInput!: ElementRef;
  
@Output('reloadRoutes') reloadRoutes = new EventEmitter<string>();
//#endregion

  constructor(private svcUser:                  UserService,
              private svcParametri:             ParametriService,
              private router:                   Router,
              private fb:                       UntypedFormBuilder,
              private eventEmitterService:      EventEmitterService,
              public _dialog:                   MatDialog,
              private _loadingService:          LoadingServiceIonic,
              private _toast:                   ToastService,
              private renderer:                 Renderer2) {

    this.form = this.fb.group({
      UserName:                   ['carlo.gazzola@gmail.com', Validators.required],
      Password:                   ['1234', { validators:[ Validators.required, Validators.maxLength(50)]}]
    })
   }

  ngOnInit() {
    if(localStorage.getItem('token') != null)
      this.router.navigateByUrl('/home');
  }

  onSubmit(){

    let obsUser$= this.svcUser.Login(this.form.value);
    const loadUser$ =this._loadingService.showLoaderUntilCompleted(obsUser$);
    
    loadUser$.subscribe({
      next: async user => {
        if(user!= null){

          this.eventEmitterService.onAccountSaveProfile();  //Verificare se serve TODO
          this.eventEmitterService.onLogin(user);

          this._toast.presentToast( 'Benvenuto ' + user.persona!.nome + ' ' + user.persona!.cognome );  
                    this.svcParametri.getByParName('AnnoCorrente')
            .pipe(tap( par => {
              console.log('Salvataggio nel localStorage:', par);
                localStorage.setItem(par.parName, JSON.stringify(par));
                })
              ).subscribe(  
                ()=> {
                  console.log('Redirecting to home');
                  //this.router.navigateByUrl('/home');
                  this.router.navigate(['/home'], { replaceUrl: true });
                }
              );


          
        }
        else {
          //Il WS risponde con un NoContent --> autenticazione fallita
          this.loading = false;
          this._toast.presentToast("Utente o password errati" );
        }
      },
      error: err=> {
        //il ws risponde con un errore oppure non risponde 
        this.loading = false;
        this._toast.presentToast("Problemi di connessione, il server non risponde");
      }
    });
  }

  forgotPassword(e: Event){
    e.preventDefault();
    this.reloadRoutes.emit('reset-psw');
  }

  register(e: Event){
    e.preventDefault();
    this.reloadRoutes.emit('register');
  }

  toggleShow() {
    this.ckPsw = !this.ckPsw;
    const inputElement = this.pswInput.nativeElement;
    const newType = this.ckPsw ? 'password' : 'text';
    
    this.renderer.setAttribute(inputElement, 'type', newType);
  }




}
