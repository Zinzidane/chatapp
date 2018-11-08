import { Component, OnInit, OnDestroy } from '@angular/core';
import { TokenService } from '../../services/token.service';
import { UsersService } from '../../services/users.service';
import io from 'socket.io-client';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrls: ['./following.component.css']
})
export class FollowingComponent implements OnInit, OnDestroy {
  socket: any;
  following = [];
  user: any;
  gSub: Subscription;
  uSub: Subscription;
  loading = false;

  constructor(private tokenService: TokenService, private usersService: UsersService) {
    this.socket = io(environment.ioAddress);
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

    if(this.uSub) {
      this.uSub.unsubscribe();
    }

  }

  GetUser() {
    this.loading = true;
    this.gSub = this.usersService.GetUserById(this.user._id).subscribe(data => {
        this.following = data.result.following;
        this.loading = false;
    }, err => {
      this.loading = false;
      console.log(err);
    });
  }

  UnfollowUser(user) {
    this.uSub = this.usersService.UnfollowUser(user._id).subscribe(data => {
      this.socket.emit('refresh', {});
    });
  }
}
