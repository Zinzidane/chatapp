import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import * as M from 'materialize-css';
import { UsersService } from '../../services/users.service';
import { ActivatedRoute, Router } from '@angular/router';
import io from 'socket.io-client';
import _ from 'lodash';
import * as moment from 'moment';
import { TokenService } from '../../services/token.service';
import { Subscription } from 'rxjs';
import { PostService } from 'src/app/services/post.service';
import { environment } from '../../../environments/environment';

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
  viewUser: any;
  name: any;
  gSub: Subscription;
  lSub: Subscription;
  uSub: Subscription;
  pSub: Subscription;
  socket: any;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private tokenService: TokenService,
    private postService: PostService,
    private route: ActivatedRoute) {
    this.socket = io(environment.ioAddress);
  }

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

    this.socket.on('refreshPage', (data) => {
      this.route.params.subscribe(params => {
        this.name = params.name;
        this.GetUserData(this.name);
      });
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
    if(this.lSub) {
      this.lSub.unsubscribe();
    }

    if(this.pSub) {
      this.pSub.unsubscribe();
    }
    if(this.uSub) {
      this.uSub.unsubscribe();
    }
  }

  GetUserData(name) {
    this.gSub = this.usersService.GetUserByName(name).subscribe(data => {
      this.viewUser = data.result;
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

  CheckInArray(arr, username) {
    return _.some(arr, {username: username});
  }


  LikePost(post, username) {
    if(this.CheckInArray(post.likes, username)) {
      this.UnlikePost(post);
    } else {
      this.lSub = this.postService.addLike(post).subscribe(data => {
        this.socket.emit('refresh');
      }, err => console.log(err));
    }
  }

  UnlikePost(post) {
    this.uSub = this.postService.removeLike(post).subscribe(data => {
      this.socket.emit('refresh');
    }, err => console.log(err));
  }


  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  OpenCommentBox(post) {
    this.router.navigate(['post', post._id]);
  }

}
