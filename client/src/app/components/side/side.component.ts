import { Component, OnInit, OnDestroy } from '@angular/core';
import { TokenService } from '../../services/token.service';
import { UsersService } from '../../services/users.service';
import io from 'socket.io-client';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side',
  templateUrl: './side.component.html',
  styleUrls: ['./side.component.css']
})
export class SideComponent implements OnInit, OnDestroy {
  socket: any;
  user: any;
  userData: any;
  gSub: Subscription;

  constructor(private tokenService: TokenService, private usersService: UsersService) {
    this.socket = io();
  }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.GetUser();
    this.socket.on('refreshPage', () => {
      this.GetUser();
    });
  }

  ngOnDestroy() {
    if(this.gSub) {
      this.gSub.unsubscribe();
    }
  }

  GetUser() {
    this.gSub = this.usersService.GetUserById(this.user._id).subscribe(data => {
      this.userData = data.result;
    });
  }

}
