import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { UsersService } from '../../services/users.service';
import _ from 'lodash';
import { TokenService } from '../../services/token.service';
import io from 'socket.io-client';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit, AfterViewInit, OnDestroy {
  socket: any;
  users = [];
  loggedInUser: any;
  userArr = [];
  onlineUsersArr = [];
  getUserSub: Subscription;
  getUsersSub: Subscription;
  fSub: Subscription;
  vSub: Subscription;
  loading = false;

  constructor(private userService: UsersService, private tokenService: TokenService, private router: Router) {
    this.socket = io(environment.ioAddress);
  }

  ngOnInit() {
    this.loggedInUser = this.tokenService.GetPayload();
    this.GetUsers();
    this.GetUser();

    this.socket.on('refreshPage', () => {
      this.GetUsers();
      this.GetUser();
    });
  }

  ngAfterViewInit() {
    this.socket.on('usersOnline', (data) => {
      this.onlineUsersArr = data;
    });
  }

  ngOnDestroy() {
    if(this.getUserSub) {
      this.getUserSub.unsubscribe();
    }

    if(this.getUsersSub) {
      this.getUsersSub.unsubscribe();
    }

    if(this.fSub) {
      this.fSub.unsubscribe();
    }

    if(this.vSub) {
      this.vSub.unsubscribe();
    }

  }

  GetUsers() {
    this.loading = true;
    this.getUsersSub = this.userService.GetAllUsers().subscribe(data => {
      _.remove(data.result, {username: this.loggedInUser.username});
      this.users = data.result;
      this.loading = false;
    }, err => {
      this.loading = false;
      console.log(err);
    });
  }

  GetUser() {
    this.loading = true;
    this.getUserSub = this.userService.GetUserById(this.loggedInUser._id).subscribe(data => {
      this.userArr = data.result.following;
      this.loading = false;
    }, err => {
      this.loading = false;
      console.log(err);
    });
  }

  FollowUser(user) {
    this.fSub = this.userService.FollowUser(user._id).subscribe(data => {
      this.socket.emit('refresh', {});
    });
  }

  CheckInArray(arr, id) {
    const result = _.find(arr, ['userFollowed._id', id]);
    if(result) {
      return true;
    } else {
      return false;
    }
  }

  // online(event) {
  //   this.onlineUsersArr = event;
  // }

  CheckIfOnline(name) {
    const result = _.indexOf(this.onlineUsersArr, name);
    if(result > -1) {
      return true;
    } else {
      return false;
    }
  }

  ViewUser(user) {
    this.router.navigate([user.username]);
    if(this.loggedInUser.username !== user.username) {
      this.vSub = this.userService.ProfileNotifications(user._id).subscribe(data => {
        this.socket.emit('refresh', {});
      }, err => console.log(err));
    }
  }
}
