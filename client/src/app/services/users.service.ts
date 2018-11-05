import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  GetAllUsers(): Observable<any> {
    return this.http.get(`/api/chatapp/users`);
  }

  GetUserById(id): Observable<any> {
    return this.http.get(`/api/chatapp/user/${id}`);
  }

  GetUserByName(username): Observable<any> {
    return this.http.get(`/api/chatapp/username/${username}`);
  }

  FollowUser(id): Observable<any> {
    return this.http.post(`/api/chatapp/follow-user`, {
      userFollowed: id
    });
  }

  UnfollowUser(id): Observable<any> {
    return this.http.post(`/api/chatapp/unfollow-user`, {
      userFollowed: id
    });
  }

  MarkNotification(id, deleteValue?): Observable<any> {
    return this.http.post(`/api/chatapp/mark/${id}`, {id, deleteValue});
  }

  MarkAllAsRead(): Observable<any> {
    return this.http.post(`/api/chatapp/mark-all`, {all: true});
  }

  AddImage(image): Observable<any> {
    return this.http.post(`/api/chatapp/upload-image`, {image});
  }

  SetDefaultImage(imageId, imageVersion): Observable<any> {
    return this.http.get(`/api/chatapp/set-default-image/${imageId}/${imageVersion}`);
  }

  ProfileNotifications(id): Observable<any> {
    return this.http.post(`/api/chatapp/user/view-profile`, {id});
  }

  ChangePassword(body): Observable<any> {
    return this.http.post(`/api/chatapp/change-password`, body);
  }
}
