import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import { TokenService } from 'src/app/services/token.service';
import io from 'socket.io-client';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.css']
})
export class FollowersComponent implements OnInit, OnDestroy {
  followers = [];
  user: any;
  socket: any;
  gSub: Subscription;
  loading = false;

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
    this.loading = true;
    this.gSub = this.usersService.GetUserById(this.user._id).subscribe(data => {
      this.followers = data.result.followers;
      this.loading = false;
    }, err => {
      this.loading = false;
      console.log(err);
    });
  }

}
