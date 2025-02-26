import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./user.scss'],
  standalone: false
})
export class LoginPageComponent  implements OnInit {

  
  routerPage!: string;

  constructor() { }

  ngOnInit() {

    this.routerPage = "login";
  }


  reloadRoutesEmitted(route: string) {
    this.routerPage = route;
  }
}
