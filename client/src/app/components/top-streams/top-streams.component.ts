import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from '../../services/post.service';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import io from 'socket.io-client';
import _ from 'lodash';
import { Subscription } from 'rxjs';

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
    this.socket = io();
  }

  ngOnInit() {
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
    this.reloading = true;
    this.loading = true;
    const params = {
      offset: 0,
      limit: this.limit + this.offset
    };
    this.aSub = this.postService.getAllPosts(params).subscribe(data => {
      this.loading = false;
      this.reloading = false;
      this.topPosts = data.top;
      this.noMorePosts = data.top.length < STEP;
    }, err => {
      if(err.error.token === null) {
        this.loading = false;
        this.reloading = false;
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

  LikePost(post) {
    this.lSub = this.postService.addLike(post).subscribe(data => {
      this.socket.emit('refresh', {});
    }, err => console.log(err));
  }

  OpenCommentBox(post) {
    this.router.navigate(['post', post._id]);
  }

}
