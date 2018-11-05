import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as M from 'materialize-css';
import { UsersService } from '../../services/users.service';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { TokenService } from '../../services/token.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.css']
})
export class ViewUserComponent implements OnInit, AfterViewInit, OnDestroy {
  tabElement: any;
  sideElement: any;
  postsTab = false;
  followingTab = false;
  followersTab = false;
  posts = [];
  following = [];
  followers = [];
  user: any;
  name: any;
  gSub: Subscription;

  constructor(private usersService: UsersService, private tokenService: TokenService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.postsTab = true;
    const tabs = document.querySelector('.tabs');
    M.Tabs.init(tabs, {});
    this.tabElement = document.querySelector('.nav-content');
    this.sideElement = document.querySelector('.sideDiv');

    this.route.params.subscribe(params => {
      this.name = params.name;
      this.GetUserData(this.name);
    });
  }

  ngAfterViewInit() {
    this.tabElement.style.display = 'none';
    this.sideElement.style.display = 'none';
  }

  ngOnDestroy() {
    this.tabElement.style.display = 'block';
    this.sideElement.style.display = 'block';
    if(this.gSub) {
      this.gSub.unsubscribe();
    }

  }

  GetUserData(name) {
    this.gSub = this.usersService.GetUserByName(name).subscribe(data => {
      console.log(data.result);
      this.user = data.result;
      this.posts = data.result.posts.reverse();
      this.followers = data.result.followers;
      this.following = data.result.following;
    }, err => console.log(err));
  }

  ChangeTab(value) {
    if (value === 'posts') {
      this.postsTab = true;
      this.followingTab = false;
      this.followersTab = false;
    }

    if (value === 'following') {
      this.postsTab = false;
      this.followingTab = true;
      this.followersTab = false;
    }

    if (value === 'followers') {
      this.postsTab = false;
      this.followingTab = false;
      this.followersTab = true;
    }
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

}
