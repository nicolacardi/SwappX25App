import { Component, ElementRef, OnInit, ViewChild }               from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators }       from '@angular/forms';
import { MatDialog }                                              from '@angular/material/dialog';
//import { ChangeDetectorRef }                                      from '@angular/core';

//components
import { DialogOkComponent }                                      from '../../_components/utilities/dialog-ok/dialog-ok.component';
import { PhotocropComponent }                                     from '../../_components/utilities/photocrop/photocrop.component';
import { Utility }                                                from '../../_components/utilities/utility.component';
import { PersonaFormComponent }                                   from '../../_components/persone/persona-form/persona-form.component';

//services
import { EventEmitterService }                                    from 'src/app/_services/event-emitter.service';
import { UserService }                                            from 'src/app/_user/user.service';
import { PersoneService }                                         from '../../_components/persone/persone.service';
import { ToastService }                                           from 'src/app/_services/toast.service';


//models
import { _UT_UserFoto }                                           from 'src/app/_models/_UT_UserFoto';
import { User }                                                   from 'src/app/_user/Users';
import { IonImg } from '@ionic/angular';

@Component({
  selector: 'app-profilo',
  templateUrl: './profilo.component.html',
  styleUrls: ['../user.scss'],
  standalone: false
})

export class ProfiloComponent implements OnInit {

//#region ----- Variabili ----------------------
  imgFile!:                                     string;
  foto!:                                        string;
  fotoObj!:                                     _UT_UserFoto
  form! :                                       UntypedFormGroup;
  public currUser!:                             User;
//#endregion

//#region ----- ViewChild Input Output -------
  @ViewChild('myImg', {static: false}) immagineDOM!: IonImg;
  @ViewChild(PersonaFormComponent) personaFormComponent!: PersonaFormComponent; 
//#endregion

  constructor(private fb:                                 UntypedFormBuilder, 
              private svcUser:                            UserService,
              private svcPersone:                         PersoneService,
              public _dialog:                             MatDialog,
              private eventEmitterService:                EventEmitterService,
              private _toast:                             ToastService,
              //private cdr:                                ChangeDetectorRef
            ) { 

    this.form = this.fb.group({
      file:           ['' , [Validators.required]],
      username:       [{value:'' , disabled: true}, [Validators.required]],
      email:          [''],
      fullname:       [{value:'' , disabled: true} , [Validators.required]],
    });
  }

  ngOnInit(): void {
    
    this.currUser = Utility.getCurrentUser();


    
    this.form.get('username')?.setValue(this.currUser.username);
    this.form.get('email')?.setValue(this.currUser.email);
    this.form.get('fullname')?.setValue(this.currUser.fullname);


    this.svcUser.getFotoByUserID(this.currUser.userID).subscribe(
      val=> {
        if(val){
          this.imgFile = val.foto; 
          this.fotoObj = val;


        }
      }
    );
  }
  


  onImageChange(e: any) {
   
    if(e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      if(e.target.files[0].size > 200000){
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (200kb)"}
        });
        return;
      };

    const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.imgFile = reader.result;
          // console.log('imgFile aggiornata:', this.imgFile);
          
          setTimeout(() => {
            if (this.immagineDOM && this.immagineDOM.src) {
              // console.log('immagineDOM disponibile:', this.immagineDOM.src);
              this.immagineDOM.src = this.imgFile;
            } else {
              console.error('immagineDOM non definito al momento dell\'aggiornamento');
            }
          }, 0);
        }
      };
      
    }

  }

  cropImage(e: any) {
   
    if(e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      if(e.target.files[0].size > 200000){
        this._dialog.open(DialogOkComponent, {
          width: '320px',
          data: {titolo: "ATTENZIONE!", sottoTitolo: "Il file eccede la dimensione massima (200kb)"}
        });
        return;
      };

      const dialogRef = this._dialog.open(PhotocropComponent, {
        width: '270px',
        height: '400px',
        data: {file: e.target.files}
      });
    }
  }

  save(){

    //Prendo dal form nel child personaForm i valori dei campi che NON si trovano nel component padre
    this.form.controls['email'].setValue(this.personaFormComponent.form.controls['email'].value);
    //se dovesse servire....sistemo anche il fullname
    this.form.controls['fullname'].setValue(this.personaFormComponent.form.controls['nome'].value + " "+ this.personaFormComponent.form.controls['cognome'].value);


    let formData = {
      userID:     this.currUser.userID,   
      UserName:   this.form.controls['username'].value,
      Email:      this.form.controls['email'].value,
      Password:   "",
      PersonaID:  this.currUser.personaID
      //FullName:   this.form.controls.fullname.value,
    };

    this.svcUser.put(formData).subscribe({
      next: res => {
        this.currUser.username = this.form.controls['username'].value;
        this.currUser.email =this.form.controls['email'].value;
        this.currUser.fullname = this.form.controls['fullname'].value;

        localStorage.setItem('currentUser', JSON.stringify(this.currUser));
      },
      error: err=> console.log("[profilo.component] - save: ERRORE this.svcUser.put", formData)
    });

    this.svcPersone.put(this.personaFormComponent.form.value).subscribe({
      next: res => {
        console.log("persona salvata", this.personaFormComponent.form.value);
        // this._toast.presentToast('Profilo salvato');

      },
      error: err=> console.log("[profilo.component] - save: ERRORE this.svcPersone.put", this.personaFormComponent.form.value)
    });


    if(this.immagineDOM != undefined){


      this.fotoObj.userID = this.currUser.userID;
      this.fotoObj.foto = this.immagineDOM!.src!;
      this.svcUser.save(this.fotoObj).subscribe( () => {
          this.eventEmitterService.onAccountSaveProfile();
          this._toast.presentToast('Profilo salvato');
        }
      );
    }
  }
}