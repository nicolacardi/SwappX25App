import { NgModule, isDevMode }                     from '@angular/core';
import { BrowserModule }                           from '@angular/platform-browser';
import { RouteReuseStrategy }                      from '@angular/router';

import { HttpClientModule, HTTP_INTERCEPTORS }     from "@angular/common/http";

import { BrowserAnimationsModule }                 from '@angular/platform-browser/animations';

import { IonicModule, IonicRouteStrategy }         from '@ionic/angular';
import { DialogOkComponent }                       from './_components/utilities/dialog-ok/dialog-ok.component';
import { DialogYesNoComponent }                    from './_components/utilities/dialog-yes-no/dialog-yes-no.component';

import { AppComponent }                            from './app.component';
import { AppRoutingModule }                        from './app-routing.module';
import { LoginComponent }                          from './_user/login/login.component';
import { ReactiveFormsModule }                     from '@angular/forms';
import { LoginPageComponent }                      from './_user/login-page.component';
import { MaterialModule }                          from './_material/material.module';
import { MieScadenzeComponent }                    from './_components/scadenze/miescadenze/miescadenze.component';

import { ToastController }                         from '@ionic/angular';
import { ProfiloComponent }                        from './_user/profilo/profilo.component';
import { PhotocropComponent }                      from './_components/utilities/photocrop/photocrop.component';

import { DragDropModule }                          from '@angular/cdk/drag-drop';
import { ComuniService }                           from './_services/comuni.service';
import { PersonaFormComponent }                    from './_components/persone/persona-form/persona-form.component';
import { ResetPswComponent }                       from './_user/reset-psw/reset-psw.component';
import { AuthInterceptor }                         from './_user/auth/auth.interceptor';
import { HttpErrorInterceptor }                    from './_user/auth/httperror.interceptor';
import { FigliComponent }                          from './_components/alunni/figli/figli.component';
import { FullCalendarModule }                      from '@fullcalendar/angular';
import { LezioniCalendarioComponent }              from './_components/lezioni/lezioni-calendario/lezioni-calendario.component';
import { PagamentiListComponent }                  from './_components/pagamenti/pagamenti-list/pagamenti-list.component';
import { PresenzeAlunnoListComponent }             from './_components/lezioni/presenze-alunno-list/presenze-alunno-list.component';
import { DocumentiComponent }                      from './_components/documenti/documenti.component';
import { DatePipe }                                from '@angular/common';
import { ServiceWorkerModule }                     from '@angular/service-worker';
import { ClassiComponent }                         from './_components/classi/classi.component';
import { LezioneComponent }                        from './_components/lezioni/lezione-edit/lezione-edit.component';
import { PresenzeListComponent } from './_components/lezioni/presenze-list/presenze-list.component';



@NgModule({
  declarations: [
    DialogOkComponent,
    DialogYesNoComponent,
    AppComponent, 
    LoginComponent, 
    LoginPageComponent,
    MieScadenzeComponent,
    ProfiloComponent,
    PhotocropComponent,
    PersonaFormComponent,
    ResetPswComponent,
    FigliComponent,
    LezioniCalendarioComponent,
    PagamentiListComponent,
    PresenzeAlunnoListComponent,
    DocumentiComponent,
    ClassiComponent,
    LezioneComponent,
    PresenzeListComponent
    ],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,     
    ReactiveFormsModule,     
    MaterialModule,     
    HttpClientModule,
    BrowserAnimationsModule,
    DragDropModule,
    FullCalendarModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),

  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    //{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    ToastController,
    ComuniService,
    DatePipe
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
