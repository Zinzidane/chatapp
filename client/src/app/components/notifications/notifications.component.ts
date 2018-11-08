import { Component, OnInit, OnDestroy } from '@angular/core';
import { TokenService } from '../../services/token.service';
import { UsersService } from '../../services/users.service';
import io from 'socket.io-client';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  socket: any;
  user: any;
  notifications = [];
  gSub: Subscription;
  mSub: Subscription;
  dSub: Subscription;
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

    if(this.mSub) {
      this.mSub.unsubscribe();
    }

    if(this.dSub) {
      this.dSub.unsubscribe();
    }

  }

  GetUser() {
    this.loading = true;
    this.gSub = this.usersService.GetUserById(this.user._id).subscribe(data => {
      this.notifications = data.result.notifications.reverse();
      this.loading = false;
    }, err => {
      this.loading = false;
    });
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  MarkNotification(notification) {
    this.mSub = this.usersService.MarkNotification(notification._id).subscribe(data => {
      this.socket.emit('refresh', {});
    });
  }

  DeleteNotification(notification) {
    this.dSub = this.usersService.MarkNotification(notification._id, true).subscribe(data => {
      this.socket.emit('refresh', {});
    });
  }
}
