import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient) { }

  addPost(body): Observable<any> {
    return this.http.post(`/api/chatapp/post/add-post`, body);
  }

  getAllPosts(params: any = {}): Observable<any> {
    return this.http.get(`/api/chatapp/posts`, {
      params: new HttpParams({
        fromObject: params
      })
    });
  }

  addLike(body): Observable<any> {
    return this.http.post(`/api/chatapp/post/add-like`, body);
  }

  addComment(postId, comment): Observable<any> {
    return this.http.post(`/api/chatapp/post/add-comment`, {postId, comment});
  }

  getPost(id): Observable<any> {
    return this.http.get(`/api/chatapp/post/${id}`);
  }
}
