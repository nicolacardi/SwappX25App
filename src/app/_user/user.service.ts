import { Injectable }                               from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient }                               from '@angular/common/http';
import { tap, timeout }                             from 'rxjs/operators';
import { BehaviorSubject, Observable }              from 'rxjs';

//components
import { environment }                              from 'src/environments/environment';
import { User }                                     from './Users';

//services
import { EventEmitterService } from '../_services/event-emitter.service';
import { _UT_UserFoto } from '../_models/_UT_UserFoto';

//classes

@Injectable({
  providedIn: 'root'
})
export class UserService {

  readonly BaseURI = environment.apiBaseUrl;

  private BehaviourSubjectcurrentUser :         BehaviorSubject<User>;     

  public obscurrentUser:                        Observable<User>;


  constructor(private fb:                       UntypedFormBuilder,
              private http:                     HttpClient,
              private svcEmitter:               EventEmitterService) {
                this.BehaviourSubjectcurrentUser = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')!));
                this.obscurrentUser = this.BehaviourSubjectcurrentUser.asObservable();
               }

  public get currentUser(): User {
    return this.BehaviourSubjectcurrentUser.value;
  }

  formModel = this.fb.group(
    {
        UserName:                                 ['', Validators.required],
        Email:                                    ['', Validators.email],
        FullName:                                 [''],
        Passwords:  this.fb.group({
                            Password:             ['', [Validators.required, Validators.minLength(4)]],
                            ConfirmPassword:      ['', Validators.required]
                    },
        {
          validator: this.comparePasswords
        }) 
    });


  Login(formData: any) {

    let obsLoginPersona$ = this.http.post<User>(this.BaseURI  +'ApplicationUser/Login', formData )
      .pipe(timeout(6000))  //è il timeout oltre il quale viene dato l'errore
      .pipe(
        tap(
          user => {
            if (user && user.token) {
              user.personaID = user.persona!.id;
              user.fullname = user.persona!.nome + " " + user.persona!.cognome;
              localStorage.setItem('token', user.token!);
              localStorage.setItem('currentUser', JSON.stringify(user));
              this.BehaviourSubjectcurrentUser.next(user);
            }
            else{
              this.Logout();
            }
          }
        )
      );
    return obsLoginPersona$;
  }

  Logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('AnnoCorrente');
    this.svcEmitter.onLogout();
  }


    //questo metodo si chiama getFotoByUserID e non getByUserID come il metodo relativo nel WS perchè lo abbiamo messo nel service user e non in un service Foto
    getFotoByUserID(userID: string): Observable<_UT_UserFoto>{
      return this.http.get<_UT_UserFoto>(environment.apiBaseUrl+'_UT_UsersFoto/GetByUserID/' + userID);
      //http://213.215.231.4/swappX/api/_UT_UsersFoto/GetByUserID/75b01815-1282-4459-bbf5-61bc877a9100
    }
  
    
    getByUsernameAndTmpPassword(userName: string, tmpPassword: string): Observable<User>{
      return this.http.get<User>(environment.apiBaseUrl+'ApplicationUser/GetByUsernameAndTmpPassword/' + userName + '/'+ tmpPassword);
      //http://213.215.231.4/swappX/api/ApplicationUser/GetByUsernameAndTmpPassword/a/ciccione
    }

    getByUsername(userName: string): Observable<User>{
      return this.http.get<User>(environment.apiBaseUrl+'ApplicationUser/GetByUsername' + userName);
      //http://213.215.231.4/swappX/api/ApplicationUser/GetByUsername/a
    }

    getByPersonaID(personaID: number): Observable<User>{
      return this.http.get<User>(environment.apiBaseUrl+'ApplicationUser/GetByPersonaID/' + personaID);
      //http://213.215.231.4/swappX/api/ApplicationUser/GetByPersonaID/19
    }
    
    getByMailAddress(mailAddress: string): Observable<User>{
      return this.http.get<User>(environment.apiBaseUrl+'ApplicationUser/GetByMailAddress/' + mailAddress);
      //http://213.215.231.4/swappX/api/ApplicationUser/GetByMailAddress/nicola.cardi@gmail.com
    }

    put(formData: any): Observable <any>{
      return this.http.put(environment.apiBaseUrl +'ApplicationUser/'+ formData.userID, formData );
    }

    post(formData: any): Observable <any>{
      return  this.http.post(environment.apiBaseUrl +'ApplicationUser/Register', formData );
    }
    
    delete(userID: string): Observable <any>{
      return this.http.delete( environment.apiBaseUrl  + 'ApplicationUser/' + userID);    
    }

  save(formData: any): Observable<any>{    

    if(formData.id == null || formData.id <= 0){
      return this.http.post(environment.apiBaseUrl+'_UT_UsersFoto', formData);
    }
    else {
      return this.http.put(environment.apiBaseUrl+'_UT_UsersFoto/' + formData.id, formData);
    }
  }

  comparePasswords(fb: UntypedFormGroup )
  {
    let confirmPasswordCtrl = fb.get('ConfirmPassword');    
  }
}


