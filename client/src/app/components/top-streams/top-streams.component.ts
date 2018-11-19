import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from '../../services/post.service';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import io from 'socket.io-client';
import _ from 'lodash';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

const STEP = 3;

@Component({
  selector: 'app-top-streams',
  templateUrl: './top-streams.component.html',
  styleUrls: ['./top-streams.component.css']
})
export class TopStreamsComponent implements OnInit, OnDestroy {
  topPosts = [];
  socket: any;
  user: any;
  offset = 0;
  limit = STEP;
  loading = false;
  reloading = false;
  noMorePosts = false;
  aSub: Subscription;
  lSub: Subscription;

  constructor(private postService: PostService, private tokenService: TokenService, private router: Router) {
    // this.socket = io();
    this.socket = io(environment.ioAddress);
  }

  ngOnInit() {
    this.reloading = true;
    this.loading = false;
    this.user = this.tokenService.GetPayload();
    this.AllPosts();

    this.socket.on('refreshPage', (data) => {
      this.AllPosts();
    });
  }

  ngOnDestroy() {
    if(this.aSub) {
      this.aSub.unsubscribe();
    }

    if(this.lSub) {
      this.lSub.unsubscribe();
    }
  }

  AllPosts() {
    // this.reloading = true;
    this.loading = true;
    const params = {
      offset: 0,
      limit: this.limit + this.offset
    };
    this.aSub = this.postService.getAllPosts(params).subscribe(data => {
      this.loading = false;
      this.reloading = false;
      this.topPosts = data.top;
      this.noMorePosts = data.top.length < (this.limit + this.offset);
    }, err => {
      if(err.error.token === null) {
        this.loading = false;
        this.reloading = false;
        this.tokenService.DeleteToken();
        this.router.navigate(['']);
      }
    });
  }

  GetPosts() {
    // this.reloading = true;
    // this.loading = true;
    const params = {
      offset: 0,
      limit: this.limit + this.offset
    };

    this.aSub = this.postService.getAllPosts(params).subscribe(data => {
      this.loading = false;
      this.reloading = false;
      // this.posts = _.uniqBy(this.posts.concat(data.posts), 'post');
      this.topPosts = data.top;
      this.noMorePosts = data.top.length < (this.limit + this.offset);
    }, err => {
      this.loading = false;
      this.reloading = false;
      if(err.error.token === null) {
        this.tokenService.DeleteToken();
        this.router.navigate(['']);
      }
    });
  }

  LoadMore() {
    this.offset += STEP;
    this.AllPosts();
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  CheckInArray(arr, username) {
    return _.some(arr, {username: username});
  }

  LikePost(post, username) {
    if(this.CheckInArray(post.likes, username)) {
      this.UnlikePost(post);
    } else {
      this.lSub = this.postService.addLike(post).subscribe(data => {
        this.GetPosts();
      }, err => console.log(err));
    }
  }

  UnlikePost(post) {
    this.lSub = this.postService.removeLike(post).subscribe(data => {
      this.GetPosts();
    }, err => console.log(err));
  }

  OpenCommentBox(post) {
    this.router.navigate(['post', post._id]);
  }

}
