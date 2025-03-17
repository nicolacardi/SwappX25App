

import { Component, OnChanges, OnInit, ViewChild }       from '@angular/core';
import { CalendarOptions, EventClickArg }                from '@fullcalendar/core';
import { FullCalendarComponent }                         from '@fullcalendar/angular';

import dayGridPlugin                                     from '@fullcalendar/daygrid';
import timeGridPlugin                                    from '@fullcalendar/timegrid';
import listPlugin                                        from '@fullcalendar/list';
import interactionPlugin                                 from '@fullcalendar/interaction';
import itLocale                                          from '@fullcalendar/core/locales/it';
import { ActivatedRoute }                                from '@angular/router';

import { LezioniService }                                from '../lezioni.service';
import { TitleService }                                  from 'src/app/_services/title.service';
import { LoadingServiceIonic }                           from '../../utilities/loading/loadingIonic.service';
import { ModalController }                               from '@ionic/angular';
import { LezioneComponent }                              from '../lezione-edit/lezione-edit.component';
import { ToastService }                                  from 'src/app/_services/toast.service';


@Component({
  selector: 'app-lezioni-calendario',
  templateUrl: './lezioni-calendario.component.html',
  styleUrls: ['../lezioni.scss'],
  standalone: false
})
export class LezioniCalendarioComponent implements OnInit{
  docenteID!:                               number;
  classeSezioneAnnoID!:                     string;
  private originalOrientation: string | null = null;
  Events: any[] = [];
  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent;


  constructor(
          private route                : ActivatedRoute,
          private svcLezioni           : LezioniService,
          private _loadingService      : LoadingServiceIonic,
          private svcTitle             : TitleService,
          private modalCtrl            : ModalController,
          private _toast               : ToastService,

  ) { }



  ngOnInit() {

    this.svcTitle.setTitle(`Orario`);
    this.route.paramMap.subscribe(params => {
      const classeSezioneAnnoIDStr = params.get('classeSezioneAnnoID') ?? '';
      const classeEsezione = params.get('classeEsezione') ?? '';
      this.svcTitle.setTitle(`Orario: `+ classeEsezione);
      const classeSezioneAnnoID = parseInt(classeSezioneAnnoIDStr, 10); // Converte la stringa in numero


      this.route.queryParamMap.subscribe(queryParams => {
        const docenteIDStr = queryParams.get('docenteID'); 
        this.docenteID = docenteIDStr ? parseInt(docenteIDStr, 10) : 0; // Se presente, lo converte in numero, altrimenti null

        if (!isNaN(classeSezioneAnnoID)) {
          //console.log('lezioni-calendario - ngOnInit - ClasseSezioneAnnoID ricevuto:', classeSezioneAnnoID);
    
          const obsLezioni$ = this.svcLezioni.listByClasseSezioneAnno(classeSezioneAnnoID);
          const loadLezioni$ = this._loadingService.showLoaderUntilCompleted(obsLezioni$);
    
          loadLezioni$.subscribe(
            val => {
              console.log ("lezioni-calendario - ngOnInit lezioni", val);
              if (this.docenteID) { 
                //se sono le lezioni di un docente devo colorare le altre di grigio, altrimenti no
                this.Events = val.map(lezione => ({
                ...lezione, // Copia tutto il contenuto originale dell'oggetto lezione
                //title: lezione.docenteID === this.docenteID ? `✅ ${lezione.title}` : lezione.title,
                //color: lezione.docenteID === this.docenteID ? "#123456" : lezione.color,
                color: lezione.docenteID != this.docenteID ? "#dddddd" : lezione.color,
                }));
              } else {
                this.Events = val;
              }

              this.calendarOptions.events = this.Events;
            },
            error => {
              console.error('Errore nel caricamento delle lezioni:', error);
            }
          );
        } else {
          console.error('Parametro id non valido:', classeSezioneAnnoIDStr);
        }
      });
    });
  }
  
  
  

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    slotMinWidth: 300, 
    allDaySlot:   false,                      //nasconde la riga degli eventi che durano il giorno intero
    height: 650,
    locale:       'it',
    locales:      [itLocale],
    slotMinTime:  '08:00:00',
    slotMaxTime:  '16:00:00',

    expandRows: true,                         //estende in altezza le righe per adattare alla height il calendario
    selectable: false,
    editable: false,

    eventStartEditable: false,
    eventDurationEditable: false,
    eventResizableFromStart: false,


    hiddenDays: [0], // Nasconde la domenica


    headerToolbar: {
      left: 'prev,next,today',
      center: '',
      right: 'timeGridWeek,timeGridDay'  //TODO bisogna togliere i settings dalla vista docente
    }, 
    events: [
      { title: 'Evento di prova', start: new Date() }
    ],


    eventClick:   this.openDetail.bind(this),         //quando si fa click su un evento esistente...
  };

  
  async openDetail(clickInfo: EventClickArg) {

    const docenteIDLezione = clickInfo.event.extendedProps['docenteID']; // ID docente della lezione
    //solo se siamo nella vista per docente qualcosa può funzionare
    if (this.docenteID) {
      console.log("provo ad aprire la lezione");
      if (docenteIDLezione == this.docenteID) {
        const lezioneID = Number(clickInfo.event.id);
        const modal = await this.modalCtrl.create({
          component: LezioneComponent, // Il componente che vuoi aprire nel modale
          componentProps: {
            lezioneID
            //dove: this.dove,
            //docenteID: this.docenteID
          },
          //cssClass: 'add-DetailDialog', // Se vuoi uno stile personalizzato
        });
      
        // Apri il modale
        await modal.present();
      
        // Esegui qualcosa quando il modale viene chiuso
        const { data } = await modal.onWillDismiss();
        // if (data) {
        //   this.loadData();
        // }
      } else {
        this._toast.presentToast ('Si possono aprire solo le proprie lezioni ')
      }
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.calendarComponent?.getApi().updateSize();
    }, 300);
  }


  

}
