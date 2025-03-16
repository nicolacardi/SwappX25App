import { NgModule }                                      from '@angular/core';
import { PreloadAllModules, RouterModule, Routes }       from '@angular/router';
import { LoginComponent }                                from './_user/login/login.component';
import { LoginPageComponent }                            from './_user/login-page.component';
import { MieScadenzeComponent }                          from './_components/scadenze/miescadenze/miescadenze.component';
import { ProfiloComponent }                              from './_user/profilo/profilo.component';
import { FigliComponent }                                from './_components/alunni/figli/figli.component';
import { LezioniCalendarioComponent }                    from './_components/lezioni/lezioni-calendario/lezioni-calendario.component';
import { PagamentiListComponent }                        from './_components/pagamenti/pagamenti-list/pagamenti-list.component';
import { PresenzeAlunnoListComponent }                   from './_components/lezioni/presenze-alunno-list/presenze-alunno-list.component';
import { DocumentiComponent }                            from './_components/documenti/documenti.component';
import { ClassiComponent }                               from './_components/classi/classi.component';
import { AlunniListComponent } from './_components/alunni/alunni-list/alunni-list.component';


const routes: Routes = [
  

  { path: '', redirectTo: 'user/login', pathMatch: 'full' },

  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  
  {
    //  { path:'user' , redirectTo: 'user/login', pathMatch: 'full' },
    path: 'user',                               component: LoginPageComponent,
    children: [
      { path: 'login',                          component: LoginComponent },
    ]
  },

  { path:'scadenze',                             component: MieScadenzeComponent },

  { path:'orario',                                component: LezioniCalendarioComponent },

  { path:'figli',                                 component: FigliComponent },

  { path:'classi',                                component: ClassiComponent },
  
  { path: "profilo",                              component: ProfiloComponent },

  {path: 'alunni/:classeSezioneAnnoID/:classeEsezione',            component: AlunniListComponent },

  {path: 'orario/:classeSezioneAnnoID/:classeEsezione',            component: LezioniCalendarioComponent },

  { path: 'pagamenti/:alunnoID/:annoID',          component: PagamentiListComponent },

  { path: 'presenze/:alunnoID/:annoID',           component: PresenzeAlunnoListComponent },

  { path: 'documenti/:alunnoID',                  component: DocumentiComponent }



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
