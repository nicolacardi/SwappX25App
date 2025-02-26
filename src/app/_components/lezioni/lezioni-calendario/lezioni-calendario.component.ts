

import { Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import itLocale                                 from '@fullcalendar/core/locales/it';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CAL_Lezione } from 'src/app/_models/CAL_Lezione';
import { LezioniService } from '../lezioni.service';
import { TitleService } from 'src/app/_services/title.service';
import { LoadingServiceIonic } from '../../utilities/loading/loadingIonic.service';

@Component({
  selector: 'app-lezioni-calendario',
  templateUrl: './lezioni-calendario.component.html',
  styleUrls: ['../lezioni.scss'],
  standalone: false
})
export class LezioniCalendarioComponent implements OnInit{
  classeSezioneAnnoID!:                     string;
  private originalOrientation: string | null = null;
  Events: any[] = [];
  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent;


  constructor(
          private route:                    ActivatedRoute,
          private svcLezioni:               LezioniService,
          private _loadingService:          LoadingServiceIonic,
          private svcTitle:                 TitleService
  ) { }

  // ngOnInit() {

  //   let obsLezioni$: Observable<CAL_Lezione[]>;
    
  //   this.route.paramMap.subscribe(params => {
  //     this.classeSezioneAnnoID = params.get('id') ?? '';
  //     if (this.classeSezioneAnnoID) {
  //       console.log('ClasseSezioneAnnoID ricevuto:', this.classeSezioneAnnoID);
  //     } else {
  //       console.error('Parametro id non trovato!');
  //     }
  //   });


  // }

  ngOnInit() {

    this.svcTitle.setTitle(`Orario`);
    this.route.paramMap.subscribe(params => {
      const classeSezioneAnnoIDStr = params.get('classeSezioneAnnoID') ?? '';
      const classeEsezione = params.get('classeEsezione') ?? '';
      this.svcTitle.setTitle(`Orario: `+ classeEsezione);
      const classeSezioneAnnoID = parseInt(classeSezioneAnnoIDStr, 10); // Converte la stringa in numero
  
      if (!isNaN(classeSezioneAnnoID)) {
        console.log('ClasseSezioneAnnoID ricevuto:', classeSezioneAnnoID);
  
        const obsLezioni$ = this.svcLezioni.listByClasseSezioneAnno(classeSezioneAnnoID);
        const loadLezioni$ = this._loadingService.showLoaderUntilCompleted(obsLezioni$);
  
        loadLezioni$.subscribe(
          val => {
            this.Events = val;
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
    ]
  };

  

  ionViewDidEnter() {
    setTimeout(() => {
      this.calendarComponent?.getApi().updateSize();
    }, 300);
  }


  

}
