import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  passwordForm: FormGroup;
  cSub: Subscription;

  constructor(private fb: FormBuilder, private usersService: UsersService) { }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    if(this.cSub) {
      this.cSub.unsubscribe();
    }
  }

  init() {
    this.passwordForm = this.fb.group({
      cpassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.ValidateForm.bind(this)
    });
  }

  ChangePassword() {
    this.cSub = this.usersService.ChangePassword(this.passwordForm.value).subscribe(data => {
      this.passwordForm.reset();
    }, err => console.log(err));
  }

  ValidateForm(form: FormGroup) {
    const newPassword = form.controls.newPassword.value;
    const confirmPassword = form.controls.confirmPassword.value;

    if(confirmPassword.length <= 0) {
      return null;
    }

    if(confirmPassword !== newPassword) {
      return {
        doesNotMatch: true
      };
    }

    return null;
  }

}
