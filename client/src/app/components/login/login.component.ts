import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  errorMessage: string;
  showSpinner = false;
  lSub: Subscription;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private tokenService: TokenService) { }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    if(this.lSub) {
      this.lSub.unsubscribe();
    }

  }

  init() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  loginUser() {
    this.showSpinner = true;
    this.lSub = this.authService.loginUser(this.loginForm.value).subscribe(data => {
      this.tokenService.SetToken(data.token);
      this.loginForm.reset();
      this.router.navigate(['streams']);
    }, err => {
      this.showSpinner = false;

      if(err.error.message) {
        this.errorMessage = err.error.message;
      }
    })
  }

}
