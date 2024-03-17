import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  name = '';
  username = '';
  email = '';
  password = '';
  invalidCredentials = false;
  emptyCredentials = false;
  invalidEmail = false;
  toggle = true;
  signupToggle = false;
  status = 'Enable';
  baseURL: string = "http://localhost:3000";

  constructor(private http: HttpClient) { }

  ngOnInit() { }

  handleClear(){
    this.name = '';
    this.username = '';
    this.email = '';
    this.password = '';
    this.invalidEmail = false;
    this.invalidCredentials = false;
    this.emptyCredentials = false;
  }

  loginEnableDisableRule() {
    this.toggle = true;
    this.signupToggle = false;
    this.toggle = !this.toggle;
  }

  signUpEnableDisableRule() {
    this.toggle = false;
    this.signupToggle = true;
    this.toggle = !this.toggle;
  }

  AddNewUser() {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!this.username || !this.password) {
      this.handleClear();
      this.emptyCredentials = true;

    }
    else if (!this.email.match(emailRegex)) {
      this.invalidEmail = true;
    } else {
      let data = { username: this.username, password: this.password };

      this.http.post(`${this.baseURL}/api/signup`, data, {responseType: 'text'}).subscribe(response => {
        console.log(response);
        this.handleClear();

        if (response == "duplicate username") {
          this.invalidCredentials = true;
        } else {
          alert("Added New User.");1
        }
      }, error => {
        alert("Unable to Sign Up.");
        console.log(error);
      });
      
    }
  }
}
