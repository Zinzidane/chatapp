import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  signupForm: FormGroup;
  errorMessage: string;
  showSpinner = false;
  sSub: Subscription;

  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router, private tokenService: TokenService) { }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    if(this.sSub) {
      this.sSub.unsubscribe();
    }
  }

  init() {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      password: ['', Validators.required]
    });
  }

  signupUser() {
    this.showSpinner = true;
    this.sSub = this.authService.registerUser(this.signupForm.value).subscribe(data => {
        this.tokenService.SetToken(data.token);
        this.signupForm.reset();
        this.router.navigate(['streams']);
      }, err => {
        this.showSpinner = false;
        if(err.error.msg) {
          this.errorMessage = err.error.msg[0].message;
        }

        if(err.error.message) {
          this.errorMessage = err.error.message;
        }
      });
  }

}
