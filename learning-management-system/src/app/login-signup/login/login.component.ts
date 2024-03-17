import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../app/shared/services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  invalidCredentials = false;
  emptyCredentials = false
  toggle = true;
  signupToggle = false;
  baseURL: string = "http://localhost:3005";
  adminRole: any;

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit() {
    this.adminRole = this.dataService.ADMIN_ROLES;
    localStorage.clear();
  }

  handleClear() {
    this.username = '';
    this.password = '';
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

  validateLoginCredentials() {
    if (!this.username || !this.password) {
      this.handleClear();
      this.emptyCredentials = true;
    } else {
      let data = { username: this.username, password: this.password };

      this.dataService.processPostRequest('login', data, false).subscribe((response: any) => {
        console.log(response);
        this.handleClear();

        if (response['error'] == "Not found") {
          console.log(response);
          console.log(response['error']);
          this.invalidCredentials = true;
        } else {
          localStorage.setItem('currentUser', response['role']);
          localStorage.setItem('sessionToken', response['token']);
          localStorage.setItem('username', response['username']);
          localStorage.setItem('userImage', response['image']);
          localStorage.setItem('userDisplayName', response['displayName']);
          console.log(localStorage.getItem('currentUser'));

          if (this.adminRole.includes(response['role'])) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/assigned-tasks']);
          }
        }
      }, error => {
        alert("Unable to Login.");
        console.log(error);
      });
    }
  }

}
