import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '../../services/post.service';
import {CommentsComponent} from './comments.component';

describe('CommentsComponent', () => {
  var component: CommentsComponent;
  var postService: PostService;
  var route: ActivatedRoute

  beforeEach(() => {
    component = new CommentsComponent(new FormBuilder(), postService, route);
  });

  it('should create a form with 1 control', () => {
    expect(component.commentForm.contains('comment')).toBeTruthy();
  });

  it('should make comment control required', () => {
    let control = component.commentForm.get('comment');

    control.setValue('');

    expect(control.valid).toBeFalsy();
  });
});
