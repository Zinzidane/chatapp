import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { ActivatedRoute } from '@angular/router';
import io from 'socket.io-client';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit, AfterViewInit, OnDestroy {
  toolbarElement: any;
  socket: any;
  commentForm: FormGroup;
  postId: any;
  post: string;
  commentsArray = [];
  aSub: Subscription;
  gSub: Subscription;

  constructor(private fb: FormBuilder, private postService: PostService, private route: ActivatedRoute) {
    this.socket = io();
    this.commentForm = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.toolbarElement = document.querySelector('.nav-content');
    this.postId = this.route.snapshot.paramMap.get('id');
    // this.init();

    this.GetPost();
    this.socket.on('refreshPage', data => {
      this.GetPost();
    });
  }

  ngAfterViewInit() {
    this.toolbarElement.style.display = 'none';
  }

  ngOnDestroy() {
    this.toolbarElement.style.display = 'block';
    if(this.gSub) {
      this.gSub.unsubscribe();
    }

    if(this.aSub) {
      this.aSub.unsubscribe();
    }

  }

  // init() {
  //   this.commentForm = this.fb.group({
  //     comment: ['', Validators.required]
  //   });
  // }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  AddComment() {
    this.aSub = this.postService.addComment(this.postId, this.commentForm.value.comment).subscribe(data => {
      this.socket.emit('refresh', {});
      this.commentForm.reset();
    }, err => console.log(err));
  }

  GetPost() {
    this.gSub = this.postService.getPost(this.postId).subscribe(data => {
      this.post = data.post.post;
      this.commentsArray = data.post.comments.reverse();
      console.log(this.commentsArray);
    })
  }
}
