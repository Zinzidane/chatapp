import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import * as M from 'materialize-css';
import { UsersService } from '../../services/users.service';
import * as moment from 'moment';
import io from 'socket.io-client';
import _ from 'lodash';
import { MessageService } from '../../services/message.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, OnDestroy {
  // @Output() onlineUsers = new EventEmitter();
  user: any;
  notifications = [];
  socket: any;
  count = [];
  chatList = [];
  msgNumber = 0;
  imageId: any;
  imageVersion: any;
  mSub: Subscription;
  markSub: Subscription;
  markAllSub: Subscription;
  gSub: Subscription;

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private usersService: UsersService,
    private msgService: MessageService
  ) {
    this.socket = io(environment.ioAddress);
  }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();

    this.GetUser();

    const dropdownElement = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(dropdownElement, {
      alignment: 'right',
      hover: true,
      coverTrigger: false
    });

    const dropdownElementTwo = document.querySelectorAll('.dropdown-trigger1');
    M.Dropdown.init(dropdownElementTwo, {
      alignment: 'right',
      hover: true,
      coverTrigger: false
    });

    this.socket.emit('online', {room: 'global', user: this.user.username});

    this.socket.on('refreshPage', () => {
      this.GetUser();
    });
  }

  ngOnDestroy() {
    if(this.mSub) {
      this.mSub.unsubscribe();
    }

    if(this.markSub) {
      this.markSub.unsubscribe();
    }

    if(this.markAllSub) {
      this.markAllSub.unsubscribe();
    }

    if(this.gSub) {
      this.gSub.unsubscribe();
    }

  }

  // ngAfterViewInit() {
  //   this.socket.on('usersOnline', (data) => {
  //     this.onlineUsers.emit(data);
  //   });
  // }

  GetUser() {
    this.gSub = this.usersService.GetUserById(this.user._id).subscribe(data => {
      this.imageId = data.result.picId;
      this.imageVersion = data.result.picVersion;
      this.notifications = data.result.notifications.reverse();
      const value = _.filter(this.notifications, ['read', false]);
      this.count = value;
      this.chatList = data.result.chatList;

      this.CheckIfRead(this.chatList);
    }, err => {
      if(err.error.token === null) {
        this.tokenService.DeleteToken();
        this.router.navigate(['']);
      }
    });
  }

  logout() {
    this.tokenService.DeleteToken();
    this.router.navigate(['/']);
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  GoToHome() {
    this.router.navigate(['streams']);
  }

  GoToChatPage(name) {
    this.router.navigate(['chat', name]);
    this.mSub = this.msgService.MarkMessages(this.user.username, name).subscribe(data => {
      this.socket.emit('refresh', {});
    });
  }

  MarkAll() {
    this.markSub = this.usersService.MarkAllAsRead().subscribe(data => {
      this.socket.emit('refresh', {});
    });
  }

  MarkAllMessages() {
    this.markAllSub = this.msgService.MarkAllMessages().subscribe(data => {
      this.socket.emit('refresh', {});
      this.msgNumber = 0;
    });
  }

  CheckIfRead(arr) {
    const checkArr = [];

    for(let i = 0;i < arr.length; i++) {
      const receiver = arr[i].msgId.message[arr[i].msgId.message.length - 1];

      // Check if user is not on chat page
      if(this.router.url !== `/chat/${receiver.senderName}`) {
        if(receiver.isRead === false && receiver.receiverName === this.user.username) {
          checkArr.push(1);
          this.msgNumber = _.sum(checkArr);
        }
      }
    }
  }

  MessageDate(date) {
    return moment(date).calendar(null, {
      sameDay: '[Today]',
      lastDay: '[Yesterday]',
      lastWeek: 'DD/MM/YYYY',
      sameElse: 'DD/MM/YYYY'
    });
  }
}
