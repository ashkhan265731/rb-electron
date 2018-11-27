import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  serviceUrl = 'https://racebox.herokuapp.com';
  loginUser: any = {};
  loginMsg: any;
  
 
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,

  ) { }

  ngOnInit() {
    
  }

  login() {
    console.log('Login in called');
    var current = this;
    var res = this.http.post(this.serviceUrl + "/loginuser", this.loginUser)
      .subscribe(function (loginResponse) {
        if (loginResponse != null) {
          if (typeof (Storage) !== "undefined") {
            sessionStorage.setItem("user", JSON.stringify(loginResponse));
          }
          var user = JSON.parse(sessionStorage.getItem("user"));

          if (user.user_type == "producer") {
            current.loginMsg = "Username logged in";
            current.router.navigate(["home"]);
          }
          else {
            current.loginMsg = "User is not producer";
          }

        } else {
          current.loginMsg = "Username or password is incorrect";
        }
      });
  }

}
